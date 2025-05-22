const { v4: uuidv4 } = require('uuid');
const Keranjang = require('../models/keranjang');
const generateId = require('../utils/generateId');
const Barang = require('../models/barang');
const Penitipan = require('../models/penitipan');
const Penitip = require('../models/penitip');

exports.createKeranjang = async (req, res) => {
  try {
    const { id_barang, id_pembeli } = req.body;
    const newId = await generateId({
      model: Keranjang,
      prefix: 'KRJ',
      fieldName: 'id_keranjang'
    });
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

exports.getKeranjangByIdPembeli = async (req, res) => {
  try {
    const keranjang = await Keranjang.findAll({ where: { 'id_pembeli': req.params.id},
      include: [
        {
          model: Barang,
          include: [
            {
              model: Penitipan,
            },
            {
              model: Penitip
            }
          ],
        },
      ],
    });
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