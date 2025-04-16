const { v4: uuidv4 } = require('uuid');
const ClaimMerchandise = require('../models/claimMerchandise');
const generateId = require('../utils/generateId');

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
    const claim = await ClaimMerchandise.findAll();
    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClaimMerchandiseById = async (req, res) => {
  try {
    const claim = await ClaimMerchandise.findByPk(req.params.id);
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