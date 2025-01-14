const express = require('express');
const cors = require('cors');
const Wage = require('./wage');
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