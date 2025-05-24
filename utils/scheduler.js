// scheduler.js
const cron = require('node-cron');
const checkPenitipan = require('./jobs/checkPenitipan');

// jalan setiap hari jam 00:00
cron.schedule('0 0 * * *', () => {
  console.log("Running daily penitipan check...");
  checkPenitipan();
});
