const { v4: uuidv4 } = require('uuid');
const Merchandise = require('../models/merchandise');
const generateId = require('../utils/generateId');

exports.createMerchandise = async (req, res) => {
  try {
    const { id_admin, nama_merchandise, harga_poin, deskripsi, gambar, stok_merchandise } = req.body;
    const newId = await generateId({
      model: Merchandise,
      prefix: 'MRC',
      fieldName: 'id_merchandise'
    });
    const merchandise = await Merchandise.create({
      id_merchandise: newId,
      id_admin,
      nama_merchandise,
      deskripsi,
      gambar,
      harga_poin,
      stok_merchandise,
    });
    res.status(201).json(merchandise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllMerchandise = async (req, res) => {
  try {
    const merchandise = await Merchandise.findAll();
    res.status(200).json(merchandise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMerchandiseById = async (req, res) => {
  try {
    const merchandise = await Merchandise.findByPk(req.params.id);
    if (!merchandise) return res.status(404).json({ message: 'Merchandise tidak ditemukan' });
    res.status(200).json(merchandise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMerchandise = async (req, res) => {
  try {
    const { id_admin, nama_merchandise, harga_poin, deskripsi, gambar, stok_merchandise } = req.body;
    const merchandise = await Merchandise.findByPk(req.params.id);
    if (!merchandise) return res.status(404).json({ message: 'Merchandise tidak ditemukan' });
    await merchandise.update({ id_admin, nama_merchandise, deskripsi, gambar, harga_poin, stok_merchandise });
    res.status(200).json(merchandise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMerchandise = async (req, res) => {
  try {
    const merchandise = await Merchandise.findByPk(req.params.id);
    if (!merchandise) return res.status(404).json({ message: 'Merchandise tidak ditemukan' });
    await merchandise.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};