const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/disaster_relief_db';

const RequestSchema = new mongoose.Schema({
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
  status: { type: String, enum: ['OPEN', 'DISPATCHED'], default: 'OPEN' }
}, { timestamps: true });

// Weighted priority calculation: Medical & Water carry highest urgency factors
RequestSchema.pre('save', function (next) {
  const resourceWeights = {
    'WATER': 4.0,
    'MEDICAL': 3.5,
    'FOOD': 2.5,
    'SHELTER_BLANKETS': 1.5
  };
  const weight = resourceWeights[this.resourceType] || 1.0;
  this.urgencyScore = Math.round(weight * this.peopleAffected);
  next();
});

const ReliefRequest = mongoose.model('ReliefRequest', RequestSchema);

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    const count = await ReliefRequest.countDocuments();
    if (count === 0) {
      await ReliefRequest.create([
        { campName: 'Sector 4 Riverbank', region: 'North District', resourceType: 'WATER', quantityNeeded: 2500, peopleAffected: 950 },
        { campName: 'Hilltop Community Center', region: 'East Ridge', resourceType: 'MEDICAL', quantityNeeded: 120, peopleAffected: 320 },
        { campName: 'Stadium Camp A', region: 'Central City', resourceType: 'SHELTER_BLANKETS', quantityNeeded: 600, peopleAffected: 400 }
      ]);
    }
  })
  .catch(err => console.error(err));

// Root entry route
app.get('/', (req, res) => {
  res.json({
    message: 'Disaster Relief Resource Allocation API is running',
    endpoints: {
      health: '/api/health',
      requests: '/api/requests'
    }
  });
});

// API Endpoints
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.get('/api/requests', async (req, res) => {
  const requests = await ReliefRequest.find({ status: 'OPEN' }).sort({ urgencyScore: -1 });
  res.json(requests);
});

app.post('/api/requests', async (req, res) => {
  const newReq = new ReliefRequest(req.body);
  await newReq.save();
  res.status(201).json(newReq);
});

app.patch('/api/requests/dispatch/:id', async (req, res) => {
  await ReliefRequest.findByIdAndUpdate(req.params.id, { status: 'DISPATCHED' });
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Disaster Relief API running on port ${PORT}`));