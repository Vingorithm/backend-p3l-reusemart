const { v4: uuidv4 } = require('uuid');
const Pegawai = require('../models/pegawai');
const generateId = require('../utils/generateId');

exports.createPegawai = async (req, res) => {
  try {
    const { id_akun, nama_pegawai, tanggal_lahir } = req.body;
    const newId = await generateId({
      model: Pegawai,
      prefix: 'P',
      fieldName: 'id_pegawai'
    });
    const pegawai = await Pegawai.create({
      id_pegawai: newId,
      id_akun,
      nama_pegawai,
      tanggal_lahir,
    });
    res.status(201).json(pegawai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPegawai = async (req, res) => {
  try {
    const pegawai = await Pegawai.findAll();
    res.status(200).json(pegawai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPegawaiById = async (req, res) => {
  try {
    const pegawai = await Pegawai.findByPk(req.params.id);
    if (!pegawai) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    res.status(200).json(pegawai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePegawai = async (req, res) => {
  try {
    const { id_akun, nama_pegawai, tanggal_lahir } = req.body;
    const pegawai = await Pegawai.findByPk(req.params.id);
    if (!pegawai) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    await pegawai.update({ id_akun, nama_pegawai, tanggal_lahir });
    res.status(200).json(pegawai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePegawai = async (req, res) => {
  try {
    const pegawai = await Pegawai.findByPk(req.params.id);
    if (!pegawai) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    await pegawai.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};