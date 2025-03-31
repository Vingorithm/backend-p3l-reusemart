const { v4: uuidv4 } = require('uuid');
const Barang = require('../models/barang');

exports.createBarang = async (req, res) => {
  try {
    const { id_penitip, id_hunter, id_pegawai_gudang, nama, deskripsi, gambar, harga, garansi_berlaku, tanggal_garansi, berat, status_qc, kategori_barang } = req.body;
    const barang = await Barang.create({
      id_barang: uuidv4(),
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