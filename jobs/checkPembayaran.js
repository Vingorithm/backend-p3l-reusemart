const Pembelian = require('../models/pembelian');
const { Op } = require('sequelize');
const Pembeli = require('../models/pembeli');
const Pengiriman = require('../models/pengiriman');
const SubPembelian = require('../models/subPembelian');
const Barang = require('../models/barang');
const Penitipan = require('../models/penitipan');

const checkPembayaran = async () => {
  try {
    const batasWaktu = new Date(Date.now() - 15 * 60 * 1000); // 15 menit lalu

    const pembelianBelumBayar = await Pembelian.findAll({
        where: {
            bukti_transfer: "",
            tanggal_pembelian: {
            [Op.lt]: batasWaktu
            },
            status_pembelian: {
            [Op.ne]: "Tidak mengirimkan bukti pembayaran"
            }
        },
        include: [
            { 
                model: Pembeli,
            },
            { 
                model: Pengiriman,
            },
            {
                model: SubPembelian,
                include: [
                    {
                        model: Barang,
                        include: [
                            {
                                model: Penitipan,
                            },
                        ]
                    }
                ]
            }
        ]
    });

    for (const pembelian of pembelianBelumBayar) {
      await pembelian.update({
        status_pembelian: "Tidak mengirimkan bukti pembayaran"
      });

      const pembeli = await Pembeli.findByPk(pembelian?.Pembeli?.id_pembeli);
      if(pembeli) await pembeli.update({ total_poin: ( pembeli?.total_poin + ((pembelian?.potongan_poin/10000) * 100) )});
      
      const pengiriman = await Pengiriman.findByPk(pembelian?.Pengiriman?.id_pengiriman);
      if(pengiriman) await pengiriman.update({ status_pengiriman: "Tidak diproses"});

      pembelian?.SubPembelians.forEach( async (subPembelian) => {
        const penitipan = await Penitipan.findByPk(subPembelian?.Barang?.Penitipan?.id_penitipan);
        if(penitipan) await penitipan.update({ status_penitipan: "Dalam masa penitipan" });
      });
      console.log("Berhasil mengubah status pembayaran!");
    }
  } catch (err) {
    console.error("Gagal memeriksa pembayaran: ", err.message);
  }
};

module.exports = checkPembayaran;
