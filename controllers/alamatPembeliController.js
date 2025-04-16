const { v4: uuidv4 } = require('uuid');
const AlamatPembeli = require('../models/alamatPembeli');

const generateNewId = async (Model, prefix, idField) => {
  const last = await Model.findOne({
    order: [[idField, 'DESC']]
  });

  if (!last) return `${prefix}1`;

  const lastId = last[idField];
  const numericPart = parseInt(lastId.replace(/[^\d]/g, ''));
  const newNumericPart = numericPart + 1;
  return `${prefix}${newNumericPart}`;
};

exports.createAlamatPembeli = async (req, res) => {
  try {
    const { id_pembeli, nama_alamat, alamat_lengkap, is_main_address } = req.body;
    const newId = await generateNewId(AlamatPembeli, 'ALMT', 'id_alamat');
    const alamat = await AlamatPembeli.create({
      id_alamat: newId,
      id_pembeli,
      nama_alamat,
      alamat_lengkap,
      is_main_address,
    });
    res.status(201).json(alamat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllAlamatPembeli = async (req, res) => {
  try {
    const alamat = await AlamatPembeli.findAll();
    res.status(200).json(alamat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlamatPembeliById = async (req, res) => {
  try {
    const alamat = await AlamatPembeli.findByPk(req.params.id);
    if (!alamat) return res.status(404).json({ message: 'Alamat tidak ditemukan' });
    res.status(200).json(alamat);
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
    res.status(200).json(alamat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAlamatPembeli = async (req, res) => {
  try {
    const alamat = await AlamatPembeli.findByPk(req.params.id);
    if (!alamat) return res.status(404).json({ message: 'Alamat tidak ditemukan' });
    await alamat.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};