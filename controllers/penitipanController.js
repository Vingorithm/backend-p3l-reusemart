const { v4: uuidv4 } = require('uuid');
const Penitipan = require('../models/penitipan');
const Barang = require('../models/barang');
const Penitip = require('../models/penitip');
const Akun = require('../models/akun');
const generateId = require('../utils/generateId');

// const generateNewId = async () => {
//   const last = await Penitipan.findOne({
//     order: [['id_penitipan', 'DESC']]
//   });

//   if (!last || !/^PTP\d+$/.test(last.id_penitipan)) return 'PTP1';

//   const lastId = last.id_penitipan;
//   const numericPart = parseInt(lastId.slice(3));
//   const newNumericPart = numericPart + 1;
//   return `PTP${newNumericPart}`;
// };

exports.createPenitipan = async (req, res) => {
  try {
    const { id_barang, tanggal_awal_penitipan, tanggal_akhir_penitipan, tanggal_batas_pengambilan, perpanjangan, status_penitipan } = req.body;
    const newId = await generateId({
      model: Penitipan,
      prefix: 'PTP',
      fieldName: 'id_penitipan'
    });
    const penitipan = await Penitipan.create({
      id_penitipan: newId,
      id_barang,
      tanggal_awal_penitipan,
      tanggal_akhir_penitipan,
      tanggal_batas_pengambilan,
      perpanjangan,
      status_penitipan,
    });
    res.status(201).json(penitipan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPenitipan = async (req, res) => {
  try {
    const baseUrl = 'http://localhost:3000/uploads/barang/';
    const penitipan = await Penitipan.findAll({
      include: [
        {
          model: Barang,
          attributes: ['id_barang', 'id_penitip', 'id_hunter', 'id_pegawai_gudang', 'nama', 'gambar', 'harga', 'garansi_berlaku', 'tanggal_garansi', 'berat', 'status_qc', 'kategori_barang'],
          include: [
            {
              model: Penitip,
              attributes: ['id_penitip', 'nama_penitip', 'total_poin', 'tanggal_registrasi'],
              include: [{
                model: Akun,
                attributes: ['id_akun', 'email', 'profile_picture', 'role'],
              }],
            }
          ]
        }
      ],
      order: [['id_barang', 'ASC']]
    });
    
    // Tambahin Url pada saat return gambar
    const penitipanWithFullImageUrl = penitipan.map(p => {
      const barang = p.Barang;
      if (barang && barang.gambar) {
        const gambarList = barang.gambar.split(',').map(g => `${baseUrl}${g.trim()}`);
        barang.gambar = gambarList.join(',');
      }
      return p;
    });
    
    res.status(200).json(penitipanWithFullImageUrl);    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPenitipanById = async (req, res) => {
  try {
    const penitipan = await Penitipan.findByPk(req.params.id, {
      include: [
        {
          model: Barang,
          attributes: ['id_barang', 'id_penitip', 'id_hunter', 'id_pegawai_gudang', 'nama', 'gambar', 'harga', 'garansi_berlaku', 'tanggal_garansi', 'berat', 'status_qc', 'kategori_barang'],
          include: [
            {
              model: Penitip,
              attributes: ['id_penitip', 'nama_penitip', 'total_poin', 'tanggal_registrasi'],
              include: [{
                model: Akun,
                attributes: ['id_akun', 'email', 'profile_picture', 'role'],
              }],
            }
          ]
        }
      ],
      order: [['id_barang', 'ASC']]
    });
    if (!penitipan) return res.status(404).json({ message: 'Penitipan tidak ditemukan' });
    res.status(200).json(penitipan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePenitipan = async (req, res) => {
  try {
    const { id_barang, tanggal_awal_penitipan, tanggal_akhir_penitipan, tanggal_batas_pengambilan, perpanjangan, status_penitipan } = req.body;
    const penitipan = await Penitipan.findByPk(req.params.id);
    if (!penitipan) return res.status(404).json({ message: 'Penitipan tidak ditemukan' });
    await penitipan.update({ id_barang, tanggal_awal_penitipan, tanggal_akhir_penitipan, tanggal_batas_pengambilan, perpanjangan, status_penitipan });
    res.status(200).json(penitipan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePenitipan = async (req, res) => {
  try {
    const penitipan = await Penitipan.findByPk(req.params.id);
    if (!penitipan) return res.status(404).json({ message: 'Penitipan tidak ditemukan' });
    await penitipan.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};