  const ReviewProduk = require('../models/reviewProduk');
  const Transaksi = require('../models/transaksi');
  const SubPembelian = require('../models/subPembelian');
  const Pembelian = require('../models/pembelian');
  const Penitip = require('../models/penitip');
  const Pembeli = require('../models/pembeli');
  const Barang = require('../models/barang');
  const { Op } = require('sequelize');
  const sequelize = require('../config/database');
  const path = require('path');
  const fs = require('fs');
  const generateId = require('../utils/generateId');

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

  exports.getReviewProdukLessThan5 = async (req, res) => {
    try {
      const review = await ReviewProduk.findAll({
        where: {
          rating: { [Op.lte]: 5 }
        }
      });
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
      
      res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.getReviewProdukByIdBarang = async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'ID barang diperlukan' });
    }
    
    try {
      const subPembelianData = await SubPembelian.findAll({
        attributes: ['id_sub_pembelian'],
        where: { id_barang: id }
      });
      
      if (subPembelianData.length === 0) {
        return res.status(404).json({ message: 'Tidak ada sub pembelian untuk barang ini' });
      }
      
      const subPembelianIds = subPembelianData.map(sp => sp.id_sub_pembelian);
      const transaksiData = await Transaksi.findAll({
        attributes: ['id_transaksi'],
        where: {
          id_sub_pembelian: {
            [Op.in]: subPembelianIds
          }
        }
      });
      
      if (transaksiData.length === 0) {
        return res.status(404).json({ message: 'Tidak ada transaksi untuk barang ini' });
      }
      
      const transaksiIds = transaksiData.map(t => t.id_transaksi);
      
      const reviews = await ReviewProduk.findAll({
        where: {
          id_transaksi: {
            [Op.in]: transaksiIds
          }
        },
        attributes: ['id_review', 'rating', 'tanggal_review']
      });
      
      if (reviews.length === 0) {
        return res.status(404).json({ message: 'Tidak ada review untuk barang ini' });
      }
      
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching reviews by id_barang:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
  };

  exports.createReviewProduk = async (req, res) => {
    try {
      const { id_transaksi, rating } = req.body;
      
      if (!id_transaksi || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ 
          message: 'ID transaksi dan rating (1-5) diperlukan' 
        });
      }
      
      // Cek apakah sudah ada review untuk transaksi ini
      const existingReview = await ReviewProduk.findOne({
        where: { id_transaksi }
      });
      
      if (existingReview) {
        const t = await sequelize.transaction();
        
        try {
          // Update review yang sudah ada
          await existingReview.update({ 
            rating,
            tanggal_review: new Date()
          }, { transaction: t });
          
          // Update rata-rata rating penitip
          await this.updatePenitipRating(id_transaksi, t);
          
          await t.commit();
          return res.status(200).json({
            success: true,
            data: existingReview,
            message: `Rating berhasil diperbarui menjadi ${rating} bintang!`
          });
        } catch (error) {
          await t.rollback();
          throw error;
        }
      }
      
      // Validasi transaksi exists
      const transaksi = await Transaksi.findByPk(id_transaksi);
      if (!transaksi) {
        return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
      }
      
      const t = await sequelize.transaction();
      
      try {
        // Buat review baru
        const newId = await generateId({
          model: ReviewProduk,
          prefix: 'REV',
          fieldName: 'id_review'
        });
        const review = await ReviewProduk.create({
          id_review: newId,
          id_transaksi,
          rating,
          tanggal_review: new Date()
        }, { transaction: t });
        await this.updatePenitipRating(id_transaksi, t);
        
        await t.commit();
        res.status(201).json({
          success: true,
          data: review,
          message: `Rating ${rating} bintang berhasil diberikan!`
        });
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: error.message });
    }
  };

