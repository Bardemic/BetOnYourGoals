const express = require('express');
const cors = require('cors');
const Wage = require('./wage');
const auth = require('./auth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

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
    const { user_id, wage_id, name, amount, created_at } = req.body;
    
    if (!user_id || !name || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const wage = new Wage(user_id, wage_id, name, amount, created_at);
    wages.push(wage);
    
    res.status(201).json({ 
      message: 'Wage added successfully',
      wage: wage 
    });
  } catch (error) {
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
