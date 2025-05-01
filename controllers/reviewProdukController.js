const ReviewProduk = require('../models/reviewProduk');
const Transaksi = require('../models/transaksi');
const Pengiriman = require('../models/pengiriman');
const Pembelian = require('../models/pembelian');
const Pembeli = require('../models/pembeli');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

exports.getAllReviewProduk = async (req, res) => {
  try {
    const reviews = await ReviewProduk.findAll();
    res.status(200).json(reviews);
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

exports.getReviewProdukByIdTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await ReviewProduk.findAll({
      where: { id_transaksi: id }
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviewProdukByIdBarang = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reviews = await sequelize.query(`
      SELECT r.*, p.nama as reviewer, p.alamat as location, r.content,
             r.rating, r.tanggal_review
      FROM ReviewProduk r
      JOIN Transaksi t ON r.id_transaksi = t.id_transaksi
      JOIN Pengiriman pg ON t.id_pengiriman = pg.id_pengiriman
      JOIN Pembelian pb ON pg.id_pembelian = pb.id_pembelian
      JOIN Pembeli p ON pb.id_pembeli = p.id_pembeli
      WHERE pb.id_barang = :id
      ORDER BY r.tanggal_review DESC
    `, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT
    });
    
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error getting reviews by barang ID:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createReviewProduk = async (req, res) => {
  try {
    const { id_transaksi, rating, content } = req.body;
    
    const existingReview = await ReviewProduk.findOne({
      where: { id_transaksi }
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'Ya has enviado una reseña para esta transacción' });
    }
    
    const transaksi = await Transaksi.findByPk(id_transaksi);
    if (!transaksi) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }
    
    const review = await ReviewProduk.create({
      id_review: `REV${Date.now()}`,
      id_transaksi,
      rating,
      content,
      tanggal_review: new Date()
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateReviewProduk = async (req, res) => {
  try {
    const { rating, content } = req.body;
    const review = await ReviewProduk.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review tidak ditemukan' });
    }
    
    await review.update({ rating, content });
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReviewProduk = async (req, res) => {
  try {
    const review = await ReviewProduk.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review tidak ditemukan' });
    }
    
    await review.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};