const { v4: uuidv4 } = require('uuid');
const Penitip = require('../models/penitip');

const generateNewId = async () => {
  const last = await Penitip.findOne({
    order: [['id_penitip', 'DESC']]
  });

  if (!last || !/^T\d+$/.test(last.id_penitip)) return 'T001';

  const lastId = last.id_penitip;
  const numericPart = parseInt(lastId.slice(1));
  const newNumericPart = numericPart + 1;
  const formatted = newNumericPart.toString().padStart(3, '0');
  return `T${formatted}`;
};

exports.createPenitip = async (req, res) => {
  try {
    const { id_akun, nama_penitip, foto_ktp, nomor_ktp, keuntungan, rating, badge, total_poin, tanggal_registrasi } = req.body;
    const newId = await generateNewId();
    const penitip = await Penitip.create({
      id_penitip: newId,
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