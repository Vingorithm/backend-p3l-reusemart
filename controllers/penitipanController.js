const { v4: uuidv4 } = require('uuid');
const Penitipan = require('../models/penitipan');

const generateNewId = async () => {
  const last = await Penitipan.findOne({
    order: [['id_penitipan', 'DESC']]
  });

  if (!last || !/^PTP\d+$/.test(last.id_penitipan)) return 'PTP1';

  const lastId = last.id_penitipan;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = numericPart + 1;
  return `PTP${newNumericPart}`;
};

exports.createPenitipan = async (req, res) => {
  try {
    const { id_barang, tanggal_awal_penitipan, tanggal_akhir_penitipan, tanggal_batas_pengambilan, perpanjangan, status_penitipan } = req.body;
    const newId = await generateNewId();
    const penitipan = await Penitipan.create({
      id_penitipan: newId,
      id_barang,
      tanggal_awal_penitipan,
      tanggal_akhir_penitipan,
      tanggal_batas_pengambilan,
      perpanjangan,
      status_penitipan,
    });
    res.status(201).json(penitipan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPenitipan = async (req, res) => {
  try {
    const penitipan = await Penitipan.findAll();
    res.status(200).json(penitipan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPenitipanById = async (req, res) => {
  try {
    const penitipan = await Penitipan.findByPk(req.params.id);
    if (!penitipan) return res.status(404).json({ message: 'Penitipan tidak ditemukan' });
    res.status(200).json(penitipan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePenitipan = async (req, res) => {
  try {
    const { id_barang, tanggal_awal_penitipan, tanggal_akhir_penitipan, tanggal_batas_pengambilan, perpanjangan, status_penitipan } = req.body;
    const penitipan = await Penitipan.findByPk(req.params.id);
    if (!penitipan) return res.status(404).json({ message: 'Penitipan tidak ditemukan' });
    await penitipan.update({ id_barang, tanggal_awal_penitipan, tanggal_akhir_penitipan, tanggal_batas_pengambilan, perpanjangan, status_penitipan });
    res.status(200).json(penitipan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePenitipan = async (req, res) => {
  try {
    const penitipan = await Penitipan.findByPk(req.params.id);
    if (!penitipan) return res.status(404).json({ message: 'Penitipan tidak ditemukan' });
    await penitipan.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};