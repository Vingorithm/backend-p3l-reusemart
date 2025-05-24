// services/penitipanNotificationService.js
const { Op } = require('sequelize');
const Penitipan = require('../models/penitipan');
const Barang = require('../models/barang');
const Penitip = require('../models/penitip');
const Akun = require('../models/akun');
const { sendPushNotification } = require('../utils/notification');

class PenitipanNotificationService {
  static async checkExpiredPenitipan() {
    try {
      const now = new Date();
      
      const expiredPenitipan = await Penitipan.findAll({
        where: {
          tanggal_akhir_penitipan: {
            [Op.lt]: now // Tanggal akhir penitipan sudah lewat
          },
          status_penitipan: {
            [Op.in]: ['Aktif', 'Dalam masa penitipan'] // Status yang masih aktif
          }
        },
        include: [
          {
            model: Barang,
            include: [
              {
                model: Penitip,
                include: [
                  {
                    model: Akun,
                    attributes: ['id_akun', 'fcm_token', 'email']
                  }
                ]
              }
            ]
          }
        ]
      });

      console.log(`📅 Found ${expiredPenitipan.length} expired penitipan`);

      for (const penitipan of expiredPenitipan) {
        if (penitipan.Barang?.Penitip?.Akun?.fcm_token) {
          try {
            await sendPushNotification(
              penitipan.Barang.Penitip.Akun.fcm_token,
              "⏰ Masa Penitipan Berakhir",
              `Masa penitipan untuk "${penitipan.Barang.nama}" telah berakhir. Silakan ambil barang Anda atau lakukan perpanjangan sebelum ${new Date(penitipan.tanggal_batas_pengambilan).toLocaleDateString('id-ID')}.`,
              {
                type: 'penitipan_expired',
                id_penitipan: penitipan.id_penitipan,
                id_barang: penitipan.id_barang,
                nama_barang: penitipan.Barang.nama,
                tanggal_batas_pengambilan: penitipan.tanggal_batas_pengambilan.toISOString()
              }
            );

            console.log(`✅ Notification sent for expired penitipan: ${penitipan.id_penitipan}`);
            
            // Update status penitipan menjadi 'Berakhir'
            await penitipan.update({
              status_penitipan: 'Berakhir'
            });

          } catch (error) {
            console.error(`❌ Failed to send notification for penitipan ${penitipan.id_penitipan}:`, error);
          }
        }
      }

      return {
        success: true,
        processed: expiredPenitipan.length,
        message: `Processed ${expiredPenitipan.length} expired penitipan`
      };

    } catch (error) {
      console.error('❌ Error in checkExpiredPenitipan:', error);
      throw error;
    }
  }

  // Cek penitipan yang akan habis dalam 3 hari (H-3)
  static async checkSoonExpiredPenitipan() {
    try {
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(now.getDate() + 3);
      threeDaysFromNow.setHours(23, 59, 59, 999); // Set ke akhir hari

      const soonExpiredPenitipan = await Penitipan.findAll({
        where: {
          tanggal_akhir_penitipan: {
            [Op.between]: [now, threeDaysFromNow] // Akan berakhir dalam 3 hari
          },
          status_penitipan: {
            [Op.in]: ['Aktif', 'Dalam masa penitipan'] // Status yang masih aktif
          }
        },
        include: [
          {
            model: Barang,
            include: [
              {
                model: Penitip,
                include: [
                  {
                    model: Akun,
                    attributes: ['id_akun', 'fcm_token', 'email']
                  }
                ]
              }
            ]
          }
        ]
      });

      console.log(`📅 Found ${soonExpiredPenitipan.length} soon-to-expire penitipan`);

      for (const penitipan of soonExpiredPenitipan) {
        if (penitipan.Barang?.Penitip?.Akun?.fcm_token) {
          try {
            const daysLeft = Math.ceil((new Date(penitipan.tanggal_akhir_penitipan) - now) / (1000 * 60 * 60 * 24));
            
            await sendPushNotification(
              penitipan.Barang.Penitip.Akun.fcm_token,
              "⚠️ Peringatan Masa Penitipan",
              `Masa penitipan untuk "${penitipan.Barang.nama}" akan berakhir dalam ${daysLeft} hari (${new Date(penitipan.tanggal_akhir_penitipan).toLocaleDateString('id-ID')}). Jangan lupa untuk mengambil atau memperpanjang penitipan Anda.`,
              {
                type: 'penitipan_warning',
                id_penitipan: penitipan.id_penitipan,
                id_barang: penitipan.id_barang,
                nama_barang: penitipan.Barang.nama,
                days_left: daysLeft,
                tanggal_akhir_penitipan: penitipan.tanggal_akhir_penitipan.toISOString(),
                tanggal_batas_pengambilan: penitipan.tanggal_batas_pengambilan.toISOString()
              }
            );

            console.log(`✅ Warning notification sent for penitipan: ${penitipan.id_penitipan} (${daysLeft} days left)`);

          } catch (error) {
            console.error(`❌ Failed to send warning notification for penitipan ${penitipan.id_penitipan}:`, error);
          }
        }
      }

      return {
        success: true,
        processed: soonExpiredPenitipan.length,
        message: `Processed ${soonExpiredPenitipan.length} soon-to-expire penitipan`
      };

    } catch (error) {
      console.error('❌ Error in checkSoonExpiredPenitipan:', error);
      throw error;
    }
  }

