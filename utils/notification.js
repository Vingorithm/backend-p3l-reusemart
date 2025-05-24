// utils/notification.js
const admin = require("../middleware/firebase");

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  // Validasi input
  if (!fcmToken || typeof fcmToken !== 'string') {
    throw new Error('Invalid FCM token provided');
  }

  if (!title || !body) {
    throw new Error('Title and body are required');
  }
  const stringifiedData = {};
  Object.keys(data).forEach(key => {
    stringifiedData[key] = String(data[key]);
  });

  const message = {
    notification: {
      title: title.substring(0, 100),
      body: body.substring(0, 500),
    },
    data: stringifiedData,
    token: fcmToken.trim(),
    // Android specific options
    android: {
      notification: {
        channelId: 'reusemart_channel',
        priority: 'high',
        defaultSound: true,
        defaultVibrateTimings: true,
      },
      priority: 'high',
    },
    // iOS specific options
    apns: {
      payload: {
        aps: {
          alert: {
            title: title.substring(0, 100),
            body: body.substring(0, 500),
          },
          badge: 1,
          sound: 'default',
        },
      },
      headers: {
        'apns-priority': '10',
      },
    },
  };

  try {
    console.log(`📤 Sending notification: "${title}" to token ending with ...${fcmToken.slice(-10)}`);
    
    const response = await admin.messaging().send(message);
    console.log("✅ Successfully sent message:", response);
    return {
      success: true,
      messageId: response,
      fcmToken: fcmToken.slice(-10)
    };
  } catch (error) {
    console.error("❌ Error sending message:", {
      code: error.code,
      message: error.message,
      fcmToken: fcmToken.slice(-10)
    });

    // Handle different types of FCM errors
    const errorInfo = {
      success: false,
      error: error.message,
      code: error.code,
      fcmToken: fcmToken.slice(-10)
    };

    // Specific error handling
    switch (error.code) {
      case 'messaging/registration-token-not-registered':
        errorInfo.shouldRemoveToken = true;
        errorInfo.reason = 'Token is no longer valid';
        break;
      case 'messaging/invalid-registration-token':
        errorInfo.shouldRemoveToken = true;
        errorInfo.reason = 'Token format is invalid';
        break;
      case 'messaging/mismatched-credential':
        errorInfo.reason = 'Firebase credential mismatch';
        break;
      case 'messaging/authentication-error':
        errorInfo.reason = 'Firebase authentication failed';
        break;
      default:
        errorInfo.reason = 'Unknown FCM error';
    }

    throw errorInfo;
  }
};

// Fungsi untuk send multiple notifications (batch)
const sendMultipleNotifications = async (notifications) => {
  const results = [];
  
  for (const notif of notifications) {
    try {
      const result = await sendPushNotification(
        notif.fcmToken,
        notif.title,
        notif.body,
        notif.data || {}
      );
      results.push({ ...result, recipient: notif.recipient });
    } catch (error) {
      results.push({ 
        success: false, 
        error: error.message,
        recipient: notif.recipient,
        shouldRemoveToken: error.shouldRemoveToken || false
      });
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

// Fungsi untuk test notification
const sendTestNotification = async (fcmToken) => {
  return await sendPushNotification(
    fcmToken,
    "🧪 Test Notification",
    "Ini adalah test notification dari ReuseMart. Jika Anda menerima ini, push notification sudah berfungsi dengan baik!",
    {
      type: 'test',
      timestamp: new Date().toISOString()
    }
  );
};

module.exports = {
  sendPushNotification,
  sendMultipleNotifications,
  sendTestNotification
};