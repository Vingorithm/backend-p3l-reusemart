// utils/notification.js
const admin = require('../firebase');

async function sendPushNotification(id_akun, title, body, data = {}) {
  try {
    const akun = await Akun.findByPk(id_akun);
    if (!akun || !akun.fcm_token) {
      console.log(`No FCM token found for id_akun: ${id_akun}`);
      return;
    }

    const message = {
      token: akun.fcm_token,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        type: data.type || 'general', // e.g., 'pembelian', 'pengiriman'
      },
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    await admin.messaging().send(message);
    console.log(`Notification sent to id_akun: ${id_akun}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

module.exports = { sendPushNotification };