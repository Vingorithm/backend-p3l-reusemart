const { v4: uuidv4 } = require('uuid');
const Keranjang = require('../models/keranjang');

const generateNewId = async () => {
  const last = await Keranjang.findOne({
    order: [['id_keranjang', 'DESC']]
  });

  if (!last) return 'KRJ1';

  const lastId = last.id_keranjang;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = numericPart + 1;
  return `KRJ${newNumericPart}`;
};

exports.createKeranjang = async (req, res) => {
  try {
    const { id_barang, id_pembeli } = req.body;
    const newId = await generateNewId();
    const keranjang = await Keranjang.create({
      id_keranjang: newId,
      id_barang,
      id_pembeli,
    });
    res.status(201).json(keranjang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllKeranjang = async (req, res) => {
  try {
    const keranjang = await Keranjang.findAll();
    res.status(200).json(keranjang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getKeranjangById = async (req, res) => {
  try {
    const keranjang = await Keranjang.findByPk(req.params.id);
    if (!keranjang) return res.status(404).json({ message: 'Keranjang tidak ditemukan' });
    res.status(200).json(keranjang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateKeranjang = async (req, res) => {
  try {
    const { id_barang, id_pembeli } = req.body;
    const keranjang = await Keranjang.findByPk(req.params.id);
    if (!keranjang) return res.status(404).json({ message: 'Keranjang tidak ditemukan' });
    await keranjang.update({ id_barang, id_pembeli });
    res.status(200).json(keranjang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteKeranjang = async (req, res) => {
  try {
    const keranjang = await Keranjang.findByPk(req.params.id);
    if (!keranjang) return res.status(404).json({ message: 'Keranjang tidak ditemukan' });
    await keranjang.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};