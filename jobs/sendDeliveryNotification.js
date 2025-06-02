const Pembelian = require("../models/pembelian");
const { Op } = require("sequelize");
const Pembeli = require("../models/pembeli");
const Pengiriman = require("../models/pengiriman");
const SubPembelian = require("../models/subPembelian");
const Barang = require("../models/barang");
const Penitipan = require("../models/penitipan");
const Penitip = require("../models/penitip");
const Akun = require("../models/akun");
const { sendPushNotification } = require("../utils/notification");

const sendDeliveryNotification = async () => {
  try {
    const now = new Date();
    const nextSecond = new Date(now.getTime() + 1000);

    const pembelianDikirim = await Pembelian.findAll({
      include: [
        {
          model: Pegawai,
          as: "CustomerService",
          include: [
            {
              model: Akun,
              attributes: ["role", "fcm_token"],
            },
          ],
        },
        { model: AlamatPembeli },
        {
          model: Pembeli,
          include: [
            {
              model: Akun,
              attributes: ["email", "role", "fcm_token"],
            },
          ],
        },
        {
          model: Pengiriman,
          where: {
            jenis_pengiriman: "Dikirim kurir",
            status_pengiriman: {
              [Op.in]: ["Dalam pengiriman", "Diproses"],
            },
            tanggal_mulai: {
                [Op.between]: [now, nextSecond],
            },
          },
          include: [
            {
              model: Pegawai,
              include: [
                {
                  model: Akun,
                  attributes: ["role", "fcm_token"],
                },
              ],
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
                  include: [
                    {
                      model: Akun,
                      attributes: ["role", "fcm_token"],
                    },
                  ],
                },
                {
                  model: Pegawai,
                  as: "Hunter",
                  include: [
                    {
                      model: Akun,
                      attributes: ["role", "fcm_token"],
                    },
                  ],
                },
                {
                  model: Penitip,
                  include: [
                    {
                      model: Akun,
                      attributes: ["role", "fcm_token"],
                    },
                  ],
                },
                {
                  model: Penitipan,
                },
              ],
            },
          ],
        },
      ],
    });

    for (const pembelian of pembelianDikirim) {

        // kirim notif ke pembeli
        const pembeliNotification = {
            fcmToken: pembelian?.Pembeli?.Akun?.fcm_token, 
            title: "Barang dikirim", 
            body: `Barang dengan id pembelian ${pembelian?.id_pembelian} sedang dikirim!`
        }
        await sendPushNotification(
            pembeliNotification.fcmToken,
            pembeliNotification.title,
            pembeliNotification.body
        );

        // kirim notif ke penitip
        for(const sb of pembelian?.SubPembelians) {
            const penitipNotification = {
                fcmToken: sb?.Barang?.Penitip?.Akun?.fcm_token, 
                title: "Barang dikirim", 
                body: `Barang ${sb?.Barang?.nama} dengan id ${sb?.Barang?.id_barang} sedang dikirim!`
            }
            await sendPushNotification(
                penitipNotification.fcmToken,
                penitipNotification.title,
                penitipNotification.body
            );
        }
    }
  } catch (err) {
    console.error("Gagal memeriksa pembayaran: ", err.message);
  }
};

module.exports = checkPembayaran;
