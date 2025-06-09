const cron = require('node-cron');
const { updateTopPenitipBadge } = require('../controllers/penitipController');

const scheduleTopPenitipBadgeUpdate = () => {
  cron.schedule('0 0 1 * *', async () => {
    try {
      console.log('Running scheduled task: Updating top penitip badge');
      const result = await updateTopPenitipBadge();
      console.log(result.message);
    } catch (error) {
      console.error('Error in scheduled top penitip badge update:', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Jakarta'
  });
  console.log('Top penitip badge scheduler initialized');
};

module.exports = { scheduleTopPenitipBadgeUpdate };