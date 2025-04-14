const { v4: uuidv4 } = require('uuid');
const Pengiriman = require('../models/pengiriman');

const generateNewId = async () => {
  const last = await Pengiriman.findOne({
    order: [['id_pengiriman', 'DESC']]
  });

  if (!last || !/^PGR\d+$/.test(last.id_pengiriman)) return 'PGR1';

  const lastId = last.id_pengiriman;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = numericPart + 1;
  return `PGR${newNumericPart}`;
};

exports.createPengiriman = async (req, res) => {
  try {
    const { id_pembelian, id_pengkonfirmasi, tanggal_mulai, tanggal_berakhir, status_pengiriman, jenis_pengiriman } = req.body;
    const newId = await generateNewId();
    const pengiriman = await Pengiriman.create({
      id_pengiriman: newId,
      id_pembelian,
      id_pengkonfirmasi,
      tanggal_mulai,
      tanggal_berakhir,
      status_pengiriman,
      jenis_pengiriman,
    });
    res.status(201).json(pengiriman);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPengiriman = async (req, res) => {
  try {
    const pengiriman = await Pengiriman.findAll();
    res.status(200).json(pengiriman);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPengirimanById = async (req, res) => {
  try {
    const pengiriman = await Pengiriman.findByPk(req.params.id);
    if (!pengiriman) return res.status(404).json({ message: 'Pengiriman tidak ditemukan' });
    res.status(200).json(pengiriman);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePengiriman = async (req, res) => {
  try {
    const { id_pembelian, id_pengkonfirmasi, tanggal_mulai, tanggal_berakhir, status_pengiriman, jenis_pengiriman } = req.body;
    const pengiriman = await Pengiriman.findByPk(req.params.id);
    if (!pengiriman) return res.status(404).json({ message: 'Pengiriman tidak ditemukan' });
    await pengiriman.update({ id_pembelian, id_pengkonfirmasi, tanggal_mulai, tanggal_berakhir, status_pengiriman, jenis_pengiriman });
    res.status(200).json(pengiriman);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePengiriman = async (req, res) => {
  try {
    const pengiriman = await Pengiriman.findByPk(req.params.id);
    if (!pengiriman) return res.status(404).json({ message: 'Pengiriman tidak ditemukan' });
    await pengiriman.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};