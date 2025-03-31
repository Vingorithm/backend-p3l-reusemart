const { v4: uuidv4 } = require('uuid');
const Penitip = require('../models/penitip');

exports.createPenitip = async (req, res) => {
  try {
    const { id_akun, nama_penitip, foto_ktp, nomor_ktp, keuntungan, rating, badge, total_poin, tanggal_registrasi } = req.body;
    const penitip = await Penitip.create({
      id_penitip: uuidv4(),
      id_akun,
      nama_penitip,
      foto_ktp,
      nomor_ktp,
      keuntungan,
      rating,
      badge,
      total_poin,
      tanggal_registrasi,
    });
    res.status(201).json(penitip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPenitip = async (req, res) => {
  try {
    const penitip = await Penitip.findAll();
    res.status(200).json(penitip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPenitipById = async (req, res) => {
  try {
    const penitip = await Penitip.findByPk(req.params.id);
    if (!penitip) return res.status(404).json({ message: 'Penitip tidak ditemukan' });
    res.status(200).json(penitip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePenitip = async (req, res) => {
  try {
    const { id_akun, nama_penitip, foto_ktp, nomor_ktp, keuntungan, rating, badge, total_poin, tanggal_registrasi } = req.body;
    const penitip = await Penitip.findByPk(req.params.id);
    if (!penitip) return res.status(404).json({ message: 'Penitip tidak ditemukan' });
    await penitip.update({ id_akun, nama_penitip, foto_ktp, nomor_ktp, keuntungan, rating, badge, total_poin, tanggal_registrasi });
    res.status(200).json(penitip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePenitip = async (req, res) => {
  try {
    const penitip = await Penitip.findByPk(req.params.id);
    if (!penitip) return res.status(404).json({ message: 'Penitip tidak ditemukan' });
    await penitip.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};