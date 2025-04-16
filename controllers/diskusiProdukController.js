const { v4: uuidv4 } = require('uuid');
const DiskusiProduk = require('../models/diskusiProduk');
const generateId = require('../utils/generateId');

exports.createDiskusiProduk = async (req, res) => {
  try {
    const { id_barang, id_customer_service, id_pembeli, pertanyaan, jawaban, tanggal_pertanyaan, tanggal_jawaban } = req.body;
    const newId = await generateId({
      model: DiskusiProduk,
      prefix: 'DSK',
      fieldName: 'id_diskusi_produk'
    });
    const diskusi = await DiskusiProduk.create({
      id_diskusi_produk: newId,
      id_barang,
      id_customer_service,
      id_pembeli,
      pertanyaan,
      jawaban,
      tanggal_pertanyaan,
      tanggal_jawaban,
    });
    res.status(201).json(diskusi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDiskusiProduk = async (req, res) => {
  try {
    const diskusi = await DiskusiProduk.findAll();
    res.status(200).json(diskusi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDiskusiProdukById = async (req, res) => {
  try {
    const diskusi = await DiskusiProduk.findByPk(req.params.id);
    if (!diskusi) return res.status(404).json({ message: 'Diskusi tidak ditemukan' });
    res.status(200).json(diskusi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDiskusiProduk = async (req, res) => {
  try {
    const { id_barang, id_customer_service, id_pembeli, pertanyaan, jawaban, tanggal_pertanyaan, tanggal_jawaban } = req.body;
    const diskusi = await DiskusiProduk.findByPk(req.params.id);
    if (!diskusi) return res.status(404).json({ message: 'Diskusi tidak ditemukan' });
    await diskusi.update({ id_barang, id_customer_service, id_pembeli, pertanyaan, jawaban, tanggal_pertanyaan, tanggal_jawaban });
    res.status(200).json(diskusi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDiskusiProduk = async (req, res) => {
  try {
    const diskusi = await DiskusiProduk.findByPk(req.params.id);
    if (!diskusi) return res.status(404).json({ message: 'Diskusi tidak ditemukan' });
    await diskusi.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};