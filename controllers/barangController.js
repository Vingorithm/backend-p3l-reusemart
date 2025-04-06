const Barang = require('../models/barang');
const fs = require('fs');
const path = require('path');

const generateNewId = async () => {
  const last = await Barang.findOne({
    order: [['id_barang', 'DESC']]
  });

  if (!last || !last.id_barang || !/^BRG\d{3}$/.test(last.id_barang)) {
    return 'BRG001';
  }

  const lastId = last.id_barang;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = numericPart + 1;
  const formatted = newNumericPart.toString().padStart(3, '0');
  return `BRG${formatted}`;
};

exports.createBarang = async (req, res) => {
  try {
    const {
      id_penitip,
      id_hunter,
      id_pegawai_gudang,
      nama,
      deskripsi,
      harga,
      garansi_berlaku,
      tanggal_garansi,
      berat,
      status_qc,
      kategori_barang
    } = req.body;

    const newId = await generateNewId();

    let gambar = null;

    if (req.file) {
      const fileExtension = path.extname(req.file.originalname);
      const newFilename = `${newId}${fileExtension}`;
      const oldPath = path.join(req.file.destination, req.file.filename);
      const newPath = path.join(req.file.destination, newFilename);

      fs.renameSync(oldPath, newPath);
      gambar = newFilename;
    }

    const barang = await Barang.create({
      id_barang: newId,
      id_penitip,
      id_hunter,
      id_pegawai_gudang,
      nama,
      deskripsi,
      gambar,
      harga,
      garansi_berlaku,
      tanggal_garansi,
      berat,
      status_qc,
      kategori_barang,
    });

    res.status(201).json(barang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBarang = async (req, res) => {
  try {
    const barang = await Barang.findAll();
    res.status(200).json(barang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBarangById = async (req, res) => {
  try {
    const barang = await Barang.findByPk(req.params.id);
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });
    res.status(200).json(barang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBarang = async (req, res) => {
  try {
    const { id_penitip, id_hunter, id_pegawai_gudang, nama, deskripsi, gambar, harga, garansi_berlaku, tanggal_garansi, berat, status_qc, kategori_barang } = req.body;
    const barang = await Barang.findByPk(req.params.id);
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });
    await barang.update({ id_penitip, id_hunter, id_pegawai_gudang, nama, deskripsi, gambar, harga, garansi_berlaku, tanggal_garansi, berat, status_qc, kategori_barang });
    res.status(200).json(barang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBarang = async (req, res) => {
  try {
    const barang = await Barang.findByPk(req.params.id);
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });
    await barang.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};