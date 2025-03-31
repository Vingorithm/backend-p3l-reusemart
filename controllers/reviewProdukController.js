const { v4: uuidv4 } = require('uuid');
const ReviewProduk = require('../models/reviewProduk');

exports.createReviewProduk = async (req, res) => {
  try {
    const { id_transaksi, rating, tanggal_review } = req.body;
    const review = await ReviewProduk.create({
      id_review: uuidv4(),
      id_transaksi,
      rating,
      tanggal_review,
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllReviewProduk = async (req, res) => {
  try {
    const review = await ReviewProduk.findAll();
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviewProdukById = async (req, res) => {
  try {
    const review = await ReviewProduk.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review tidak ditemukan' });
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateReviewProduk = async (req, res) => {
  try {
    const { id_transaksi, rating, tanggal_review } = req.body;
    const review = await ReviewProduk.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review tidak ditemukan' });
    await review.update({ id_transaksi, rating, tanggal_review });
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReviewProduk = async (req, res) => {
  try {
    const review = await ReviewProduk.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review tidak ditemukan' });
    await review.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};