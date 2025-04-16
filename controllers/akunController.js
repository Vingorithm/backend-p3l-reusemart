const bcrypt = require('bcryptjs');
const Akun = require('../models/akun');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';
const fs = require('fs');
const path = require('path');

const generateNewId = async () => {
  const akunList = await Akun.findAll({
    attributes: ['id_akun']
  });

  const maxId = akunList.reduce((max, akun) => {
    const num = parseInt(akun.id_akun.slice(1));
    return num > max ? num : max;
  }, 0);

  const newNumericPart = maxId + 1;
  return `A${newNumericPart}`;
};

exports.createAkun = async (req, res) => {
  try {
    const { email, password, role, profile_picture } = req.body;

    const newId = await generateNewId();
    const hashedPassword = await bcrypt.hash(password, 10);

    const akun = await Akun.create({
      id_akun: newId,
      profile_picture,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json(akun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'email, password, dan role wajib diisi' });
    }

    const existing = await Akun.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email sudah digunakan' });

    const newId = await generateNewId();
    const hashedPassword = await bcrypt.hash(password, 10);

    let profile_picture = null;

    if (req.file) {
      const fileExtension = path.extname(req.file.originalname);
      const newFilename = `${newId}${fileExtension}`;
      const oldPath = path.join(req.file.destination, req.file.filename);
      const newPath = path.join(req.file.destination, newFilename);

      fs.renameSync(oldPath, newPath);
      profile_picture = newFilename;
    }

    const akun = await Akun.create({
      id_akun: newId,
      profile_picture,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: 'Registrasi berhasil', akun });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
};

// Ini logika tokennya masih belum di setting
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const akun = await Akun.findOne({ where: { email } });

    if (!akun) return res.status(404).json({ message: 'Email tidak ditemukan' });

    const validPassword = await bcrypt.compare(password, akun.password);
    if (!validPassword) return res.status(401).json({ message: 'Password salah' });

    const token = jwt.sign(
      { id: akun.id_akun, email: akun.email, role: akun.role },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ message: 'Login berhasil', token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const akun = await Akun.findOne({ where: { email } });
    if (!akun) return res.status(404).json({ message: 'Email tidak ditemukan' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    akun.password = hashedPassword;
    await akun.save();

    res.status(200).json({ message: 'Password berhasil direset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllAkun = async (req, res) => {
  try {
    const akun = await Akun.findAll();
    res.status(200).json(akun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAkunById = async (req, res) => {
  try {
    const akun = await Akun.findByPk(req.params.id);
    if (!akun) return res.status(404).json({ message: 'Akun tidak ditemukan' });
    res.status(200).json(akun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAkun = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const akun = await Akun.findByPk(req.params.id);
    if (!akun) return res.status(404).json({ message: 'Akun tidak ditemukan' });

    const hashedPassword = password ? await bcrypt.hash(password, 10) : akun.password;
    const profile_picture = req.file ? req.file.filename : akun.profile_picture;
    await akun.update({ profile_picture, email, password: hashedPassword, role });
    res.status(200).json(akun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAkun = async (req, res) => {
  try {
    const akun = await Akun.findByPk(req.params.id);
    if (!akun) return res.status(404).json({ message: 'Akun tidak ditemukan' });
    await akun.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};