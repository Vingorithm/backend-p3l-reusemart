const Pembelian = require("../models/pembelian");
const { Op, Sequelize } = require("sequelize");
const Pembeli = require("../models/pembeli");
const Pengiriman = require("../models/pengiriman");
const SubPembelian = require("../models/subPembelian");
const Barang = require("../models/barang");
const Penitipan = require("../models/penitipan");
const Penitip = require("../models/penitip");
const Akun = require("../models/akun");
const { sendPushNotification } = require("../utils/notification");
const Pegawai = require("../models/pegawai");
const AlamatPembeli = require("../models/alamatPembeli");

const sendDeliveryNotification = async () => {
  try {
    const nowFormatted = new Date().toISOString().slice(0, 16).replace("T", " "); // yyyy-mm-dd HH:mm
    console.log(`\n\n\n now formatted: ${nowFormatted} \n\n\n`);  

    const pembelianDikirim = await Pembelian.findAll({
      include: [
        {
          model: Pegawai,
          as: "CustomerService",
          include: [{ model: Akun, attributes: ["role", "fcm_token"] }],
        },
        { model: AlamatPembeli },
        {
          model: Pembeli,
          include: [{ model: Akun, attributes: ["email", "role", "fcm_token"] }],
        },
        {
          model: Pengiriman,
          where: {
            jenis_pengiriman: "Dikirim kurir",
            status_pengiriman: {
              [Op.in]: ["Dalam pengiriman", "Diproses"],
            },
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn("DATE_FORMAT", Sequelize.col("Pengiriman.tanggal_mulai"), "%Y-%m-%d %H:%i"),
                nowFormatted
              ),
            ],
          },
          include: [
            {
              model: Pegawai,
              include: [{ model: Akun, attributes: ["role", "fcm_token"] }],
            },
          ],
        },
        {
          model: SubPembelian,
          include: [
            {
              model: Barang,
              include: [
                {
                  model: Pegawai,
                  as: "PegawaiGudang",
                  include: [{ model: Akun, attributes: ["role", "fcm_token"] }],
                },
                {
                  model: Pegawai,
                  as: "Hunter",
                  include: [{ model: Akun, attributes: ["role", "fcm_token"] }],
                },
                {
                  model: Penitip,
                  include: [{ model: Akun, attributes: ["role", "fcm_token"] }],
                },
                { model: Penitipan },
              ],
            },
          ],
        },
      ],
    });
    
    if(pembelianDikirim) {
      console.log(pembelianDikirim);
      for (const pembelian of pembelianDikirim) {
        // Kirim notifikasi ke pembeli
        const pembeliNotification = {
          fcmToken: pembelian?.Pembeli?.Akun?.fcm_token,
          title: "Barang dikirim",
          body: `Barang dengan id pembelian ${pembelian?.id_pembelian} sedang dikirim!`,
        };
        await sendPushNotification(
          pembeliNotification.fcmToken,
          pembeliNotification.title,
          pembeliNotification.body
        );

        // Kirim notifikasi ke penitip
        for (const sb of pembelian?.SubPembelians) {
          const penitipNotification = {
            fcmToken: sb?.Barang?.Penitip?.Akun?.fcm_token,
            title: "Barang dikirim",
            body: `Barang ${sb?.Barang?.nama} dengan id ${sb?.Barang?.id_barang} sedang dikirim!`,
          };
          await sendPushNotification(
            penitipNotification.fcmToken,
            penitipNotification.title,
            penitipNotification.body
          );
        }

        // Ubah status_pengiriman dari "Diproses" ke "Dalam pengiriman"
        if (pembelian?.Pengiriman?.status_pengiriman === "Diproses") {
          await Pengiriman.update(
            { status_pengiriman: "Dalam pengiriman" },
            { where: { id_pengiriman: pembelian.Pengiriman.id_pengiriman } }
          );
        }
      }
    }
  } catch (err) {
    console.error("Gagal memproses notifikasi pengiriman: ", err.message);
  }
};

module.exports = sendDeliveryNotification;
