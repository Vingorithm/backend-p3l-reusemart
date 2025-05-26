const { v4: uuidv4 } = require('uuid');
const ClaimMerchandise = require('../models/claimMerchandise');
const generateId = require('../utils/generateId');
const Pembeli = require('../models/pembeli');
const Akun = require('../models/akun');
const Pegawai = require('../models/pegawai');
const Merchandise = require('../models/merchandise');

exports.createClaimMerchandise = async (req, res) => {
  try {
    const { id_merchandise, id_pembeli, id_customer_service, tanggal_claim, tanggal_ambil, status_claim_merchandise } = req.body;
    const newId = await generateId({
      model: ClaimMerchandise,
      prefix: 'CLM',
      fieldName: 'id_claim_merchandise'
    });
    const claim = await ClaimMerchandise.create({
      id_claim_merchandise: newId,
      id_merchandise,
      id_pembeli,
      id_customer_service,
      tanggal_claim,
      tanggal_ambil,
      status_claim_merchandise,
    });
    res.status(201).json(claim);
  } catch (error) {
    console.error('ERROR:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getAllClaimMerchandise = async (req, res) => {
  try {
    const claim = await ClaimMerchandise.findAll({
        include: [
        {
          model: Pembeli,
          attributes: ['id_pembeli', 'id_akun', 'nama', 'total_poin', 'tanggal_registrasi'],
            include: [
              {
                model: Akun,
                attributes: ['id_akun', 'email']
              }
            ]
        },
        {
          model: Merchandise,
          attributes: ['id_merchandise', 'id_admin', 'nama_merchandise', 'harga_poin', 'deskripsi', 'gambar', 'stok_merchandise'],
          include: [
              {
                model: Pegawai,
                attributes: ['id_pegawai', 'id_akun', 'nama_pegawai']
              }
            ]
        }
      ],
      order: [['tanggal_claim', 'DESC']]
    });
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClaimMerchandiseById = async (req, res) => {
  try {
    const claim = await ClaimMerchandise.findByPk(req.params.id, 
      {
        include: [
        {
          model: Pembeli,
          attributes: ['id_pembeli', 'id_akun', 'nama', 'total_poin', 'tanggal_registrasi'],
            include: [
              {
                model: Akun,
                attributes: ['id_akun', 'email']
              }
            ]
        },
        {
          model: Merchandise,
          attributes: ['id_merchandise', 'id_admin', 'nama_merchandise', 'harga_poin', 'deskripsi', 'gambar', 'stok_merchandise'],
          include: [
              {
                model: Pegawai,
                attributes: ['id_pegawai', 'id_akun', 'nama_pegawai']
              }
            ]
        }
      ],
      order: [['tanggal_claim', 'DESC']]
    });
    if (!claim) return res.status(404).json({ message: 'Claim merchandise tidak ditemukan' });
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateClaimMerchandise = async (req, res) => {
  try {
    const { id_merchandise, id_pembeli, id_customer_service, tanggal_claim, tanggal_ambil, status_claim_merchandise } = req.body;
    const claim = await ClaimMerchandise.findByPk(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim merchandise tidak ditemukan' });
    await claim.update({ id_merchandise, id_pembeli, id_customer_service, tanggal_claim, tanggal_ambil, status_claim_merchandise });
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteClaimMerchandise = async (req, res) => {
  try {
    const claim = await ClaimMerchandise.findByPk(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim merchandise tidak ditemukan' });
    await claim.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};