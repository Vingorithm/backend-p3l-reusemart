const { v4: uuidv4 } = require('uuid');
const Transaksi = require('../models/transaksi');
const generateId = require('../utils/generateId');
const SubPembelian = require('../models/subPembelian');
const Pembelian = require('../models/pembelian');
const Barang = require('../models/barang');

exports.createTransaksi = async (req, res) => {
  try {
    const { id_sub_pembelian, komisi_reusemart, komisi_hunter, pendapatan, bonus_cepat } = req.body;
    const newId = await generateId({
      model: Transaksi,
      prefix: 'TRX',
      fieldName: 'id_transaksi'
    });
    const transaksi = await Transaksi.create({
      id_transaksi: newId,
      id_sub_pembelian,
      komisi_reusemart,
      komisi_hunter,
      pendapatan,
      bonus_cepat,
    });
    res.status(201).json(transaksi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTransaksi = async (req, res) => {
  try {
    const transaksi = await Transaksi.findAll({
      include: [
        {
          model: SubPembelian,
          attributes: ['id_sub_pembelian', 'id_pembelian', 'id_barang'],
          include: [
            {
              model: Pembelian,
              attributes: ['id_pembelian', 'id_customer_service', 'id_pembeli', 'id_alamat', 'bukti_transfer', 'tanggal_pembelian', 'tanggal_pelunasan', 'total_harga', 'ongkir', 'potongan_poin', 'total_bayar', 'poin_diperoleh', 'status_pembelian'],
            },
            {
              model: Barang,
              attributes: ['id_barang', 'id_penitip', 'id_hunter', 'id_pegawai_gudang', 'nama', 'deskripsi', 'gambar', 'harga', 'garansi_berlaku', 'tanggal_garansi', 'berat', 'status_qc', 'kategori_barang'],
            },
          ]
        },
      ],
      order: [['id_pembelian', 'ASC']]
    });
    res.status(200).json(transaksi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransaksiById = async (req, res) => {
  try {
    const transaksi = await Transaksi.findByPk(req.params.id, {
      include: [
        {
          model: SubPembelian,
          attributes: ['id_sub_pembelian', 'id_pembelian', 'id_barang'],
          include: [
            {
              model: Pembelian,
              attributes: ['id_pembelian', 'id_customer_service', 'id_pembeli', 'id_alamat', 'bukti_transfer', 'tanggal_pembelian', 'tanggal_pelunasan', 'total_harga', 'ongkir', 'potongan_poin', 'total_bayar', 'poin_diperoleh', 'status_pembelian'],
            },
            {
              model: Barang,
              attributes: ['id_barang', 'id_penitip', 'id_hunter', 'id_pegawai_gudang', 'nama', 'deskripsi', 'gambar', 'harga', 'garansi_berlaku', 'tanggal_garansi', 'berat', 'status_qc', 'kategori_barang'],
            },
          ]
        },
      ]
    });

    if (!transaksi) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });

    res.status(200).json(transaksi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateTransaksi = async (req, res) => {
  try {
    const { id_sub_pembelian, komisi_reusemart, komisi_hunter, pendapatan, bonus_cepat } = req.body;
    const transaksi = await Transaksi.findByPk(req.params.id);
    if (!transaksi) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    await transaksi.update({ id_sub_pembelian, komisi_reusemart, komisi_hunter, pendapatan, bonus_cepat });
    res.status(200).json(transaksi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTransaksi = async (req, res) => {
  try {
    const transaksi = await Transaksi.findByPk(req.params.id);
    if (!transaksi) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    await transaksi.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};