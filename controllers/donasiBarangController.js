const { v4: uuidv4 } = require('uuid');
const DonasiBarang = require('../models/donasiBarang');
const Barang = require('../models/barang');
const Penitip = require('../models/penitip');
const Akun = require('../models/akun');
const generateId = require('../utils/generateId');

exports.createDonasiBarang = async (req, res) => {
  try {
    const { id_request_donasi, id_owner, id_barang, tanggal_donasi } = req.body;

    if (!id_request_donasi || !id_owner || !id_barang || !tanggal_donasi) {
      return res.status(400).json({ success: false, message: 'Field tidak boleh kosong.' });
    }

    const newId = await generateId({
      model: DonasiBarang,
      prefix: 'DNB',
      fieldName: 'id_donasi_barang'
    });

    const donasi = await DonasiBarang.create({
      id_donasi_barang: newId,
      id_request_donasi,
      id_owner,
      id_barang,
      tanggal_donasi,
    });

    res.status(201).json({
      success: true,
      message: 'Donasi barang berhasil dibuat.',
      data: donasi
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createBulkDonasiBarang = async (req, res) => {
  try {
    const { id_request_donasi, id_owner, items } = req.body;

    if (!id_request_donasi || !id_owner || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request. Please provide request_id, owner_id, and an array of item IDs.' 
      });
    }

    const donationRecords = [];
    const tanggal_donasi = new Date();
    for (const id_barang of items) {
      const newId = await generateId({
        model: DonasiBarang,
        prefix: 'DNB',
        fieldName: 'id_donasi_barang'
      });

      donationRecords.push({
        id_donasi_barang: newId,
        id_request_donasi,
        id_owner,
        id_barang,
        tanggal_donasi,
      });
    }

    const donations = await DonasiBarang.bulkCreate(donationRecords);

    res.status(201).json({
      success: true,
      message: `${donations.length} barang berhasil didonasikan.`,
      data: donations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllDonasiBarang = async (req, res) => {
  try {
    const donasi = await DonasiBarang.findAll({
      include: [
        {
          model: Barang,
          include: [
            {
              model: Penitip,
              include: [Akun]
            }
          ]
        }
      ]
    });
    res.status(200).json(donasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDonasiBarangById = async (req, res) => {
  try {
    const donasi = await DonasiBarang.findByPk(req.params.id, {
      include: [
        {
          model: Barang,
          include: [
            {
              model: Penitip,
              include: [Akun]
            }
          ]
        }
      ]
    });
    if (!donasi) return res.status(404).json({ message: 'Donasi barang tidak ditemukan' });
    res.status(200).json(donasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPenitipandBarangByIdRequestDonasi = async (req, res) => {
  try {
    const { id } = req.params; // id_request_donasi
    const donasi = await DonasiBarang.findAll({
      where: { id_request_donasi: id },
      include: [
        {
          model: Barang,
          include: [
            {
              model: Penitip,
              include: [
                {
                  model: Akun,
                  attributes: ['email']
                }
              ],
              attributes: ['id_penitip', 'nama_penitip', 'nomor_ktp', 'total_poin', 'rating']
            }
          ],
          attributes: ['id_barang', 'nama', 'deskripsi', 'harga']
        }
      ]
    });
    if (!donasi || donasi.length === 0) {
      return res.status(404).json({ message: 'Donasi barang tidak ditemukan untuk id_request_donasi ini' });
    }
    res.status(200).json(donasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDonasiBarang = async (req, res) => {
  try {
    const { id_request_donasi, id_owner, id_barang, tanggal_donasi } = req.body;
    const donasi = await DonasiBarang.findByPk(req.params.id);
    if (!donasi) return res.status(404).json({ message: 'Donasi barang tidak ditemukan' });
    await donasi.update({ id_request_donasi, id_owner, id_barang, tanggal_donasi });
    res.status(200).json(donasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDonasiBarang = async (req, res) => {
  try {
    const donasi = await DonasiBarang.findByPk(req.params.id);
    if (!donasi) return res.status(404).json({ message: 'Donasi barang tidak ditemukan' });
    await donasi.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};