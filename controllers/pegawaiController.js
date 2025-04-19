const Pegawai = require('../models/pegawai');
const Akun = require('../models/akun');
const bcrypt = require('bcryptjs');
const generateId = require('../utils/generateId');
const sequelize = require('../config/database');

exports.createPegawai = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { nama_pegawai, tanggal_lahir, akun } = req.body;
    
    const newAkunId = await generateId({
      model: Akun,
      prefix: 'A',
      fieldName: 'id_akun'
    });
    
    const hashedPassword = await bcrypt.hash(akun.password || 'defaultPassword', 10);
    
    const newAkun = await Akun.create({
      id_akun: newAkunId,
      profile_picture: akun.profile_picture || null,
      email: akun.email,
      password: hashedPassword,
      role: akun.role
    }, { transaction: t });
    
    const newPegawaiId = await generateId({
      model: Pegawai,
      prefix: 'P',
      fieldName: 'id_pegawai'
    });
    
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
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPegawai = async (req, res) => {
  try {
    const pegawai = await Pegawai.findAll({
      include: [{ model: Akun, attributes: ['id_akun', 'email', 'role', 'profile_picture'] }]
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
    res.status(200).json(pegawai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePegawai = async (req, res) => {
  try {
    const { nama_pegawai, tanggal_lahir } = req.body;
    const pegawai = await Pegawai.findByPk(req.params.id);
    if (!pegawai) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    await pegawai.update({ nama_pegawai, tanggal_lahir });
    res.status(200).json(pegawai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePegawai = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const pegawai = await Pegawai.findByPk(req.params.id);
    if (!pegawai) return res.status(404).json({ message: 'Pegawai tidak ditemukan' });
    
    const akunId = pegawai.id_akun;
    
    await pegawai.destroy({ transaction: t });
    
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