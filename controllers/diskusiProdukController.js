const { v4: uuidv4 } = require('uuid');
const DiskusiProduk = require('../models/diskusiProduk');

const generateNewId = async () => {
  const last = await DiskusiProduk.findOne({
    order: [['id_diskusi_produk', 'DESC']]
  });

  if (!last || !last.id_diskusi_produk || !/^DSK\d{3}$/.test(last.id_diskusi_produk)) {
    return 'DSK001';
  }

  const lastId = last.id_diskusi_produk;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = numericPart + 1;
  const formatted = newNumericPart.toString().padStart(3, '0');
  return `DSK${formatted}`;
};

exports.createDiskusiProduk = async (req, res) => {
  try {
    const { id_barang, id_customer_service, id_pembeli, pertanyaan, jawaban, tanggal_pertanyaan, tanggal_jawaban } = req.body;
    const diskusi = await DiskusiProduk.create({
      id_diskusi_produk: uuidv4(),
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