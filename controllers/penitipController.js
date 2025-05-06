const Penitip = require('../models/penitip');
const Akun = require('../models/akun');
const bcrypt = require('bcryptjs');
const generateId = require('../utils/generateId');
const sequelize = require('../config/database');
const path = require('path');
const fs = require('fs');

exports.createPenitip = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { nama_penitip, nomor_ktp, akun } = req.body;

    // Validasi akun
    if (!akun || !akun.email) {
      if (req.files) {
        if (req.files.profile_picture) {
          fs.unlinkSync(req.files.profile_picture[0].path);
          console.log(`Deleted temporary profile_picture: ${req.files.profile_picture[0].path}`);
        }
        if (req.files.foto_ktp) {
          fs.unlinkSync(req.files.foto_ktp[0].path);
          console.log(`Deleted temporary foto_ktp: ${req.files.foto_ktp[0].path}`);
        }
      }
      await t.rollback();
      return res.status(400).json({ error: 'Email tidak boleh kosong' });
    }

    // Cek email duplikat sebelum memproses file
    const existingAkun = await Akun.findOne({ where: { email: akun.email } });
    if (existingAkun) {
      if (req.files) {
        if (req.files.profile_picture) {
          fs.unlinkSync(req.files.profile_picture[0].path);
          console.log(`Deleted temporary profile_picture: ${req.files.profile_picture[0].path}`);
        }
        if (req.files.foto_ktp) {
          fs.unlinkSync(req.files.foto_ktp[0].path);
          console.log(`Deleted temporary foto_ktp: ${req.files.foto_ktp[0].path}`);
        }
      }
      await t.rollback();
      return res.status(400).json({ error: 'Email sudah digunakan' });
    }

    const newAkunId = await generateId({
      model: Akun,
      prefix: 'A',
      fieldName: 'id_akun',
    });

    // Penanganan profile_picture
    let profilePicturePath = null;
    let profilePictureName = null;

    if (req.files && req.files.profile_picture) {
      const profilePictureFile = req.files.profile_picture[0];
      const ext = path.extname(profilePictureFile.originalname);
      const newName = `pp${newAkunId.slice(1)}${ext}`;
      const destPath = `uploads/profile_picture/${newName}`;
      console.log('Renaming profile_picture from:', profilePictureFile.path, 'to:', destPath);
      fs.renameSync(profilePictureFile.path, destPath);
      profilePicturePath = newName;
      profilePictureName = newName;
    }

    const hashedPassword = await bcrypt.hash(akun.password || 'defaultPassword', 10);

    const newAkun = await Akun.create(
      {
        id_akun: newAkunId,
        profile_picture: profilePicturePath || null,
        email: akun.email,
        password: hashedPassword,
        role: 'Penitip',
      },
      { transaction: t }
    );

    const newPenitipId = await generateId({
      model: Penitip,
      prefix: 'T',
      fieldName: 'id_penitip',
    });

    // Penanganan foto_ktp
    let fotoKtpPath = null;
    let fotoKtpName = null;

    if (req.files && req.files.foto_ktp) {
      const fotoKtpFile = req.files.foto_ktp[0];
      const ext = path.extname(fotoKtpFile.originalname);
      const newName = `ktp${newPenitipId.slice(1)}${ext}`;
      const destPath = `uploads/ktp/${newName}`;
      console.log('Renaming foto_ktp from:', fotoKtpFile.path, 'to:', destPath);
      fs.renameSync(fotoKtpFile.path, destPath);
      fotoKtpPath = newName;
      fotoKtpName = newName;
    }

    const penitip = await Penitip.create(
      {
        id_penitip: newPenitipId,
        id_akun: newAkunId,
        nama_penitip,
        foto_ktp: fotoKtpPath,
        nomor_ktp,
        keuntungan: 0,
        rating: 0,
        badge: 0,
        total_poin: 0,
        tanggal_registrasi: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    const result = {
      ...penitip.dataValues,
      akun: {
        ...newAkun.dataValues,
        password: undefined,
      },
    };

    res.status(201).json(result);
  } catch (error) {
    // Hapus file yang sudah dipindahkan jika terjadi error
    if (req.files) {
      if (req.files.profile_picture) {
        const profilePicturePath = `uploads/profile_picture/pp${newAkunId?.slice(1)}${path.extname(req.files.profile_picture[0].originalname)}`;
        if (fs.existsSync(profilePicturePath)) {
          fs.unlinkSync(profilePicturePath);
          console.log(`Deleted profile_picture: ${profilePicturePath}`);
        }
      }
      if (req.files.foto_ktp) {
        const fotoKtpPath = `uploads/ktp/ktp${newPenitipId?.slice(1)}${path.extname(req.files.foto_ktp[0].originalname)}`;
        if (fs.existsSync(fotoKtpPath)) {
          fs.unlinkSync(fotoKtpPath);
          console.log(`Deleted foto_ktp: ${fotoKtpPath}`);
        }
      }
    }

    await t.rollback();
    console.error('Error creating penitip:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPenitip = async (req, res) => {
  try {
    const penitip = await Penitip.findAll({
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }],
      order: [['id_penitip', 'ASC']]
    });

    const baseUrl = 'http://localhost:3000/uploads/profile_picture/';

    penitip.forEach(p => {
      if (p.Akun && p.Akun.profile_picture) {
        p.Akun.profile_picture = `${baseUrl}${p.Akun.profile_picture}`;
      }
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
  let t;
  try {
    t = await sequelize.transaction();

    const {
      nama_penitip,
      nomor_ktp,
      keuntungan,
      rating,
      badge,
      total_poin,
      tanggal_registrasi,
      'akun[email]': email,
    } = req.body;

    console.log("Badge value received:", badge);
    console.log("Full request body:", req.body);

    if (badge !== '0' && badge !== '1') {
      await t.rollback();
      return res.status(400).json({ error: 'Badge harus 0 atau 1' });
    }

    const penitip = await Penitip.findByPk(req.params.id, { transaction: t });
    console.log("Found penitip:", penitip);

    if (!penitip) {
      await t.rollback();
      return res.status(404).json({ message: 'Penitip tidak ditemukan' });
    }

    const penitipUpdateData = {
      nama_penitip,
      nomor_ktp,
      keuntungan: keuntungan ? Number(keuntungan) : penitip.keuntungan,
      rating: rating ? Number(rating) : penitip.rating,
      badge: Number(badge),
      total_poin: total_poin ? Number(total_poin) : penitip.total_poin,
      tanggal_registrasi,
    };

    if (req.files && req.files.foto_ktp) {
      const ext = path.extname(req.files.foto_ktp[0].originalname);
      const penitipIdNumber = req.params.id.replace('T', '');
      const oldPath = req.files.foto_ktp[0].path;
      const newPath = path.join('uploads/ktp', `ktp${penitipIdNumber}${ext}`);
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed foto_ktp from ${oldPath} to ${newPath}`);
      penitipUpdateData.foto_ktp = `ktp${penitipIdNumber}${ext}`;
    }

    await penitip.update(penitipUpdateData, { transaction: t });
    console.log("Penitip updated:", penitipUpdateData);

    const penitipAkun = await Akun.findByPk(penitip.id_akun, { transaction: t });

    if (!penitipAkun) {
      await t.rollback();
      return res.status(404).json({ message: 'Akun penitip tidak ditemukan' });
    }

    const akunUpdateData = {
      email: email || penitipAkun.email,
    };

    if (req.files && req.files.profile_picture) {
      const ext = path.extname(req.files.profile_picture[0].originalname);
      const akunIdNumber = penitip.id_akun.replace('A', '');
      const oldPath = req.files.profile_picture[0].path;
      const newPath = path.join('uploads/profile_picture', `pp${akunIdNumber}${ext}`);
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed profile_picture from ${oldPath} to ${newPath}`);
      akunUpdateData.profile_picture = `pp${akunIdNumber}${ext}`;
    }

    await penitipAkun.update(akunUpdateData, { transaction: t });
    console.log("Akun updated:", akunUpdateData);

    await t.commit();
    console.log("Transaction committed");

    const updatedPenitip = await Penitip.findByPk(req.params.id, {
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }],
    });

    res.status(200).json(updatedPenitip);
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback();
    }
    console.error('Error updating penitip:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deletePenitip = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const penitip = await Penitip.findByPk(req.params.id);
    if (!penitip) return res.status(404).json({ message: 'Penitip tidak ditemukan' });
    
    const akunId = penitip.id_akun;
    const fotoKtpFile = penitip.foto_ktp; 
    
    const akun = await Akun.findByPk(akunId);
    const profilePictureFile = akun ? akun.profile_picture : null; 
    
    // Hapus file foto_ktp jika ada
    if (fotoKtpFile) {
      const fotoKtpPath = path.join('uploads', 'ktp', fotoKtpFile);
      try {
        if (fs.existsSync(fotoKtpPath)) {
          fs.unlinkSync(fotoKtpPath);
          console.log(`Deleted foto_ktp: ${fotoKtpPath}`);
        }
      } catch (error) {
        console.error(`Failed to delete foto_ktp ${fotoKtpPath}:`, error.message);
      }
    }
    
    // Hapus file profile_picture jika ada
    if (profilePictureFile) {
      const profilePicturePath = path.join('uploads', 'profile_picture', profilePictureFile);
      try {
        if (fs.existsSync(profilePicturePath)) {
          fs.unlinkSync(profilePicturePath);
          console.log(`Deleted profile_picture: ${profilePicturePath}`);
        }
      } catch (error) {
        console.error(`Failed to delete profile_picture ${profilePicturePath}:`, error.message);
      }
    }
    
    
    await penitip.destroy({ transaction: t });
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

exports.getPenitipByAkunId = async (req, res) => {
  try {
    const penitip = await Penitip.findOne({ where: { id_akun: req.params.id } });
    if (!penitip) return res.status(404).json({ message: 'Penitip tidak ditemukan' });
    
    res.status(200).json({message: "Data berhasil didapatkan", penitip});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};