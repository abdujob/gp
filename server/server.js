const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('SendVoyage API is running');
});

// Import Routes
const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ads');
const messageRoutes = require('./routes/messages');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/messages', messageRoutes);

// Static for uploads
app.use('/uploads', express.static('uploads'));


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
