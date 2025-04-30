const Penitip = require('../models/penitip');
const Akun = require('../models/akun');
const bcrypt = require('bcryptjs');
const generateId = require('../utils/generateId');
const sequelize = require('../config/database');

exports.createPenitip = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { nama_penitip, foto_ktp, nomor_ktp, tanggal_registrasi, akun } = req.body;
    
    let profilePicturePath = null;
    if (req.file) {
      profilePicturePath = `/uploads/${req.file.filename}`;
    }

    const newAkunId = await generateId({
      model: Akun,
      prefix: 'A',
      fieldName: 'id_akun'
    });
    
    const hashedPassword = await bcrypt.hash(akun.password || 'defaultPassword', 10);
    
    const newAkun = await Akun.create({
      id_akun: newAkunId,
      profile_picture: profilePicturePath || (akun.profile_picture || null),
      email: akun.email,
      password: hashedPassword,
      role: akun.role
    }, { transaction: t });
    
    const newPenitipId = await generateId({
      model: Penitip,
      prefix: 'T',
      fieldName: 'id_penitip'
    });
    
    const penitip = await Penitip.create({
      id_penitip: newPenitipId,
      id_akun: newAkunId,
      nama_penitip,
      foto_ktp,
      nomor_ktp,
      keuntungan: 0, // Default values
      rating: 0,
      badge: 'Pemula',
      total_poin: 0,
      tanggal_registrasi,
    }, { transaction: t });
    
    await t.commit();
    
    const result = {
      ...penitip.dataValues,
      akun: {
        ...newAkun.dataValues,
        password: undefined
      }
    };
    
    res.status(201).json(result);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.createPenitipTanpaAkun = async (req, res) => {
  try {
    const { id_akun, nama_penitip, foto_ktp, nomor_ktp, keuntungan, rating, badge, total_poin, tanggal_registrasi } = req.body;
    const newId = await generateId({
      model: Penitip,
      prefix: 'T',
      fieldName: 'id_penitip'
    });
    const penitip = await Penitip.create({
      id_penitip: newId,
      id_akun,
      nama_penitip,
      foto_ktp,
      nomor_ktp,
      keuntungan,
      rating,
      badge,
      total_poin,
      tanggal_registrasi,
    });
    res.status(201).json(penitip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPenitip = async (req, res) => {
  try {
    const penitip = await Penitip.findAll({
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }],
      order: [['id_penitip', 'ASC']]
    });
    res.status(200).json(penitip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPenitipById = async (req, res) => {
  try {
    const penitip = await Penitip.findByPk(req.params.id, {
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }]
    });
    if (!penitip) return res.status(404).json({ message: 'Penitip tidak ditemukan' });
    res.status(200).json(penitip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePenitip = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { nama_penitip, foto_ktp, nomor_ktp, keuntungan, rating, badge, total_poin, tanggal_registrasi, akun } = req.body;
    const penitip = await Penitip.findByPk(req.params.id);
    
    if (!penitip) {
      await t.rollback();
      return res.status(404).json({ message: 'Penitip tidak ditemukan' });
    }
    
    // Update penitip information
    await penitip.update({ 
      nama_penitip, 
      foto_ktp, 
      nomor_ktp,
      keuntungan,
      rating,
      badge,
      total_poin,
      tanggal_registrasi
    }, { transaction: t });
    
    if (akun) {
      const penitipAkun = await Akun.findByPk(penitip.id_akun);
      
      if (!penitipAkun) {
        await t.rollback();
        return res.status(404).json({ message: 'Akun penitip tidak ditemukan' });
      }
      
      const updateData = {
        email: akun.email,
        role: akun.role
      };
      
      if (akun.password) {
        updateData.password = await bcrypt.hash(akun.password, 10);
      }
      
      if (req.file) {
        updateData.profile_picture = `/uploads/${req.file.filename}`;
      }
      
      await penitipAkun.update(updateData, { transaction: t });
    }
    
    await t.commit();
    
    const updatedPenitip = await Penitip.findByPk(req.params.id, {
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }]
    });
    
    res.status(200).json(updatedPenitip);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.deletePenitip = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const penitip = await Penitip.findByPk(req.params.id);
    if (!penitip) return res.status(404).json({ message: 'Penitip tidak ditemukan' });
    
    const akunId = penitip.id_akun;
    
    await penitip.destroy({ transaction: t });
    
    const akun = await Akun.findByPk(akunId);
    if (akun) {
      await akun.destroy({ transaction: t });
    }
    
    await t.commit();
    res.status(204).json();
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.getAkunByPenitipId = async (req, res) => {
  try {
    const penitip = await Penitip.findByPk(req.params.id);
    if (!penitip) return res.status(404).json({ message: 'Penitip tidak ditemukan' });
    
    const akun = await Akun.findByPk(penitip.id_akun, {
      attributes: ['id_akun', 'email', 'role', 'profile_picture']
    });
    
    if (!akun) return res.status(404).json({ message: 'Akun tidak ditemukan' });
    
    res.status(200).json(akun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};