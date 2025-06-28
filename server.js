const express = require('express');
const sequelize = require('./config/database');
const routes = require('./routes');
const cors = require('cors');
require('dotenv').config();
const { initModels } = require('./models/initModels');
const checkPembayaran = require('./jobs/checkPembayaran');
const PenitipanScheduler = require('./utils/penitipanScheduler');
const sendDeliveryNotification = require('./jobs/sendDeliveryNotification');
const { scheduleTopPenitipBadgeUpdate } = require('./utils/topSellerScheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use('/api', routes);
initModels();

const startScheduledTasks = () => {
  setInterval(async () => {
    try {
      await checkPembayaran();
    } catch (error) {
      console.error('Error in checkPembayaran:', error.message);
    }
  }, 1000);

  setInterval(async () => {
    try {
      await sendDeliveryNotification();
    } catch (error) {
      console.error('Error in sendDeliveryNotification:', error.message);
    }
  }, 60 * 1000);

  PenitipanScheduler.init();
  scheduleTopPenitipBadgeUpdate();
};

// Tanpa Sync Database
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    startScheduledTasks();
    console.log(`Server berjalan di port ${PORT}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

// app.listen(PORT, async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Database connected');

//     await sequelize.sync({ alter: true }); // <= Auto migrate tabel
//     console.log('Database synchronized');

//     startScheduledTasks();
//     console.log(`Server berjalan di port ${PORT}`);
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// });

