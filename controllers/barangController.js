const Barang = require('../models/barang');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

const generateNewId = async (namaBarang) => {
  if (!namaBarang || namaBarang.length === 0) {
    throw new Error("Nama barang tidak boleh kosong untuk generate ID.");
  }

  const hurufDepan = namaBarang[0].toUpperCase();

  const allBarang = await Barang.findAll({
    attributes: ['id_barang'],
    where: {
      id_barang: {
        [Op.like]: `${hurufDepan}%`
      }
    }
  });

  const allNumericIds = allBarang
    .map(b => {
      const match = b.id_barang.match(/^([A-Z])(\d+)$/);
      return match && match[1] === hurufDepan ? parseInt(match[2]) : null;
    })
    .filter(id => id !== null);

  const nextNumber = allNumericIds.length > 0 ? Math.max(...allNumericIds) + 1 : 1;

  return `${hurufDepan}${nextNumber}`;
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

    // Generate ID Barang
    const newId = await generateNewId(nama);

    let imageFilenames = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const fileExtension = path.extname(file.originalname);
        const newFilename = `${newId}_${i + 1}${fileExtension}`;
        const oldPath = path.join(file.destination, file.filename);
        const newPath = path.join(file.destination, newFilename);

        fs.renameSync(oldPath, newPath);
        imageFilenames.push(newFilename);
      }
    }

    // Gabung nama file jadi string terpisah koma
    const gambar = imageFilenames.length > 0 ? imageFilenames.join(',') : null;

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

    const baseUrl = 'http://localhost:3000/uploads/';
    barang.forEach(b => {
      if (b.gambar) {
        const imageArray = b.gambar.split(',').map(img => img.trim());
        b.gambar = imageArray.map(img => `${baseUrl}${img}`).join(',');
      }
    });
    
    res.status(200).json(barang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBarangById = async (req, res) => {
  try {
    const barang = await Barang.findByPk(req.params.id);
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });

    const baseUrl = 'http://localhost:3000/uploads/'; 
    if (barang.gambar) {
      const imageArray = barang.gambar.split(',').map(img => img.trim());
      barang.gambar = imageArray.map(img => `${baseUrl}${img}`).join(',');
    }

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