const { v4: uuidv4 } = require('uuid');
const Pembeli = require('../models/pembeli');
const generateId = require('../utils/generateId');

// const generateNewId = async () => {
//   const last = await Pembeli.findOne({
//     order: [['id_pembeli', 'DESC']]
//   });

//   if (!last || !/^PBL\d+$/.test(last.id_pembeli)) return 'PBL1';

//   const lastId = last.id_pembeli;
//   const numericPart = parseInt(lastId.slice(3));
//   const newNumericPart = numericPart + 1;
//   return `PBL${newNumericPart}`;
// };

exports.createPembeli = async (req, res) => {
  try {
    const { id_akun, nama, total_poin, tanggal_registrasi } = req.body;
    const newId = await generateId({
      model: Pembeli,
      prefix: 'PBL',
      fieldName: 'id_pembeli'
    });
    const pembeli = await Pembeli.create({
      id_pembeli: newId,
      id_akun,
      nama,
      total_poin,
      tanggal_registrasi,
    });
    res.status(201).json(pembeli);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPembeli = async (req, res) => {
  try {
    const pembeli = await Pembeli.findAll();
    res.status(200).json(pembeli);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPembeliById = async (req, res) => {
  try {
    const pembeli = await Pembeli.findByPk(req.params.id);
    if (!pembeli) return res.status(404).json({ message: 'Pembeli tidak ditemukan' });
    res.status(200).json(pembeli);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePembeli = async (req, res) => {
  try {
    const { id_akun, nama, total_poin, tanggal_registrasi } = req.body;
    const pembeli = await Pembeli.findByPk(req.params.id);
    if (!pembeli) return res.status(404).json({ message: 'Pembeli tidak ditemukan' });
    await pembeli.update({ id_akun, nama, total_poin, tanggal_registrasi });
    res.status(200).json(pembeli);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePembeli = async (req, res) => {
  try {
    const pembeli = await Pembeli.findByPk(req.params.id);
    if (!pembeli) return res.status(404).json({ message: 'Pembeli tidak ditemukan' });
    await pembeli.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};