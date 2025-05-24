// utils/checkPenitipan.js
const checkPenitipan = async () => {
  try {
    console.log('🔍 Starting penitipan expiry check...');
    const today = moment().startOf('day');
    
    const expiredPenitipan = await Penitipan.findAll({
      where: { status_penitipan: 'Aktif' },
      include: [
        {
          model: Barang,
          include: [
            {
              model: Penitip,
              include: [
                {
                  model: Akun,
                  attributes: ['id_akun', 'email', 'fcm_token', 'role']
                }
              ]
            }
          ]
        }
      ]
    });

    console.log(`📋 Found ${expiredPenitipan.length} active penitipan records`);

    let expiredCount = 0;
    let notificationSentCount = 0;
    let errorCount = 0;
    let invalidTokensRemoved = 0;

    for (const penitipan of expiredPenitipan) {
      const endDate = moment(penitipan.tanggal_akhir_penitipan).startOf('day');
      const batasDate = moment(penitipan.tanggal_batas_pengambilan).startOf('day');
      
      const isExpired = endDate.isBefore(today) || endDate.isSame(today);
      
      if (isExpired) {
        expiredCount++;
        console.log(`⏰ Expired: ${penitipan.id_penitipan} - ${penitipan.Barang?.nama}`);
        
        const penitipAkun = penitipan.Barang?.Penitip?.Akun;
        
        if (penitipAkun?.fcm_token) {
          try {
            const daysOverdue = today.diff(endDate, 'days');
            const daysUntilDeadline = batasDate.diff(today, 'days');
            
            let title, body;
            
            if (daysUntilDeadline > 0) {
              title = "⏰ Masa Penitipan Berakhir";
              body = `Masa penitipan "${penitipan.Barang.nama}" telah berakhir. Anda memiliki ${daysUntilDeadline} hari lagi untuk mengambil barang.`;
            } else if (daysUntilDeadline === 0) {
              title = "🚨 Batas Waktu Pengambilan Hari Ini";
              body = `Hari ini adalah batas terakhir untuk mengambil "${penitipan.Barang.nama}". Segera ambil barang Anda!`;
            } else {
              title = "❌ Batas Waktu Pengambilan Terlewat";
              body = `Batas waktu pengambilan "${penitipan.Barang.nama}" telah terlewat ${Math.abs(daysUntilDeadline)} hari. Silakan hubungi customer service.`;
            }

            const notificationData = {
              type: 'penitipan_expired',
              id_penitipan: penitipan.id_penitipan,
              id_barang: penitipan.id_barang,
              nama_barang: penitipan.Barang.nama,
              tanggal_akhir: penitipan.tanggal_akhir_penitipan,
              tanggal_batas: penitipan.tanggal_batas_pengambilan,
              days_overdue: daysOverdue.toString(),
              days_until_deadline: daysUntilDeadline.toString()
            };

            await sendPushNotification(
              penitipAkun.fcm_token,
              title,
              body,
              notificationData
            );

            notificationSentCount++;
            console.log(`✅ Notification sent to ${penitipAkun.email}`);

            // Update status jika terlambat
            if (daysUntilDeadline < 0) {
              await penitipan.update({ 
                status_penitipan: 'Terlambat',
                updated_at: new Date()
              });
            }

          } catch (notificationError) {
            errorCount++;
            console.error(`❌ Notification failed for ${penitipan.id_penitipan}:`, notificationError.message);
            
            // PERBAIKAN: Handle invalid tokens
            if (notificationError.shouldRemoveToken || 
                notificationError.code === 'messaging/registration-token-not-registered' || 
                notificationError.code === 'messaging/invalid-registration-token') {
              
              console.log(`🗑️ Removing invalid FCM token for ${penitipAkun.email}`);
              await penitipAkun.update({ fcm_token: null });
              invalidTokensRemoved++;
            }
          }
        } else {
          console.log(`⚠️ No FCM token for penitipan ${penitipan.id_penitipan}`);
        }
      }
    }

    // Enhanced summary
    console.log('\n📊 PENITIPAN CHECK SUMMARY:');
    console.log(`   📋 Total active penitipan: ${expiredPenitipan.length}`);
    console.log(`   ⏰ Expired penitipan found: ${expiredCount}`);
    console.log(`   ✅ Notifications sent: ${notificationSentCount}`);
    console.log(`   ❌ Notification errors: ${errorCount}`);
    console.log(`   🗑️ Invalid tokens removed: ${invalidTokensRemoved}`);
    console.log('🏁 Penitipan check completed\n');

  } catch (error) {
    console.error('💥 Error in checkPenitipan job:', error);
  }
};