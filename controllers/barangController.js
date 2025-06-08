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
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

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
      kategori_barang,
      existing_images,
      keep_existing_images,
    } = req.body;

    const barang = await Barang.findByPk(req.params.id);
    if (!barang) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    // Validate input
    if (nama !== undefined && (!nama || nama.trim() === '')) {
      return res.status(400).json({ error: 'Nama barang tidak boleh kosong.' });
    }
    if (harga !== undefined && (isNaN(harga) || harga <= 0)) {
      return res.status(400).json({ error: 'Harga harus berupa angka positif.' });
    }
    if (berat !== undefined && (isNaN(berat) || berat <= 0)) {
      return res.status(400).json({ error: 'Berat harus berupa angka positif.' });
    }

    // Validate image count
    const newFilesCount = req.files ? req.files.length : 0;
    let existingImagesCount = 0;

    if (keep_existing_images === 'true' && existing_images) {
      try {
        const existingArray = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
        existingImagesCount = Array.isArray(existingArray) ? existingArray.length : 0;
      } catch (err) {
        console.error('Error parsing existing_images:', err);
      }
    }

    if (newFilesCount + existingImagesCount > 2) {
      return res.status(400).json({ error: 'Maksimal 2 gambar yang dapat diunggah.' });
    }

    let finalImageFilenames = [];

    if (req.files && req.files.length > 0) {
      const barangDir = path.join(__dirname, '../uploads/barang');
      if (!fs.existsSync(barangDir)) {
        fs.mkdirSync(barangDir, { recursive: true });
      }

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const fileExtension = path.extname(file.originalname);
        const newFilename = `${barang.id_barang}_${Date.now()}_${i + 1}${fileExtension}`;
        const oldPath = path.join(file.destination, file.filename);
        const newPath = path.join(barangDir, newFilename);

        try {
          fs.renameSync(oldPath, newPath);
          finalImageFilenames.push(newFilename);
          console.log(`New file saved: ${newFilename}`);
        } catch (err) {
          console.error(`Error moving file ${file.filename}:`, err);
          return res.status(500).json({ error: 'Gagal memproses file gambar.' });
        }
      }

      if (keep_existing_images === 'true' && existing_images) {
        try {
          const existingArray = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
          if (Array.isArray(existingArray)) {
            const processedExisting = existingArray.map((img) => {
              return img.includes('/uploads/barang/') ? img.split('/uploads/barang/').pop() : img;
            });
            finalImageFilenames = [...processedExisting, ...finalImageFilenames];
            console.log('Combined images:', finalImageFilenames);
          }
        } catch (err) {
          console.error('Error processing existing images:', err);
        }
      }

      // Delete old images not in finalImageFilenames
      if (barang.gambar) {
        const oldImageFilenames = barang.gambar.split(',').map((img) => img.trim());
        oldImageFilenames.forEach((filename) => {
          const actualFilename = filename.includes('/') ? filename.split('/').pop() : filename;
          if (!finalImageFilenames.includes(actualFilename)) {
            const filePath = path.join(__dirname, '../uploads/barang', actualFilename);
            if (fs.existsSync(filePath)) {
              try {
                fs.unlinkSync(filePath);
                console.log(`Deleted old image: ${actualFilename}`);
              } catch (err) {
                console.error(`Error deleting file ${actualFilename}:`, err);
              }
            }
          }
        });
      }
    } else if (existing_images && keep_existing_images === 'true') {
      try {
        const existingArray = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
        if (Array.isArray(existingArray)) {
          finalImageFilenames = existingArray.map((img) =>
            img.includes('/uploads/barang/') ? img.split('/uploads/barang/').pop() : img
          );
        }
      } catch (err) {
        console.error('Error parsing existing_images:', err);
        finalImageFilenames = barang.gambar ? barang.gambar.split(',').map((img) => img.trim()) : [];
      }
    }

    const updateData = {
      id_penitip: id_penitip !== undefined && id_penitip !== '' ? id_penitip : barang.id_penitip,
      id_hunter: id_hunter !== undefined ? (id_hunter === '' || id_hunter === 'null' ? null : id_hunter) : barang.id_hunter,
      id_pegawai_gudang:
        id_pegawai_gudang !== undefined && id_pegawai_gudang !== '' ? id_pegawai_gudang : barang.id_pegawai_gudang,
      nama: nama !== undefined && nama !== '' ? nama : barang.nama,
      deskripsi: deskripsi !== undefined ? deskripsi : barang.deskripsi,
      gambar: finalImageFilenames.length > 0 ? finalImageFilenames.join(',') : barang.gambar,
      harga: harga !== undefined && harga !== '' ? parseFloat(harga) : barang.harga,
      garansi_berlaku:
        garansi_berlaku !== undefined
          ? garansi_berlaku === 'true' || garansi_berlaku === true || garansi_berlaku === 'on'
          : barang.garansi_berlaku,
      tanggal_garansi: tanggal_garansi !== undefined ? (tanggal_garansi === '' ? null : tanggal_garansi) : barang.tanggal_garansi,
      berat: berat !== undefined && berat !== '' ? parseFloat(berat) : barang.berat,
      status_qc: status_qc !== undefined && status_qc !== '' ? status_qc : barang.status_qc,
      kategori_barang:
        kategori_barang !== undefined && kategori_barang !== '' ? kategori_barang : barang.kategori_barang,
    };

    console.log('Final update data:', updateData);

    await barang.update(updateData);

    const updatedBarang = await Barang.findByPk(req.params.id, {
      include: [
        {
          model: Penitip,
          attributes: ['id_penitip', 'nama_penitip', 'foto_ktp', 'nomor_ktp', 'rating', 'badge'],
        },
        {
          model: Pegawai,
          as: 'Hunter',
          attributes: ['id_pegawai', 'nama_pegawai'],
        },
        {
          model: Pegawai,
          as: 'PegawaiGudang',
          attributes: ['id_pegawai', 'nama_pegawai'],
        },
      ],
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000/uploads/barang/';
    if (updatedBarang.gambar) {
      const imageArray = updatedBarang.gambar.split(',').map((img) => img.trim());
      updatedBarang.gambar = imageArray.map((img) => `${baseUrl}${img}`).join(',');
    }

    console.log('Barang updated successfully:', updatedBarang.toJSON());
    res.status(200).json(updatedBarang);
  } catch (error) {
    console.error('Error in updateBarang:', error);
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