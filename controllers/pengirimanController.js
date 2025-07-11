const { v4: uuidv4 } = require('uuid');
const Pengiriman = require('../models/pengiriman');
const generateId = require('../utils/generateId');

// const generateNewId = async () => {
//   const last = await Pengiriman.findOne({
//     order: [['id_pengiriman', 'DESC']]
//   });

//   if (!last || !/^PGR\d+$/.test(last.id_pengiriman)) return 'PGR1';

//   const lastId = last.id_pengiriman;
//   const numericPart = parseInt(lastId.slice(3));
//   const newNumericPart = numericPart + 1;
//   return `PGR${newNumericPart}`;
// };

exports.createPengiriman = async (req, res) => {
  try {
    const { id_pembelian, id_pengkonfirmasi, tanggal_mulai, tanggal_berakhir, status_pengiriman, jenis_pengiriman } = req.body;
    const newId = await generateId({
      model: Pengiriman,
      prefix: 'PGR',
      fieldName: 'id_pengiriman'
    });
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
    console.log('Data diterima:', req.body); // Tambah log
    const pengiriman = await Pengiriman.findByPk(req.params.id);
    if (!pengiriman) return res.status(404).json({ message: 'Pengiriman tidak ditemukan' });
    await pengiriman.update({ id_pembelian, id_pengkonfirmasi, tanggal_mulai, tanggal_berakhir, status_pengiriman, jenis_pengiriman });
    console.log('Data setelah update:', pengiriman.toJSON()); // Tambah log
    res.status(200).json(pengiriman);
  } catch (error) {
    console.error('Error:', error.message);
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

// exports.updatePengiriman = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status_pengiriman, tanggal_mulai, tanggal_berakhir } = req.body;

//     const pengiriman = await Pengiriman.findByPk(id);
//     if (!pengiriman) {
//       return res.status(404).json({ message: 'Pengiriman not found' });
//     }

//     await pengiriman.update({ status_pengiriman, tanggal_mulai, tanggal_berakhir });

//     res.status(200).json({ message: 'Pengiriman updated successfully' });
//   } catch (error) {
//     console.error('Error in updatePengiriman:', error);
//     res.status(500).json({ error: error.message });
//   }
// };