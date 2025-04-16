const { v4: uuidv4 } = require('uuid');
const Transaksi = require('../models/transaksi');
const generateId = require('../utils/generateId');

// const generateNewId = async () => {
//   const last = await Transaksi.findOne({
//     order: [['id_transaksi', 'DESC']]
//   });

//   if (!last || !/^TRX\d+$/.test(last.id_transaksi)) return 'TRX1';

//   const lastId = last.id_transaksi;
//   const numericPart = parseInt(lastId.slice(3));
//   const newNumericPart = numericPart + 1;
//   return `TRX${newNumericPart}`;
// };

exports.createTransaksi = async (req, res) => {
  try {
    const { id_pengiriman, komisi_reusemart, komisi_hunter, pendapatan, bonus_cepat } = req.body;
    const newId = await generateId({
      model: Transaksi,
      prefix: 'TRX',
      fieldName: 'id_transaksi'
    });
    const transaksi = await Transaksi.create({
      id_transaksi: newId,
      id_pengiriman,
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
    const transaksi = await Transaksi.findAll();
    res.status(200).json(transaksi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransaksiById = async (req, res) => {
  try {
    const transaksi = await Transaksi.findByPk(req.params.id);
    if (!transaksi) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    res.status(200).json(transaksi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTransaksi = async (req, res) => {
  try {
    const { id_pengiriman, komisi_reusemart, komisi_hunter, pendapatan, bonus_cepat } = req.body;
    const transaksi = await Transaksi.findByPk(req.params.id);
    if (!transaksi) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    await transaksi.update({ id_pengiriman, komisi_reusemart, komisi_hunter, pendapatan, bonus_cepat });
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