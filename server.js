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

sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synced successfully');
    startScheduledTasks();
    app.listen(PORT, () => {
      console.log(`Server berjalan di port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });