const Barang = require('../models/barang');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const Penitip = require('../models/penitip');
const Penitipan = require('../models/penitipan');

const generateNewId = async (namaBarang) => {
  if (!namaBarang || namaBarang.length === 0) {
    throw new Error("Nama barang tidak boleh kosong untuk generate ID.");
  }

  const hurufDepan = namaBarang[0].toUpperCase();

  const allBarang = await Barang.findAll({
    attributes: ['id_barang'],
    where: {
      id_barang: {
        [Op.like]: `${hurufDepan}%`
      } 
    }
  });

  const allNumericIds = allBarang
    .map(b => {
      const match = b.id_barang.match(/^([A-Z])(\d+)$/);
      return match && match[1] === hurufDepan ? parseInt(match[2]) : null;
    })
    .filter(id => id !== null);

  const nextNumber = allNumericIds.length > 0 ? Math.max(...allNumericIds) + 1 : 1;

  return `${hurufDepan}${nextNumber}`;
};

exports.createBarang = async (req, res) => {
  try {
    const {
      id_penitip,
      id_hunter,
      id_pegawai_gudang,
      nama,
      deskripsi,
      harga,
      garansi_berlaku,
      tanggal_garansi,
      berat,
      status_qc,
      kategori_barang
    } = req.body;

    const hunterId = id_hunter === 'null' || id_hunter === '' || id_hunter === undefined ? null : id_hunter;
    if (req.files && req.files.length > 2) {
      return res.status(400).json({ error: 'Maksimal 2 gambar yang dapat diunggah.' });
    }

    const newId = await generateNewId(nama);

    let imageFilenames = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const fileExtension = path.extname(file.originalname);
        const newFilename = `${newId}_${i + 1}${fileExtension}`;
        const oldPath = path.join(file.destination, file.filename);
        const barangDir = path.join(file.destination, 'barang');

        if (!fs.existsSync(barangDir)) {
          fs.mkdirSync(barangDir, { recursive: true });
        }
        const newPath = path.join(barangDir, newFilename);
        fs.renameSync(oldPath, newPath);
        imageFilenames.push(newFilename);
      }
    }

    const gambar = imageFilenames.length > 0 ? imageFilenames.join(',') : null;

    const barang = await Barang.create({
      id_barang: newId,
      id_penitip,
      id_hunter: hunterId,
      id_pegawai_gudang,
      nama,
      deskripsi,
      gambar,
      harga,
      garansi_berlaku,
      tanggal_garansi,
      berat,
      status_qc,
      kategori_barang,
    });

    res.status(201).json(barang);
  } catch (error) {
    console.error('Error in createBarang:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBarang = async (req, res) => {
  try {
    const barang = await Barang.findAll({
      include: [{
        model: Penitip,
        attributes: ['id_penitip', 'nama_penitip', 'foto_ktp', 'nomor_ktp', 'rating', 'badge']
      }]
    });

    const baseUrl = 'http://localhost:3000/uploads/barang/';
    barang.forEach(b => {
      if (b.gambar) {
        const imageArray = b.gambar.split(',').map(img => img.trim());
        b.gambar = imageArray.map(img => `${baseUrl}${img}`).join(',');
      }
    });

    console.log('Data barang yang dikembalikan:', barang);
    res.status(200).json(barang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBarangById = async (req, res) => {
  try {
    const barang = await Barang.findByPk(req.params.id, {
      include: [
        {
          model: Penitip,
          attributes: ['id_penitip', 'nama_penitip', 'foto_ktp', 'nomor_ktp', 'rating', 'badge']
        },
        {
          model: Penitipan
        }
    ]
    });

    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000/uploads/barang/';
    if (barang.gambar) {
      const imageArray = barang.gambar.split(',').map(img => img.trim());
      barang.gambar = imageArray.map(img => `${baseUrl}${img}`).join(',');
    }

    res.status(200).json(barang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function untuk format data barang
const formatBarangData = (barang, baseUrl) => {
  const formattedBarang = {
    id_barang: barang.id_barang,
    id_penitip: barang.id_penitip,
    id_hunter: barang.id_hunter,
    id_pegawai_gudang: barang.id_pegawai_gudang,
    nama: barang.nama || '',
    deskripsi: barang.deskripsi || '',
    gambar: '',
    harga: barang.harga != null ? parseFloat(barang.harga) : 0.0,
    garansi_berlaku: Boolean(barang.garansi_berlaku),
    tanggal_garansi: barang.tanggal_garansi,
    berat: barang.berat != null ? parseFloat(barang.berat) : 0.0,
    status_qc: barang.status_qc || '',
    kategori_barang: barang.kategori_barang || '',
    Penitip: barang.Penitip || null,
    Hunter: barang.Hunter || null,
    PegawaiGudang: barang.PegawaiGudang || null
  };

  // Handle gambar URLs
  if (barang.gambar) {
    const imageArray = barang.gambar.split(',').map(img => img.trim());
    formattedBarang.gambar = imageArray.map(img => `${baseUrl}${img}`).join(',');
  }

  return formattedBarang;
};

exports.getAllBarangMobile = async (req, res) => {
  try {
    const barang = await Barang.findAll({
      include: [{
        model: Penitip,
        attributes: ['id_penitip', 'nama_penitip', 'foto_ktp', 'nomor_ktp', 'rating', 'badge']
      }]
    });

    const baseUrl = 'http://10.0.2.2:3000/uploads/barang/';
    
    // Format setiap data barang untuk memastikan konsistensi
    const formattedBarang = barang.map(b => formatBarangData(b, baseUrl));

    console.log('Data barang yang dikembalikan:', JSON.stringify(formattedBarang, null, 2));
    res.status(200).json(formattedBarang);
  } catch (error) {
    console.error('Error in getAllBarangMobile:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBarangByIdMobile = async (req, res) => {
  try {
    const barang = await Barang.findByPk(req.params.id, {
      include: [{
        model: Penitip,
        attributes: ['id_penitip', 'nama_penitip', 'foto_ktp', 'nomor_ktp', 'rating', 'badge']
      }]
    });

    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });

    const baseUrl = 'http://10.0.2.2:3000/uploads/barang/';
    const formattedBarang = formatBarangData(barang, baseUrl);

    console.log('Data barang by ID yang dikembalikan:', JSON.stringify(formattedBarang, null, 2));
    res.status(200).json(formattedBarang);
  } catch (error) {
    console.error('Error in getBarangByIdMobile:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateBarang = async (req, res) => {
  try {
    const {
      id_penitip,
      id_hunter,
      id_pegawai_gudang,
      nama,
      deskripsi,
      harga,
      garansi_berlaku,
      tanggal_garansi,
      berat,
      status_qc,
      kategori_barang
    } = req.body;

    // Konversi id_hunter kosong ke null
    const hunterId = id_hunter === '' || id_hunter === undefined ? null : id_hunter;

    const barang = await Barang.findByPk(req.params.id);
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });

    if (req.files && req.files.length > 2) {
      return res.status(400).json({ error: 'Maksimal 2 gambar yang dapat diunggah.' });
    }

    let imageFilenames = barang.gambar ? barang.gambar.split(',') : [];
    if (req.files && req.files.length > 0) {
      if (imageFilenames.length > 0) {
        imageFilenames.forEach(filename => {
          const filePath = path.join(__dirname, '../uploads/barang', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      // Proses gambar baru
      imageFilenames = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const fileExtension = path.extname(file.originalname);
        const newFilename = `${barang.id_barang}_${i + 1}${fileExtension}`;
        const oldPath = path.join(file.destination, file.filename);
        const newPath = path.join(file.destination, newFilename);

        fs.renameSync(oldPath, newPath);
        imageFilenames.push(newFilename);
      }
    }

    const gambar = imageFilenames.length > 0 ? imageFilenames.join(',') : null;

    await barang.update({
      id_penitip,
      id_hunter: hunterId,
      id_pegawai_gudang,
      nama,
      deskripsi,
      gambar,
      harga,
      garansi_berlaku,
      tanggal_garansi,
      berat,
      status_qc,
      kategori_barang
    });

    res.status(200).json(barang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBarang = async (req, res) => {
  try {
    const barang = await Barang.findByPk(req.params.id);
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });

    // Hapus gambar dari sistem file jika ada
    if (barang.gambar) {
      const imageFilenames = barang.gambar.split(',').map(filename => filename.trim());
      imageFilenames.forEach(filename => {
        const filePath = path.join(__dirname, '../uploads/barang', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await barang.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBarangGaransi = async (req, res) => {
  try {
    const barang = await Barang.findAll({
      where: {
        tanggal_garansi: {
          [Op.not]: null
        }
      },
      include: [{
        model: Penitip,
        attributes: ['id_penitip', 'nama_penitip', 'foto_ktp', 'nomor_ktp', 'rating', 'badge']
      }]
    });

    const baseUrl = 'http://localhost:3000/uploads/barang/';
    barang.forEach(b => {
      if (b.gambar) {
        const imageArray = b.gambar.split(',').map(img => img.trim());
        b.gambar = imageArray.map(img => `${baseUrl}${img}`).join(',');
      }
    });

    console.log('Data barang yang dikembalikan:', barang);
    res.status(200).json(barang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};