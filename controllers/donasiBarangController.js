const { v4: uuidv4 } = require('uuid');
const DonasiBarang = require('../models/donasiBarang');

const generateNewId = async () => {
  const last = await DonasiBarang.findOne({
    order: [['id_donasi_barang', 'DESC']]
  });

  if (!last) return 'DNB1';

  const lastId = last.id_donasi_barang;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = numericPart + 1;
  return `DNB${newNumericPart}`;
};

exports.createDonasiBarang = async (req, res) => {
  try {
    const { id_request_donasi, id_owner, id_barang, tanggal_donasi } = req.body;
    const newId = await generateNewId();
    const donasi = await DonasiBarang.create({
      id_donasi_barang: newId,
      id_request_donasi,
      id_owner,
      id_barang,
      tanggal_donasi,
    });
    res.status(201).json(donasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDonasiBarang = async (req, res) => {
  try {
    const donasi = await DonasiBarang.findAll();
    res.status(200).json(donasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDonasiBarangById = async (req, res) => {
  try {
    const donasi = await DonasiBarang.findByPk(req.params.id);
    if (!donasi) return res.status(404).json({ message: 'Donasi barang tidak ditemukan' });
    res.status(200).json(donasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDonasiBarang = async (req, res) => {
  try {
    const { id_request_donasi, id_owner, id_barang, tanggal_donasi } = req.body;
    const donasi = await DonasiBarang.findByPk(req.params.id);
    if (!donasi) return res.status(404).json({ message: 'Donasi barang tidak ditemukan' });
    await donasi.update({ id_request_donasi, id_owner, id_barang, tanggal_donasi });
    res.status(200).json(donasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDonasiBarang = async (req, res) => {
  try {
    const donasi = await DonasiBarang.findByPk(req.params.id);
    if (!donasi) return res.status(404).json({ message: 'Donasi barang tidak ditemukan' });
    await donasi.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};