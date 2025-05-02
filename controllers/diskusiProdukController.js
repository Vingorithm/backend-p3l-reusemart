const { sequelize } = require('../config/database');
const DiskusiProduk = require('../models/diskusiProduk');
const Pembeli = require('../models/pembeli');
const Pegawai = require('../models/pegawai');
const Barang = require('../models/barang');

exports.getAllDiskusiProduk = async (req, res) => {
  try {
    const diskusi = await DiskusiProduk.findAll({
      include: [
        { model: Pembeli, attributes: ['id_pembeli', 'nama'] },
        { model: Pegawai, attributes: ['id_pegawai', 'nama_pegawai'] }
      ]
    });
    res.status(200).json(diskusi);
  } catch (error) {
    console.error('Error getting all discussions:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDiskusiProdukById = async (req, res) => {
  try {
    const diskusi = await DiskusiProduk.findByPk(req.params.id, {
      include: [
        { model: Pembeli, attributes: ['id_pembeli', 'nama'] },
        { model: Pegawai, attributes: ['id_pegawai', 'nama_pegawai'] },
        { model: Barang, attributes: ['id_barang', 'nama'] }
      ]
    });
    
    if (!diskusi) {
      return res.status(404).json({ message: 'Diskusi tidak ditemukan' });
    }
    
    res.status(200).json(diskusi);
  } catch (error) {
    console.error('Error getting discussion by ID:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDiskusiProdukByIdBarang = async (req, res) => {
  try {
    const { id } = req.params;
    
    const diskusi = await DiskusiProduk.findAll({
      where: { id_barang: id },
      include: [
        { 
          model: Pembeli, 
          attributes: ['id_pembeli', 'nama'] 
        },
        { 
          model: Pegawai, 
          attributes: ['id_pegawai', 'nama_pegawai'] 
        }
      ],
      order: [['tanggal_pertanyaan', 'DESC']]
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
    
    if (!id_barang || !id_pembeli || !pertanyaan || pertanyaan.trim() === '') {
      return res.status(400).json({ 
        message: 'ID barang, ID pembeli, dan pertanyaan diperlukan' 
      });
    }
    
    const diskusi = await DiskusiProduk.create({
      id_diskusi_produk: `DSK${Date.now()}`,
      id_barang,
      id_pembeli,
      id_customer_service: null,
      pertanyaan,
      jawaban: null,
      tanggal_pertanyaan: new Date(),
      tanggal_jawaban: null
    });
    
    const createdDiskusi = await DiskusiProduk.findByPk(diskusi.id_diskusi_produk, {
      include: [
        { model: Pembeli, attributes: ['id_pembeli', 'nama'] }
      ]
    });
    
    res.status(201).json(createdDiskusi);
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateDiskusiProduk = async (req, res) => {
  try {
    const { id_customer_service, jawaban } = req.body;
    
    if (!id_customer_service || !jawaban || jawaban.trim() === '') {
      return res.status(400).json({ 
        message: 'ID customer service dan jawaban diperlukan' 
      });
    }
    
    const diskusi = await DiskusiProduk.findByPk(req.params.id);
    
    if (!diskusi) {
      return res.status(404).json({ message: 'Diskusi tidak ditemukan' });
    }
    
    await diskusi.update({ 
      id_customer_service, 
      jawaban, 
      tanggal_jawaban: new Date() 
    });
    
    const updatedDiskusi = await DiskusiProduk.findByPk(diskusi.id_diskusi_produk, {
      include: [
        { model: Pembeli, attributes: ['id_pembeli', 'nama'] },
        { model: Pegawai, attributes: ['id_pegawai', 'nama_pegawai'] }
      ]
    });
    
    res.status(200).json(updatedDiskusi);
  } catch (error) {
    console.error('Error updating discussion:', error);
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
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ error: error.message });
  }
};