const Penitip = require('../models/penitip');
const Akun = require('../models/akun');
const Barang = require('../models/barang');
const SubPembelian = require('../models/subPembelian');
const Pembelian = require('../models/pembelian');
const Transaksi = require('../models/transaksi');
const bcrypt = require('bcryptjs');
const generateId = require('../utils/generateId');
const sequelize = require('../config/database');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

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
    
    console.log("Email yang diterima:", req.body['akun[email]']);
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

exports.getPenitipByCustomConstrains = async (req, res) => {
  try {
    const penitip = await Penitip.findAll({ 
      where: {
        rating: { [Op.gte]: 1, [Op.lte]: 3 } 
      }
    });
    if (!penitip) return res.status(404).json({ message: 'Penitip tidak ditemukan' });
    
    res.status(200).json({message: "Data berhasil didapatkan", penitip});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTopPenitipBadge = async () => {
  const t = await sequelize.transaction();
  try {
    const today = new Date();
    const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfPreviousMonth = new Date(firstDayOfCurrentMonth - 1);
    const firstDayOfPreviousMonth = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), 1);

    const salesByPenitip = await Transaksi.findAll({
      attributes: [
        [sequelize.col('SubPembelian.Barang.id_penitip'), 'id_penitip'],
        [sequelize.fn('COUNT', sequelize.col('Transaksi.id_transaksi')), 'total_sales'],
        [sequelize.fn('SUM', sequelize.col('SubPembelian.Pembelian.total_harga')), 'total_penjualan']
      ],
      include: [{
        model: SubPembelian,
        attributes: [],
        include: [{
          model: Barang,
          attributes: [],
          required: true
        }, {
          model: Pembelian,
          attributes: [],
          where: {
            tanggal_pelunasan: {
              [Op.between]: [firstDayOfPreviousMonth, lastDayOfPreviousMonth]
            }
          }
        }]
      }],
      where: {
        '$SubPembelian.Barang.id_penitip$': { [Op.ne]: null }
      },
      group: ['SubPembelian.Barang.id_penitip'],
      order: [[sequelize.literal('total_sales'), 'DESC']],
      limit: 1,
      transaction: t
    });
    
    await Penitip.update({ badge: 0 }, { where: {}, transaction: t });

    if (salesByPenitip.length === 0) {
      await t.commit();
      return { message: 'Tidak ada transaksi di bulan lalu, tidak ada penitip yang diperbarui.' };
    }

    const topPenitipId = salesByPenitip[0].dataValues.id_penitip;
    const totalSales = salesByPenitip[0].dataValues.total_sales;
    const totalPenjualan = salesByPenitip[0].dataValues.total_penjualan;

    if (!topPenitipId) {
      await t.commit();
      return {
        message: 'Gagal memperbarui badge: id_penitip tidak valid.',
        details: { topPenitipId, totalSales, totalPenjualan }
      };
    }

    const penjualan = parseFloat(totalPenjualan ?? 0);
    const poinTambahan = Math.floor(penjualan * 0.01);

    const [updatedRows] = await Penitip.update(
      {
        badge: 1,
        total_poin: sequelize.literal(`total_poin + ${poinTambahan}`),
        // keuntungan: 
      },  
      {
        where: { id_penitip: topPenitipId },
        transaction: t
      }
    );

    await t.commit();

    if (updatedRows === 0) {
      return {
        message: 'Gagal memperbarui badge: Tidak ada penitip dengan id_penitip yang cocok.',
        details: { topPenitipId, totalSales, totalPenjualan, poinTambahan }
      };
    }

    return {
      message: 'Top penitip badge dan poin berhasil diperbarui.',
      details: { topPenitipId, totalSales, totalPenjualan, poinTambahan }
    };
  } catch (error) {
    await t.rollback();
    console.error('Error updating top penitip badge:', error);
    throw new Error('Gagal memperbarui badge dan poin penitip: ' + error.message);
  }
};

exports.checkTopPenitipBadge = async (req, res) => {
  try {
    const result = await exports.updateTopPenitipBadge();
    res.status(200).json({
      message: 'Top penitip badge check executed successfully',
      details: result
    });
  } catch (error) {
    console.error('Error checking top penitip badge:', error.message);
    res.status(500).json({
      error: 'Failed to check top penitip badge',
      details: error.message
    });
  }
};