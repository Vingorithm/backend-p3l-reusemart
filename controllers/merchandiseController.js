const { v4: uuidv4 } = require('uuid');
const Merchandise = require('../models/merchandise');
const generateId = require('../utils/generateId');

exports.createMerchandise = async (req, res) => {
  try {
    const { id_admin, nama_merchandise, harga_poin, deskripsi, gambar, stok_merchandise } = req.body;
    const newId = await generateId({
      model: Merchandise,
      prefix: 'MRC',
      fieldName: 'id_merchandise'
    });
    const merchandise = await Merchandise.create({
      id_merchandise: newId,
      id_admin,
      nama_merchandise,
      deskripsi,
      gambar,
      harga_poin,
      stok_merchandise,
    });
    res.status(201).json(merchandise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllMerchandise = async (req, res) => {
  try {
    const merchandise = await Merchandise.findAll();
    res.status(200).json(merchandise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMerchandiseById = async (req, res) => {
  try {
    const merchandise = await Merchandise.findByPk(req.params.id);
    if (!merchandise) return res.status(404).json({ message: 'Merchandise tidak ditemukan' });
    res.status(200).json(merchandise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMerchandise = async (req, res) => {
  try {
    const { id_admin, nama_merchandise, harga_poin, deskripsi, gambar, stok_merchandise } = req.body;
    const merchandise = await Merchandise.findByPk(req.params.id);
    if (!merchandise) return res.status(404).json({ message: 'Merchandise tidak ditemukan' });
    await merchandise.update({ id_admin, nama_merchandise, deskripsi, gambar, harga_poin, stok_merchandise });
    res.status(200).json(merchandise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMerchandise = async (req, res) => {
  try {
    const merchandise = await Merchandise.findByPk(req.params.id);
    if (!merchandise) return res.status(404).json({ message: 'Merchandise tidak ditemukan' });
    await merchandise.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllMobileMerchandise = async (req, res) => {
  try {
    const merchandise = await Merchandise.findAll();
    
    // Transform data untuk mobile dengan base URL
    const mobileData = merchandise.map(item => ({
      ...item.dataValues,
      gambar: `http://10.0.2.2:3000/uploads/merchandise/${item.gambar}`
    }));
    
    res.status(200).json(mobileData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getMobileMerchandiseById = async (req, res) => {
  try {
    const merchandise = await Merchandise.findByPk(req.params.id);
    
    if (!merchandise) {
      return res.status(404).json({ message: 'Merchandise tidak ditemukan' });
    }

    // Transform data untuk mobile dengan base URL
    const mobileData = {
      id_merchandise: merchandise.id_merchandise,
      id_admin: merchandise.id_admin,
      nama_merchandise: merchandise.nama_merchandise,
      harga_poin: merchandise.harga_poin,
      deskripsi: merchandise.deskripsi,
      stok_merchandise: merchandise.stok_merchandise,
      gambar: `http://10.0.2.2:3000/uploads/merchandise/${merchandise.gambar}`
    };

    res.status(200).json(mobileData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStokMerchandise = async (req, res) => {
  try {
    const { stok_merchandise } = req.body;
    const merchandise = await Merchandise.findByPk(req.params.id);
    
    if (!merchandise) {
      return res.status(404).json({ message: 'Merchandise tidak ditemukan' });
    }
    
    // Update stok merchandise
    await merchandise.update({ stok_merchandise });
    
    // Return updated merchandise data dengan base URL untuk mobile
    const updatedData = {
      id_merchandise: merchandise.id_merchandise,
      id_admin: merchandise.id_admin,
      nama_merchandise: merchandise.nama_merchandise,
      harga_poin: merchandise.harga_poin,
      deskripsi: merchandise.deskripsi,
      stok_merchandise: merchandise.stok_merchandise,
      gambar: `http://10.0.2.2:3000/uploads/merchandise/${merchandise.gambar}`
    };
    
    res.status(200).json({ message: "Stok berhasil diupdate!", merchandise: updatedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
