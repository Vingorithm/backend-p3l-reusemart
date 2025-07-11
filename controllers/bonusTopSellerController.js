const { v4: uuidv4 } = require('uuid');
const BonusTopSeller = require('../models/bonusTopSeller');
const generateId = require('../utils/generateId');

exports.createBonusTopSeller = async (req, res) => {
  try {
    const { id_penitip, nominal, tanggal_pembayaran } = req.body;
    const newId = await generateId({
      model: BonusTopSeller,
      prefix: 'BTS',
      fieldName: 'id_bonus_top_seller'
    });
    const bonus = await BonusTopSeller.create({
      id_bonus_top_seller: newId,
      id_penitip,
      nominal,
      tanggal_pembayaran,
    });
    res.status(201).json(bonus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBonusTopSeller = async (req, res) => {
  try {
    const bonus = await BonusTopSeller.findAll();
    res.status(200).json(bonus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBonusTopSellerById = async (req, res) => {
  try {
    const bonus = await BonusTopSeller.findByPk(req.params.id);
    if (!bonus) return res.status(404).json({ message: 'Bonus top seller tidak ditemukan' });
    res.status(200).json(bonus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBonusTopSeller = async (req, res) => {
  try {
    const { id_penitip, nominal, tanggal_pembayaran } = req.body;
    const bonus = await BonusTopSeller.findByPk(req.params.id);
    if (!bonus) return res.status(404).json({ message: 'Bonus top seller tidak ditemukan' });
    await bonus.update({ id_penitip, nominal, tanggal_pembayaran });
    res.status(200).json(bonus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBonusTopSeller = async (req, res) => {
  try {
    const bonus = await BonusTopSeller.findByPk(req.params.id);
    if (!bonus) return res.status(404).json({ message: 'Bonus top seller tidak ditemukan' });
    await bonus.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};