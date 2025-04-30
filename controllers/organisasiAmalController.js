const OrganisasiAmal = require('../models/organisasiAmal');
const Akun = require('../models/akun');
const bcrypt = require('bcryptjs');
const generateId = require('../utils/generateId');
const sequelize = require('../config/database');

exports.createOrganisasiAmal = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { nama_organisasi, alamat, tanggal_registrasi, akun } = req.body;
    
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
    
    const newOrganisasiId = await generateId({
      model: OrganisasiAmal,
      prefix: 'ORG',
      fieldName: 'id_organisasi'
    });
    
    const organisasi = await OrganisasiAmal.create({
      id_organisasi: newOrganisasiId,
      id_akun: newAkunId,
      nama_organisasi,
      alamat,
      tanggal_registrasi,
    }, { transaction: t });
    
    await t.commit();
    
    const result = {
      ...organisasi.dataValues,
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

exports.createOrganisasiAmalTanpaAkun = async (req, res) => {
  try {
    const { id_akun, nama_organisasi, alamat, tanggal_registrasi } = req.body;
    const newId = await generateId({
      model: OrganisasiAmal,
      prefix: 'ORG',
      fieldName: 'id_organisasi'
    });
    const organisasi = await OrganisasiAmal.create({
      id_organisasi: newId,
      id_akun,
      nama_organisasi,
      alamat,
      tanggal_registrasi,
    });
    res.status(201).json(organisasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllOrganisasiAmal = async (req, res) => {
  try {
    const organisasi = await OrganisasiAmal.findAll({
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }],
      order: [['id_organisasi', 'ASC']]
    });
    res.status(200).json(organisasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrganisasiAmalById = async (req, res) => {
  try {
    const organisasi = await OrganisasiAmal.findByPk(req.params.id, {
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }]
    });
    if (!organisasi) return res.status(404).json({ message: 'Organisasi tidak ditemukan' });
    res.status(200).json(organisasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrganisasiAmal = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { nama_organisasi, alamat, tanggal_registrasi, akun } = req.body;
    const organisasi = await OrganisasiAmal.findByPk(req.params.id);
    
    if (!organisasi) {
      await t.rollback();
      return res.status(404).json({ message: 'Organisasi tidak ditemukan' });
    }
    
    // Update organisasi information
    await organisasi.update({ 
      nama_organisasi, 
      alamat, 
      tanggal_registrasi 
    }, { transaction: t });
    
    if (akun) {
      const organisasiAkun = await Akun.findByPk(organisasi.id_akun);
      
      if (!organisasiAkun) {
        await t.rollback();
        return res.status(404).json({ message: 'Akun organisasi tidak ditemukan' });
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
      
      await organisasiAkun.update(updateData, { transaction: t });
    }
    
    await t.commit();
    
    const updatedOrganisasi = await OrganisasiAmal.findByPk(req.params.id, {
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }]
    });
    
    res.status(200).json(updatedOrganisasi);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOrganisasiAmal = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const organisasi = await OrganisasiAmal.findByPk(req.params.id);
    if (!organisasi) return res.status(404).json({ message: 'Organisasi tidak ditemukan' });
    
    const akunId = organisasi.id_akun;
    
    await organisasi.destroy({ transaction: t });
    
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

exports.getAkunByOrganisasiId = async (req, res) => {
  try {
    const organisasi = await OrganisasiAmal.findByPk(req.params.id);
    if (!organisasi) return res.status(404).json({ message: 'Organisasi tidak ditemukan' });
    
    const akun = await Akun.findByPk(organisasi.id_akun, {
      attributes: ['id_akun', 'email', 'role', 'profile_picture']
    });
    
    if (!akun) return res.status(404).json({ message: 'Akun tidak ditemukan' });
    
    res.status(200).json(akun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};