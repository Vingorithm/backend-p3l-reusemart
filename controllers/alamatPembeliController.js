const { v4: uuidv4 } = require('uuid');
const AlamatPembeli = require('../models/alamatPembeli');
const generateId = require('../utils/generateId');

exports.createAlamatPembeli = async (req, res) => {
  try {
    const { id_pembeli, nama_alamat, alamat_lengkap, is_main_address } = req.body;
    const newId = await generateId({
      model: AlamatPembeli, 
      prefix: 'ALMT', 
      fieldName: 'id_alamat'});
    const alamat = await AlamatPembeli.create({
      id_alamat: newId,
      id_pembeli,
      nama_alamat,
      alamat_lengkap,
      is_main_address,
    });
    res.status(201).json({message: "Alamat pembeli berhasil dibuat!", alamat});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllAlamatPembeli = async (req, res) => {
  try {
    const alamat = await AlamatPembeli.findAll();
    res.status(200).json({message: "Alamat pembeli didapatkan!", alamat});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlamatPembeliById = async (req, res) => {
  try {
    const alamat = await AlamatPembeli.findByPk(req.params.id);
    if (!alamat) return res.status(404).json({ message: 'Alamat tidak ditemukan' });
    res.status(200).json({message: "Alamat pembeli ditemukan!", alamat});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlamatPembeliByPembeliId = async (req, res) => {
  try {
    const alamat = await AlamatPembeli.findAll({ where: {id_pembeli: req.params.id }});
    if (!alamat) return res.status(404).json({ message: 'Alamat tidak ditemukan' });
    res.status(200).json({message: "Alamat pembeli ditemukan!", alamat});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAlamatPembeli = async (req, res) => {
  try {
    const { id_pembeli, nama_alamat, alamat_lengkap, is_main_address } = req.body;
    const alamat = await AlamatPembeli.findByPk(req.params.id);
    if (!alamat) return res.status(404).json({ message: 'Alamat tidak ditemukan' });
    await alamat.update({ id_pembeli, nama_alamat, alamat_lengkap, is_main_address });
    res.status(200).json({message: "Alamat pembeli berhasil diupdate!", alamat});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAlamatPembeli = async (req, res) => {
  try {
    const alamat = await AlamatPembeli.findByPk(req.params.id);
    if (!alamat) return res.status(404).json({ message: 'Alamat tidak ditemukan' });
    await alamat.destroy();
    res.status(200).json({ message: "Alamat pembeli berhasil dihapus!", alamat});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};