require('dotenv').config();
const express = require('express');
const cors = require('cors');

const complaintRoutes = require('./routes/complaintRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const logRoutes = require('./routes/logRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'HostelMate backend is running' });
});

app.use('/complaints', complaintRoutes);
app.use('/expenses', expenseRoutes);
app.use('/logs', logRoutes);
app.use('/announcements', announcementRoutes);
app.use('/chat', chatRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
