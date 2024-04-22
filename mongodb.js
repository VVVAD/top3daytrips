const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mapApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Define MongoDB schema and model
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  selectedCountry: { type: String }
});
const User = mongoose.model('User', userSchema);

// Middleware to parse JSON requests
app.use(bodyParser.json());

// API endpoint to store selected country for a user
app.post('/api/users/:userId/country', async (req, res) => {
  const userId = req.params.userId;
  const selectedCountry = req.body.countryCode;

  try {
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({ userId });
    }
    user.selectedCountry = selectedCountry;
    await user.save();
    res.status(200).send('Selected country saved successfully');
  } catch (error) {
    console.error('Error saving selected country:', error);
    res.status(500).send('Error saving selected country');
  }
});

// API endpoint to retrieve selected country for a user
app.get('/api/users/:userId/country', async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({ userId });
    if (user) {
      res.status(200).json({ selectedCountry: user.selectedCountry });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error retrieving selected country:', error);
    res.status(500).send('Error retrieving selected country');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
