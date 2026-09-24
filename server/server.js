const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/disaster_relief_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Mongoose Schema & Model
const reliefRequestSchema = new mongoose.Schema({
  campName: { type: String, required: true },
  region: { type: String, required: true },
  resourceType: {
    type: String,
    enum: ['WATER', 'MEDICAL', 'FOOD', 'SHELTER_BLANKETS'],
    required: true
  },
  quantityNeeded: { type: Number, required: true },
  peopleAffected: { type: Number, required: true },
  urgencyScore: { type: Number, default: 0 },
  status: { type: String, enum: ['PENDING', 'DISPATCHED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

const ReliefRequest = mongoose.model('ReliefRequest', reliefRequestSchema);

// Urgency Score Algorithm
const RESOURCE_WEIGHTS = {
  WATER: 5,
  MEDICAL: 4,
  FOOD: 3,
  SHELTER_BLANKETS: 2
};

const calculateUrgency = (resourceType, peopleAffected, quantityNeeded) => {
  const weight = RESOURCE_WEIGHTS[resourceType] || 1;
  const needPerCapita = quantityNeeded / (peopleAffected || 1);
  return Math.round(peopleAffected * weight * needPerCapita);
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/requests', async (req, res) => {
  try {
    const requests = await ReliefRequest.find({ status: 'PENDING' }).sort({ urgencyScore: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve requests' });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const { campName, region, resourceType, quantityNeeded, peopleAffected } = req.body;
    const urgencyScore = calculateUrgency(resourceType, Number(peopleAffected), Number(quantityNeeded));

    const newRequest = new ReliefRequest({
      campName,
      region,
      resourceType,
      quantityNeeded: Number(quantityNeeded),
      peopleAffected: Number(peopleAffected),
      urgencyScore
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create request', details: err.message });
  }
});

app.patch('/api/requests/dispatch/:id', async (req, res) => {
  try {
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'DISPATCHED' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Request not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Serve Frontend Static Assets (Vite Production Build)
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPA Fallback: Direct any non-API route to client/dist/index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Dynamic Port Binding
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});