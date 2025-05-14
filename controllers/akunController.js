const bcrypt = require('bcryptjs');
const Akun = require('../models/akun');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';
const fs = require('fs');
const path = require('path');
const Pembeli = require('../models/pembeli');
const OrganisasiAmal = require('../models/organisasiAmal');
const generateId = require('../utils/generateId');
const { sendPasswordResetEmail, sendRejectionEmail } = require('../utils/sendEmail');

exports.sendResetPasswordLink = async (req, res) => {
  const { email } = req.body;

  // Cari user berdasarkan email
  const akun = await Akun.findOne({ where: { email } });
  if (!akun) {
    return res.status(404).json({ message: 'Email tidak ditemukan' });
  }

  if(akun.role == 'Pembeli' || akun.role == 'Penitip' || akun.role == 'Organisasi Amal') {
    // Buat token yang kadaluarsa dalam 1 jam
    const token = jwt.sign({ id: akun.id_akun }, SECRET_KEY, { expiresIn: '1h' });
  
    // Kirim email
    try {
      await sendPasswordResetEmail(email, token);
      res.status(200).json({ message: 'Email reset password telah dikirim' });
    } catch (error) {
      console.error('Gagal mengirim email:', error);
      res.status(500).json({ message: 'Gagal mengirim email' });
    }
  } else {
    res.status(400).json({ message: 'Role yang dimiliki tidak boleh mengakses fitur ini' });
    // try {
    //   await sendRejectionEmail(email);
    // } catch (error) {
    //   console.error('Gagal mengirim email:', error);
    //   res.status(500).json({ message: 'Gagal mengirim email' });
    // }
  }

};

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

    const newId = await generateId({
      model: Akun,
      prefix: 'A',
      fieldName: 'id_akun'
    });
    const hashedPassword = await bcrypt.hash(password, 10);

    const akun = await Akun.create({
      id_akun: newId,
      profile_picture: !profile_picture ? "" : profile_picture,
      email: email,
      password: hashedPassword,
      role: role,
    });

    res.status(201).json(akun);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role, alamat } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'email, password, dan role wajib diisi' });
    }

    const existing = await Akun.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email sudah digunakan' });

    const newId = await generateNewId();
    const hashedPassword = await bcrypt.hash(password, 10);

    // let profile_picture = "";
    // if (req.file) {
    //   const fileExtension = path.extname(req.file.originalname);
    //   const newFilename = `${newId}${fileExtension}`;
    //   const oldPath = path.join(req.file.destination, req.file.filename);
    //   const newPath = path.join(req.file.destination, newFilename);

    //   fs.renameSync(oldPath, newPath);
    //   profile_picture = newFilename;
    // }

    const akun = await Akun.create({
      id_akun: newId,
      profile_picture: "",
      email,
      password: hashedPassword,
      role,
    });

    if(role == "Pembeli") {
      const new_id_pembeli = await generateId({
        model: Pembeli,
        prefix: 'PBL',
        fieldName: 'id_pembeli'
      });

      const pembeli = await Pembeli.create({
        id_pembeli: new_id_pembeli,
        id_akun: akun.id_akun,
        nama: username,
        total_poin: 0,
        tanggal_registrasi: new Date(),
      });

      res.status(201).json({ message: 'Registrasi berhasil', akun, pembeli });

    } else if(role == "Organisasi Amal") {

      const new_id_organisasi = await generateId({
        model: OrganisasiAmal,
        prefix: 'ORG',
        fieldName: 'id_organisasi'
      });

      const organisasi = await OrganisasiAmal.create({
        id_organisasi: new_id_organisasi,
        id_akun: akun.id_akun,
        nama_organisasi: username,
        alamat: alamat,
        tanggal_registrasi: new Date(),
      });

      res.status(201).json({ message: 'Registrasi berhasil', akun, organisasi });
    } else {
      res.status(400).json({ message: 'Role tidak diketahui!'});
    }

    
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
    
    res.status(200).json({
      message: 'Login berhasil',
      token,
      akun: {
        id: akun.id_akun,
        email: akun.email,
        role: akun.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    const akun = await Akun.findByPk(req.params.id);
    if (!akun) return res.status(404).json({ message: 'Akun tidak ditemukan' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    akun.password = hashedPassword;
    await akun.save();

    res.status(200).json({ message: 'Password berhasil diubah', akun });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAkunByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const akun = await Akun.findOne({where: {email}});
    if (!akun) return res.status(404).json({ message: 'Akun tidak ditemukan' });
    res.status(200).json({ message: 'Akun berhasil ditemukan', akun });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.sendVerificationEmail = async (req, res) => {

}

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

    let profile_picture = akun.profile_picture;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFilename = `pp${akun.id_akun.replace(/\D/g, '')}${ext}`;
      const newPath = path.join('uploads/profile_picture', newFilename);
      const oldPath = req.file.path;

      // Rename file
      fs.renameSync(oldPath, newPath);
      profile_picture = newFilename;
    }

    await akun.update({
      email: email ?? akun.email,
      password: hashedPassword,
      role: role ?? akun.role,
      profile_picture
    });
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