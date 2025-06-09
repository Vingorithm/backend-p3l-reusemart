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
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const {
      nama_pegawai,
      tanggal_lahir,
      email,
      password,
      role
    } = req.body;

    // Generate ID untuk akun baru
    const newAkunId = await generateId({
      model: Akun,
      prefix: 'A',
      fieldName: 'id_akun'
    });

    const hashedPassword = await bcrypt.hash(password || 'defaultPassword', 10);
    let profilePicturePath = 'default.jpg';

    const newAkun = await Akun.create({
      id_akun: newAkunId,
      profile_picture: profilePicturePath,
      email,
      password: hashedPassword,
      role
    }, { transaction: t });

    const newPegawaiId = await generateId({
      model: Pegawai,
      prefix: 'P',
      fieldName: 'id_pegawai'
    });

    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const newFilename = `pegawai_${newPegawaiId}${fileExt}`;
      
      const uploadDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const finalPath = path.join(uploadDir, newFilename);
      
      fs.renameSync(req.file.path, finalPath);
      
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
    
    if (result.akun.profile_picture) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      result.akun.profile_picture = `${baseUrl}${result.akun.profile_picture}`;
    }
    
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

    // Add base URL to profile pictures
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    pegawai.forEach(p => {
      if (p.Akun && p.Akun.profile_picture) {
        if (!p.Akun.profile_picture.startsWith('http')) {
          p.Akun.profile_picture = `${baseUrl}${p.Akun.profile_picture}`;
        }
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
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture', 'fcm_token'] }]
    });

    if (!pegawai) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });

    // Add base URL to profile picture
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    if (pegawai.Akun && pegawai.Akun.profile_picture) {
      if (!pegawai.Akun.profile_picture.startsWith('http')) {
        pegawai.Akun.profile_picture = `${baseUrl}${pegawai.Akun.profile_picture}`;
      }
    }

    res.status(200).json(pegawai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePegawai = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    console.log('Update Body:', req.body);
    console.log('Update File:', req.file);
    
  
    // Ambil data dari request
    const { nama_pegawai, tanggal_lahir, email, role, password } = req.body;
    
    // Cari pegawai berdasarkan ID
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

    // Cari akun pegawai
    const pegawaiAkun = await Akun.findByPk(pegawai.id_akun);
    
    if (!pegawaiAkun) {
      await t.rollback();
      return res.status(404).json({ message: 'Akun pegawai tidak ditemukan' });
    }
    
    // Data untuk update akun
    const updateData = {
      email: email || pegawaiAkun.email,
      role: role || pegawaiAkun.role
    };
    
    // Jika password di-reset
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // Jika ada file yang diupload
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const newFilename = `pegawai_${pegawai.id_pegawai}${fileExt}`;
      
      // Buat direktori uploads jika belum ada
      const uploadDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const finalPath = path.join(uploadDir, newFilename);
      
      // Hapus file lama jika ada
      if (pegawaiAkun.profile_picture) {
        const oldFilePath = path.join(__dirname, '..', pegawaiAkun.profile_picture);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Pindahkan file upload ke direktori final
      fs.renameSync(req.file.path, finalPath);
      
      // Set path untuk disimpan di database
      updateData.profile_picture = `/uploads/${newFilename}`;
    }
    
    // Update akun
    await pegawaiAkun.update(updateData, { transaction: t });
    
    await t.commit();
    
    // Ambil data pegawai yang sudah diupdate
    const updatedPegawai = await Pegawai.findByPk(req.params.id, {
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }]
    });
    
    // Add base URL to profile picture
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    if (updatedPegawai.Akun && updatedPegawai.Akun.profile_picture) {
      if (!updatedPegawai.Akun.profile_picture.startsWith('http')) {
        updatedPegawai.Akun.profile_picture = `${baseUrl}${updatedPegawai.Akun.profile_picture}`;
      }
    }
    
    res.status(200).json(updatedPegawai);
  } catch (error) {
    await t.rollback();
    console.error('Error updating pegawai:', error);
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
    
    // Hapus file profile picture jika ada
    if (akun && akun.profile_picture) {
      const profilePicturePath = path.join(__dirname, '..', akun.profile_picture);
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
    
    // Add base URL to profile picture
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    if (akun.profile_picture) {
      if (!akun.profile_picture.startsWith('http')) {
        akun.profile_picture = `${baseUrl}${akun.profile_picture}`;
      }
    }
    
    res.status(200).json(akun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPegawaiByIdAkun = async (req, res) => {
  try {
    const pegawai = await Pegawai.findOne({ 
      where: { id_akun: req.params.id },
      include: [
        {
          model: Akun
        }
      ]
    });
    if (!pegawai) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    res.status(200).json(pegawai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};