exports.updatePenitipRating = async (idTransaksi, transaction) => {
  try {
    console.log('updatePenitipRating: idTransaksi=', idTransaksi, 'transaction=', !!transaction);

    // Dapatkan transaksi
    const transaksi = await Transaksi.findByPk(idTransaksi, { transaction });
    if (!transaksi) {
      throw new Error(`Transaksi dengan ID ${idTransaksi} tidak ditemukan`);
    }

    // Dapatkan sub pembelian
    const subPembelian = await SubPembelian.findByPk(transaksi.id_sub_pembelian, { transaction });
    if (!subPembelian) {
      throw new Error(`SubPembelian dengan ID ${transaksi.id_sub_pembelian} tidak ditemukan`);
    }

    // Dapatkan barang
    const barang = await Barang.findByPk(subPembelian.id_barang, { transaction });
    if (!barang) {
      throw new Error(`Barang dengan ID ${subPembelian.id_barang} tidak ditemukan`);
    }

    const penitipId = barang.id_penitip;
    console.log('penitipId:', penitipId);

    // Dapatkan semua barang yang dimiliki penitip ini
    const allBarang = await Barang.findAll({
      where: { id_penitip: penitipId },
      attributes: ['id_barang'],
      transaction
    });
    const barangIds = allBarang.map(b => b.id_barang);

    // Dapatkan semua sub pembelian untuk barang-barang penitip
    const allSubPembelian = await SubPembelian.findAll({
      where: { id_barang: { [Op.in]: barangIds } },
      attributes: ['id_sub_pembelian'],
      transaction
    });
    const subPembelianIds = allSubPembelian.map(sp => sp.id_sub_pembelian);

    // Dapatkan semua transaksi untuk sub pembelian tersebut
    const allTransaksi = await Transaksi.findAll({
      where: { id_sub_pembelian: { [Op.in]: subPembelianIds } },
      attributes: ['id_transaksi'],
      transaction
    });
    const transaksiIds = allTransaksi.map(t => t.id_transaksi);

    // Dapatkan semua review untuk transaksi-transaksi tersebut
    const allPenitipReviews = await ReviewProduk.findAll({
      where: { id_transaksi: { [Op.in]: transaksiIds } },
      attributes: ['rating'],
      transaction
    });

    console.log('Total reviews found:', allPenitipReviews.length);

    // Hitung rata-rata rating dengan benar (menggunakan decimal untuk presisi)
    let averageRating = 0;
    if (allPenitipReviews && allPenitipReviews.length > 0) {
      const totalRating = allPenitipReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      // Gunakan parseFloat dan toFixed untuk mendapatkan rata-rata yang tepat
      averageRating = parseFloat((totalRating / allPenitipReviews.length).toFixed(1));
    }

    console.log('Calculated average rating:', averageRating);

    // Update rating penitip dengan nilai rata-rata yang tepat
    const [updated] = await Penitip.update(
      { rating: averageRating },
      { where: { id_penitip: penitipId }, transaction }
    );

    console.log('Penitip rating updated:', updated, 'rows affected');
    console.log('New penitip rating:', averageRating);

  } catch (error) {
    console.error('Error in updatePenitipRating:', error);
    throw error;
  }
};

  exports.updateReviewProduk = async (req, res) => {
    try {
      const { rating } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating (1-5) diperlukan' });
      }
      
      const review = await ReviewProduk.findByPk(req.params.id);
      
      if (!review) {
        return res.status(404).json({ message: 'Review tidak ditemukan' });
      }
      
      const t = await sequelize.transaction();
      
      try {
        await review.update({ 
          rating,
          tanggal_review: new Date()
        }, { transaction: t });
        
        await this.updatePenitipRating(review.id_transaksi, t);
        
        await t.commit();
        res.status(200).json({
          success: true,
          data: review,
          message: `Rating berhasil diperbarui menjadi ${rating} bintang!`
        });
      } catch (error) {
        await t.rollback();
        throw error;
      }
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
      
      const t = await sequelize.transaction();
      
      try {
        const idTransaksi = review.id_transaksi;
        
        await review.destroy({ transaction: t });
        await this.updatePenitipRating(idTransaksi, t);
        
        await t.commit();
        res.status(204).json();
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };