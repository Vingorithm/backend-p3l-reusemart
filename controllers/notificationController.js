const { sendPushNotification, sendMultipleNotifications } = require('../utils/notification');

exports.SendPushNotification = async (req, res) => {
  try {
    const { fcmToken, title, body, data } = req.body;

    if (!fcmToken || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "fcmToken, title, and body are required.",
      });
    }

    const response = await sendPushNotification(fcmToken, title, body, data);

    return res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error in SendPushNotification API:", error);

    return res.status(500).json({
      success: false,
      message: error.reason || "Failed to send notification.",
      error: error.message || error,
      code: error.code || undefined,
      shouldRemoveToken: error.shouldRemoveToken || false,
    });
  }
};

exports.SendBulkNotifications = async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ success: false, message: "Notifications array is required." });
    }

    const results = await sendMultipleNotifications(notifications);
    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("❌ Error in SendBulkNotifications API:", error);
    return res.status(500).json({ success: false, message: "Failed to send bulk notifications.", error });
  }
};
