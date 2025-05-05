const Pegawai = require('../models/pegawai');
const Akun = require('../models/akun');
const bcrypt = require('bcryptjs');
const generateId = require('../utils/generateId');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

exports.createPegawai = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      nama_pegawai,
      tanggal_lahir,
      email,
      password,
      role
    } = req.body;

    let profilePicturePath = null;
    let tempFilePath = null;
    let fileExt = null;

    if (req.file) {
      tempFilePath = req.file.path;
      fileExt = path.extname(req.file.originalname);
    }

    const newAkunId = await generateId({
      model: Akun,
      prefix: 'A',
      fieldName: 'id_akun'
    });

    const hashedPassword = await bcrypt.hash(password || 'defaultPassword', 10);
    const newAkun = await Akun.create({
      id_akun: newAkunId,
      profile_picture: null,
      email,
      password: hashedPassword,
      role
    }, { transaction: t });

    const newPegawaiId = await generateId({
      model: Pegawai,
      prefix: 'P',
      fieldName: 'id_pegawai'
    });

    if (tempFilePath) {
      const newFilename = `pegawai_${newPegawaiId}${fileExt}`;
      const newPath = path.join('uploads', newFilename);

      fs.renameSync(tempFilePath, newPath);
      profilePicturePath = `/uploads/${newFilename}`;
      await newAkun.update({
        profile_picture: profilePicturePath
      }, { transaction: t });
    }

    const pegawai = await Pegawai.create({
      id_pegawai: newPegawaiId,
      id_akun: newAkunId,
      nama_pegawai,
      tanggal_lahir,
    }, { transaction: t });

    await t.commit();

    const result = {
      ...pegawai.dataValues,
      akun: {
        ...newAkun.dataValues,
        password: undefined
      }
    };
    res.status(201).json(result);
  } catch (error) {
    await t.rollback();
    console.error('Error saat membuat pegawai:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.getAllPegawai = async (req, res) => {
  try {
    const pegawai = await Pegawai.findAll({
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }],
      order: [['id_pegawai', 'ASC']]
    });

    const baseUrl = 'http://localhost:3000/uploads/profile_picture/';
    pegawai.forEach(p => {
      if (p.Akun && p.Akun.profile_picture) {
        p.Akun.profile_picture = `${baseUrl}${p.Akun.profile_picture}`;
      }
    });

    res.status(200).json(pegawai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPegawaiById = async (req, res) => {
  try {
    const pegawai = await Pegawai.findByPk(req.params.id, {
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }]
    });

    if (!pegawai) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });

    const baseUrl = 'http://localhost:3000/uploads/profile_picture/';
    if (pegawai.Akun && pegawai.Akun.profile_picture) {
      pegawai.Akun.profile_picture = `${baseUrl}${pegawai.Akun.profile_picture}`;
    }

    res.status(200).json(pegawai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePegawai = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { nama_pegawai, tanggal_lahir, akun } = req.body;
    const pegawai = await Pegawai.findByPk(req.params.id);
    
    if (!pegawai) {
      await t.rollback();
      return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    }
    
    // Update pegawai information
    await pegawai.update({ 
      nama_pegawai, 
      tanggal_lahir 
    }, { transaction: t });
    
    if (akun) {
      const pegawaiAkun = await Akun.findByPk(pegawai.id_akun);
      
      if (!pegawaiAkun) {
        await t.rollback();
        return res.status(404).json({ message: 'Akun pegawai tidak ditemukan' });
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
      
      await pegawaiAkun.update(updateData, { transaction: t });
    }
    
    await t.commit();
    
    const updatedPegawai = await Pegawai.findByPk(req.params.id, {
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }]
    });
    
    res.status(200).json(updatedPegawai);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.deletePegawai = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const pegawai = await Pegawai.findByPk(req.params.id);
    if (!pegawai) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    const akunId = pegawai.id_akun;
    const akun = await Akun.findByPk(akunId);
    if (akun && akun.profile_picture) {
      const profilePicturePath = path.join(__dirname, '..', 'uploads', akun.profile_picture.replace('/uploads/', ''));
      if (fs.existsSync(profilePicturePath)) {
        fs.unlinkSync(profilePicturePath);
      }
    }

    await pegawai.destroy({ transaction: t });

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

exports.getAkunByPegawaiId = async (req, res) => {
  try {
    const pegawai = await Pegawai.findByPk(req.params.id);
    if (!pegawai) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    
    const akun = await Akun.findByPk(pegawai.id_akun, {
      attributes: ['id_akun', 'email', 'role', 'profile_picture']
    });
    
    if (!akun) return res.status(404).json({ message: 'Akun tidak ditemukan' });
    
    res.status(200).json(akun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPegawaiByIdAkun = async (req, res) => {
  try {
    const pegawai = await Pegawai.findOne({ where: { id_akun: req.params.id } });
    if (!pegawai) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    res.status(200).json(pegawai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};