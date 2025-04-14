const { v4: uuidv4 } = require('uuid');
const ClaimMerchandise = require('../models/claimMerchandise');

const generateNewId = async () => {
  const last = await ClaimMerchandise.findOne({
    order: [['id_claim_merchandise', 'DESC']]
  });

  if (!last || !last.id_claim_merchandise || !/^CLM\d{3}$/.test(last.id_claim_merchandise)) {
    return 'CLM1';
  }

  const lastId = last.id_claim_merchandise;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = numericPart + 1;
  return `CLM${newNumericPart}`;
};

exports.createClaimMerchandise = async (req, res) => {
  try {
    const { id_merchandise, id_pembeli, id_customer_service, tanggal_claim, tanggal_ambil, status_claim_merchandise } = req.body;
    const newId = await generateNewId();
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