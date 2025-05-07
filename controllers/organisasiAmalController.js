const OrganisasiAmal = require('../models/organisasiAmal');
const Akun = require('../models/akun');
const bcrypt = require('bcryptjs');
const generateId = require('../utils/generateId');
const sequelize = require('../config/database');
const path = require('path');
const fs = require('fs');

exports.createOrganisasiAmal = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { nama_organisasi, alamat, akun } = req.body;
    
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
      profile_picture: akun.profile_picture,
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
      tanggal_registrasi: new Date(),
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
    res.status(500).json({ error: error.message, input: req.body });
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
    const { nama_organisasi, alamat} = req.body;
    const organisasi = await OrganisasiAmal.findByPk(req.params.id);
    
    if (!organisasi) {
      await t.rollback();
      return res.status(404).json({ message: 'Organisasi tidak ditemukan' });
    }
    
    // Update organisasi information
    await organisasi.update({ 
      nama_organisasi, 
      alamat
    }, { transaction: t });

    const akun = await Akun.findByPk(organisasi.id_akun);  
    if (akun) {
      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const newFileName = `pp${akun.id_akun}${ext}`;
        const newPath = path.join(__dirname, '../uploads/profile_picture', newFileName);
  
        // Rename file
        fs.renameSync(req.file.path, newPath);
  
        // Update nama file di database
        akun.profile_picture = newFileName;
        await akun.save({ transaction: t });
      }
    } else {
      await t.rollback();
      return res.status(404).json({ message: 'Akun organisasi tidak ditemukan' });
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

exports.getOrganisasiAmalByAkun = async (req, res) => {
  try {
    const organisasi = await OrganisasiAmal.findOne({
      where: { id_akun: req.params.id },
      include: [
        {
          model: Akun,
          attributes: ['id_akun', 'email', 'profile_picture'],
        },
      ],
    });

    if (!organisasi) {
      return res.status(404).json({ message: 'Organisasi tidak ditemukan untuk akun ini' });
    }

    res.status(200).json(organisasi);
  } catch (error) {
    console.error('Error in getOrganisasiAmalByAkun:', error);
    res.status(500).json({ error: error.message });
  }
};