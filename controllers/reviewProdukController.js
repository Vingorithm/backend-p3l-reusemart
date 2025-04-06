const { v4: uuidv4 } = require('uuid');
const ReviewProduk = require('../models/reviewProduk');

const generateNewId = async () => {
  const last = await ReviewProduk.findOne({
    order: [['id_review_produk', 'DESC']]
  });

  if (!last || !/^REV\d+$/.test(last.id_review_produk)) return 'REV001';

  const lastId = last.id_review_produk;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = numericPart + 1;
  const formatted = newNumericPart.toString().padStart(3, '0');
  return `REV${formatted}`;
};

exports.createReviewProduk = async (req, res) => {
  try {
    const { id_transaksi, rating, tanggal_review } = req.body;
    const newId = await generateNewId();
    const review = await ReviewProduk.create({
      id_review: newId,
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