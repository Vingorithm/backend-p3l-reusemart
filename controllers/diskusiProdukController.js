const DiskusiProduk = require('../models/diskusiProduk');
const Pembeli = require('../models/pembeli');
const Penitip = require('../models/penitip');
const { sequelize } = require('../config/database');

exports.getAllDiskusiProduk = async (req, res) => {
  try {
    const diskusi = await DiskusiProduk.findAll();
    res.status(200).json(diskusi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDiskusiProdukById = async (req, res) => {
  try {
    const diskusi = await DiskusiProduk.findByPk(req.params.id);
    if (!diskusi) return res.status(404).json({ message: 'Diskusi tidak ditemukan' });
    res.status(200).json(diskusi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDiskusiProdukByIdBarang = async (req, res) => {
  try {
    const { id } = req.params;
    
    const diskusi = await sequelize.query(`
      SELECT d.*,
             p.nama as nama_penanya,
             cs.nama_pegawai as nama_penjawab
      FROM DiskusiProduk d
      LEFT JOIN Pembeli p ON d.id_pembeli = p.id_pembeli
      LEFT JOIN Pegawai cs ON d.id_customer_service = cs.id_pegawai
      WHERE d.id_barang = :id
      ORDER BY d.tanggal_pertanyaan DESC
    `, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT
    });
    
    res.status(200).json(diskusi);
  } catch (error) {
    console.error('Error getting discussions by barang ID:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createDiskusiProduk = async (req, res) => {
  try {
    const { id_barang, id_pembeli, pertanyaan } = req.body;
    
    const diskusi = await DiskusiProduk.create({
      id_diskusi: `DSK${Date.now()}`,
      id_barang,
      id_pembeli,
      pertanyaan,
      tanggal_pertanyaan: new Date(),
      id_penitip: null,
      jawaban: null,
      tanggal_jawaban: null
    });
    
    res.status(201).json(diskusi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDiskusiProduk = async (req, res) => {
  try {
    const { id_penitip, jawaban } = req.body;
    const diskusi = await DiskusiProduk.findByPk(req.params.id);
    
    if (!diskusi) {
      return res.status(404).json({ message: 'Diskusi tidak ditemukan' });
    }
    
    await diskusi.update({ 
      id_penitip, 
      jawaban, 
      tanggal_jawaban: new Date() 
    });
    
    res.status(200).json(diskusi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDiskusiProduk = async (req, res) => {
  try {
    const diskusi = await DiskusiProduk.findByPk(req.params.id);
    
    if (!diskusi) {
      return res.status(404).json({ message: 'Diskusi tidak ditemukan' });
    }
    
    await diskusi.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};