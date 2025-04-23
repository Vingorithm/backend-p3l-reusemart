const Pembeli = require('../models/pembeli');
const Akun = require('../models/akun');
const bcrypt = require('bcryptjs');
const generateId = require('../utils/generateId');
const sequelize = require('../config/database');

exports.createPembeli = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { nama, total_poin, tanggal_registrasi, akun } = req.body;
    
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
    
    const newPembeliId = await generateId({
      model: Pembeli,
      prefix: 'PBL',
      fieldName: 'id_pembeli'
    });
    
    const pembeli = await Pembeli.create({
      id_pembeli: newPembeliId,
      id_akun: newAkunId,
      nama,
      total_poin: total_poin || 0,
      tanggal_registrasi,
    }, { transaction: t });
    
    await t.commit();
    
    const result = {
      ...pembeli.dataValues,
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

exports.getAllPembeli = async (req, res) => {
  try {
    const pembeli = await Pembeli.findAll({
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }],
      order: [['id_pembeli', 'ASC']]
    });
    res.status(200).json(pembeli);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPembeliById = async (req, res) => {
  try {
    const pembeli = await Pembeli.findByPk(req.params.id, {
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }]
    });
    if (!pembeli) return res.status(404).json({ message: 'Pembeli tidak ditemukan' });
    res.status(200).json(pembeli);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePembeli = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { nama, total_poin, tanggal_registrasi, akun } = req.body;
    const pembeli = await Pembeli.findByPk(req.params.id);
    
    if (!pembeli) {
      await t.rollback();
      return res.status(404).json({ message: 'Pembeli tidak ditemukan' });
    }
    
    // Update pembeli information
    await pembeli.update({ 
      nama, 
      total_poin, 
      tanggal_registrasi 
    }, { transaction: t });
    
    if (akun) {
      const pembeliAkun = await Akun.findByPk(pembeli.id_akun);
      
      if (!pembeliAkun) {
        await t.rollback();
        return res.status(404).json({ message: 'Akun pembeli tidak ditemukan' });
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
      
      await pembeliAkun.update(updateData, { transaction: t });
    }
    
    await t.commit();
    
    const updatedPembeli = await Pembeli.findByPk(req.params.id, {
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }]
    });
    
    res.status(200).json(updatedPembeli);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.deletePembeli = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const pembeli = await Pembeli.findByPk(req.params.id);
    if (!pembeli) return res.status(404).json({ message: 'Pembeli tidak ditemukan' });
    
    const akunId = pembeli.id_akun;
    
    await pembeli.destroy({ transaction: t });
    
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

exports.getAkunByPembeliId = async (req, res) => {
  try {
    const pembeli = await Pembeli.findByPk(req.params.id);
    if (!pembeli) return res.status(404).json({ message: 'Pembeli tidak ditemukan' });
    
    const akun = await Akun.findByPk(pembeli.id_akun, {
      attributes: ['id_akun', 'email', 'role', 'profile_picture']
    });
    
    if (!akun) return res.status(404).json({ message: 'Akun tidak ditemukan' });
    
    res.status(200).json(akun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};