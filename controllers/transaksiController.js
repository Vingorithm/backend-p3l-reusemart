const { v4: uuidv4 } = require('uuid');
const Transaksi = require('../models/transaksi');
const generateId = require('../utils/generateId');
const SubPembelian = require('../models/subPembelian');
const Pembelian = require('../models/pembelian');
const Barang = require('../models/barang');

exports.createTransaksi = async (req, res) => {
  try {
    const { id_sub_pembelian, komisi_reusemart, komisi_hunter, pendapatan, bonus_cepat } = req.body;
    console.log('Request body:', req.body); // Debug log
    if (!id_sub_pembelian) {
      return res.status(400).json({ error: 'id_sub_pembelian is required', data: req.body });
    }
    const newId = await generateId({
      model: Transaksi,
      prefix: 'TRX',
      fieldName: 'id_transaksi'
    });
    const transaksi = await Transaksi.create({
      id_transaksi: newId,
      id_sub_pembelian,
      komisi_reusemart,
      komisi_hunter: komisi_hunter != null ? komisi_hunter : null,
      pendapatan,
      bonus_cepat: bonus_cepat != null ? bonus_cepat : null,
    });
    console.log('Created transaksi:', transaksi.toJSON()); // Debug log
    res.status(201).json(transaksi);
  } catch (error) {
    console.error('Error creating transaksi:', error.message); // Debug log
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
      order: [['id_sub_pembelian', 'ASC']]
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

exports.getTransaksiByHunterId = async (req, res) => {
  try {
    const { id_hunter } = req.params;
    
    const transaksi = await Transaksi.findAll({
      include: [
        {
          model: SubPembelian,
          include: [
            {
              model: Barang,
              where: { id_hunter: id_hunter },
              attributes: ['id_barang', 'id_hunter', 'nama', 'harga'],
            },
          ],
          attributes: ['id_sub_pembelian', 'id_pembelian', 'id_barang'],
        },
      ],
      order: [['id_transaksi', 'DESC']],
    });

    const totalKomisiHunter = transaksi.reduce((total, item) => {
      return total + parseFloat(item.komisi_hunter || 0);
    }, 0);

    res.status(200).json({
      transaksi: transaksi,
      total_komisi_hunter: totalKomisiHunter,
      jumlah_transaksi: transaksi.length
    });
  } catch (error) {
    console.error('Error getting transaksi by hunter:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.getHunterKomisiSummary = async (req, res) => {
  try {
    const { id_hunter } = req.params;
    
    // Query dengan WHERE clause yang tepat untuk filter berdasarkan id_hunter
    const transaksi = await Transaksi.findAll({
      include: [
        {
          model: SubPembelian,
          required: true, // INNER JOIN - penting!
          include: [
            {
              model: Barang,
              required: true, // INNER JOIN - penting!
              where: { 
                id_hunter: id_hunter // Filter hanya barang dengan hunter tertentu
              },
              attributes: ['id_barang', 'id_hunter', 'nama', 'harga'],
            }
          ],
          attributes: ['id_sub_pembelian', 'id_barang'],
        }
      ],
      attributes: ['id_transaksi', 'komisi_hunter'],
    });

    // Hitung total komisi hunter
    const totalKomisiHunter = transaksi.reduce((total, item) => {
      return total + parseFloat(item.komisi_hunter || 0);
    }, 0);

    res.status(200).json({
      id_hunter: id_hunter,
      total_komisi_hunter: totalKomisiHunter,
      jumlah_transaksi: transaksi.length,
      transaksi: transaksi // untuk debugging
    });
  } catch (error) {
    console.error('Error getting hunter komisi summary:', error);
    res.status(500).json({ error: error.message });
  }
};
