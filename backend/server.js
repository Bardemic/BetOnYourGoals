const express = require('express');
const cors = require('cors');
const Wage = require('./wage');
const auth = require('./auth');
const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// PayPal configuration
let environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
let paypalClient = new paypal.core.PayPalHttpClient(environment);

// Add this debug log
console.log('PayPal Environment:', {
  clientId: process.env.PAYPAL_CLIENT_ID?.substring(0, 10) + '...',
  hasSecret: !!process.env.PAYPAL_CLIENT_SECRET
});

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let wages = [];

app.get('/', (req, res) => {
  res.json({ message: 'Home' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 

app.post('/add-wage', (req, res) => {
  try {
    const { user_id, name, amount, authorization_id, llm_checker, frequency, frequency_unit } = req.body;
    
    if (!user_id || !name || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Generate a unique wage_id
    const wage_id = Math.random().toString(36).substring(2, 15);
    
    // Set creation time on server side
    const created_at = new Date().toISOString();
    //const created_at = new Date('2025-01-15').toISOString(); //for testing

    const wage = new Wage(
      user_id, 
      wage_id, 
      name, 
      amount, 
      created_at,  // Use server-side timestamp
      authorization_id, 
      llm_checker,
      frequency,
      frequency_unit
    );
    wages.push(wage);
    
    res.status(201).json({ 
      message: 'Wage added successfully',
      wage: wage 
    });
  } catch (error) {
    console.error('Error adding wage:', error);
    res.status(500).json({ 
      error: 'Failed to add wage',
      details: error.message 
    });
  }
});

app.get('/get-wages', (req, res) => {
  res.json(wages);
});

app.get('/get-wages/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const user_wages = wages.filter(wage => wage.user_id === user_id);
  res.json(user_wages);
});

app.post('/login', (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const result = auth.login(email, password);
  
  if (result.error) {
    res.status(401).json({ error: result.error });
  } else {
    res.status(200).json({
      message: 'Login successful',
      user: {
        user_id: result.user.id,
        email: result.user.email,
        username: result.user.username
      }
    });
  }
});

app.post('/signup', (req, res) => {
  const { email, password, username } = req.body;
  const result = auth.signup(email, password, username);
  
  if (result.error) {
    res.status(400).json({ error: result.error });
  } else {
    res.status(201).json(result);
  }
});

app.get('/users', (req, res) => {
  const result = auth.getUsers();
  res.json(result);
});

app.post('/create-paypal-order', async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Validate amount
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({ 
        error: 'Invalid amount provided',
        details: { receivedAmount: amount }
      });
    }

    console.log('Creating PayPal order for amount:', amount);
    
    // Create a new client for each request to ensure fresh credentials
    const client = new paypal.core.PayPalHttpClient(
      new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    );
    
    const request = new paypal.orders.OrdersCreateRequest();
    request.headers["prefer"] = "return=representation";
    request.requestBody({
      intent: 'AUTHORIZE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: parseFloat(amount).toFixed(2)
        }
      }]
    });

    console.log('PayPal request body:', JSON.stringify(request.requestBody, null, 2));
    const order = await client.execute(request);
    console.log('PayPal response:', JSON.stringify(order.result, null, 2));

    res.json({ 
      orderId: order.result.id,
      status: order.result.status 
    });
  } catch (error) {
    console.error('PayPal order creation error:', {
      name: error.name,
      message: error.message,
      details: error.details || error,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to create PayPal order',
      details: error.message,
      name: error.name
    });
  }
});

app.post('/authorize-paypal-order', async (req, res) => {
  try {
    const { orderID } = req.body;
    
    const request = new paypal.orders.OrdersAuthorizeRequest(orderID);
    request.prefer("return=representation");
    
    const authorization = await paypalClient.execute(request);
    
    const authorizationId = authorization.result.purchase_units[0].payments.authorizations[0].id;
    
    res.json({ 
      authorizationId: authorizationId,
      status: authorization.result.status
    });
  } catch (error) {
    console.error('Failed to authorize PayPal order:', error);
    res.status(500).json({ error: 'Failed to authorize PayPal order' });
  }
});

app.post('/capture-authorized-payment', async (req, res) => {
  try {
    const { authorizationId } = req.body;
    
    const request = new paypal.payments.AuthorizationsCaptureRequest(authorizationId);
    request.prefer("return=representation");
    
    const capture = await paypalClient.execute(request);
    
    res.json({ 
      captureId: capture.result.id,
      status: capture.result.status
    });
  } catch (error) {
    console.error('Failed to capture authorized payment:', error);
    res.status(500).json({ error: 'Failed to capture authorized payment' });
  }
});

app.post('/void-authorization', async (req, res) => {
  try {
    const { authorizationId } = req.body;
    
    if (!authorizationId) {
      return res.status(400).json({ 
        error: 'Authorization ID is required' 
      });
    }

    console.log('Voiding authorization:', authorizationId);
    
    const request = new paypal.payments.AuthorizationsVoidRequest(authorizationId);
    const response = await paypalClient.execute(request);
    
    // Find and update the wage status
    const wageIndex = wages.findIndex(w => w.authorization_id === authorizationId);
    if (wageIndex !== -1) {
      wages[wageIndex].status = 'cancelled';
    }
    
    console.log('Authorization voided successfully');
    
    res.json({ 
      success: true,
      status: 'VOIDED',
      message: 'Wager cancelled successfully'
    });
  } catch (error) {
    console.error('Failed to void authorization:', {
      name: error.name,
      message: error.message,
      details: error.details || error,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to void authorization',
      details: error.message 
    });
  }
});

app.post('/submit-proof', (req, res) => {
    try {
        const { wage_id } = req.body;
        const wage = wages.find(w => w.wage_id === wage_id);
        if (!wage) {
            return res.status(404).json({ error: 'Wage not found' });
        }
        const today = new Date().toISOString().split('T')[0]; //day on server
        wage.addCompletion(today);
        
        res.json({
            success: true,
            completions: wage.completions
        });
    } catch (error) {
        console.error('Error marking completion:', error);
        res.status(500).json({ error: 'Failed to mark completion' });
    }
});