  // Cek penitipan yang sudah melewati batas pengambilan
  static async checkOverduePickup() {
    try {
      const now = new Date();
      
      const overduePenitipan = await Penitipan.findAll({
        where: {
          tanggal_batas_pengambilan: {
            [Op.lt]: now // Batas pengambilan sudah lewat
          },
          status_penitipan: 'Berakhir' // Status berakhir tapi belum diambil
        },
        include: [
          {
            model: Barang,
            include: [
              {
                model: Penitip,
                include: [
                  {
                    model: Akun,
                    attributes: ['id_akun', 'fcm_token', 'email']
                  }
                ]
              }
            ]
          }
        ]
      });

      console.log(`📅 Found ${overduePenitipan.length} overdue pickup penitipan`);

      for (const penitipan of overduePenitipan) {
        if (penitipan.Barang?.Penitip?.Akun?.fcm_token) {
          try {
            await sendPushNotification(
              penitipan.Barang.Penitip.Akun.fcm_token,
              "🚨 Batas Pengambilan Terlewat",
              `Batas pengambilan untuk "${penitipan.Barang.nama}" telah terlewat. Segera hubungi customer service untuk informasi lebih lanjut mengenai barang Anda.`,
              {
                type: 'pickup_overdue',
                id_penitipan: penitipan.id_penitipan,
                id_barang: penitipan.id_barang,
                nama_barang: penitipan.Barang.nama,
                tanggal_batas_pengambilan: penitipan.tanggal_batas_pengambilan.toISOString()
              }
            );

            console.log(`✅ Overdue notification sent for penitipan: ${penitipan.id_penitipan}`);
            
            // Update status menjadi 'Tidak Diambil'
            await penitipan.update({
              status_penitipan: 'Tidak Diambil'
            });

          } catch (error) {
            console.error(`❌ Failed to send overdue notification for penitipan ${penitipan.id_penitipan}:`, error);
          }
        }
      }

      return {
        success: true,
        processed: overduePenitipan.length,
        message: `Processed ${overduePenitipan.length} overdue pickup penitipan`
      };

    } catch (error) {
      console.error('❌ Error in checkOverduePickup:', error);
      throw error;
    }
  }

  // Jalankan semua pengecekan
  static async runAllChecks() {
    try {
      console.log('🔄 Starting penitipan notification checks...');
      
      const results = await Promise.allSettled([
        this.checkSoonExpiredPenitipan(),
        this.checkExpiredPenitipan(),
        this.checkOverduePickup()
      ]);

      const summary = {
        success: true,
        timestamp: new Date().toISOString(),
        checks: {
          soonExpired: results[0].status === 'fulfilled' ? results[0].value : { error: results[0].reason?.message },
          expired: results[1].status === 'fulfilled' ? results[1].value : { error: results[1].reason?.message },
          overdue: results[2].status === 'fulfilled' ? results[2].value : { error: results[2].reason?.message }
        }
      };

      console.log('✅ Penitipan notification checks completed:', summary);
      return summary;

    } catch (error) {
      console.error('❌ Error in runAllChecks:', error);
      throw error;
    }
  }
}

module.exports = PenitipanNotificationService;