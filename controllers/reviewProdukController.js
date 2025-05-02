const ReviewProduk = require('../models/reviewProduk');
const Transaksi = require('../models/transaksi');
const Pengiriman = require('../models/pengiriman');
const Pembelian = require('../models/pembelian');
const Penitip = require('../models/penitip');
const Pembeli = require('../models/pembeli');
const Barang = require('../models/barang');
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
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'ID barang diperlukan' });
  }
  
  try {
    // Kunci: Mendapatkan id_transaksi yang sesuai dengan id_barang terlebih dahulu
    const pembelianData = await Pembelian.findAll({
      attributes: ['id_pembelian'],
      where: { id_barang: id }
    });
    
    if (pembelianData.length === 0) {
      return res.status(404).json({ message: 'Tidak ada pembelian untuk barang ini' });
    }
    
    const pembelianIds = pembelianData.map(p => p.id_pembelian);
    
    const pengirimanData = await Pengiriman.findAll({
      attributes: ['id_pengiriman'],
      where: {
        id_pembelian: {
          [Op.in]: pembelianIds
        }
      }
    });
    
    if (pengirimanData.length === 0) {
      return res.status(404).json({ message: 'Tidak ada pengiriman untuk barang ini' });
    }
    
    const pengirimanIds = pengirimanData.map(p => p.id_pengiriman);
    
    const transaksiData = await Transaksi.findAll({
      attributes: ['id_transaksi'],
      where: {
        id_pengiriman: {
          [Op.in]: pengirimanIds
        }
      }
    });
    
    if (transaksiData.length === 0) {
      return res.status(404).json({ message: 'Tidak ada transaksi untuk barang ini' });
    }
    
    const transaksiIds = transaksiData.map(t => t.id_transaksi);
    
    // Sekarang cari review yang sesuai dengan id_transaksi yang sudah difilter
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
    
    // Jika ingin menambahkan data pembeli dan barang, bisa dilakukan dengan cara berikut
    // tetapi ini opsional, sesuai kebutuhan
    
    // const detailedReviews = await Promise.all(reviews.map(async (review) => {
    //   const transaksi = await Transaksi.findByPk(review.id_transaksi);
    //   const pengiriman = await Pengiriman.findByPk(transaksi.id_pengiriman);
    //   const pembelian = await Pembelian.findByPk(pengiriman.id_pembelian);
    //   const pembeli = await Pembeli.findByPk(pembelian.id_pembeli);
    //   
    //   return {
    //     ...review.toJSON(),
    //     nama_pembeli: pembeli.nama
    //   };
    // }));
    
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
    
    // Check if review already exists
    const existingReview = await ReviewProduk.findOne({
      where: { id_transaksi }
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        message: 'Review sudah pernah diberikan untuk transaksi ini' 
      });
    }
    
    // Check if transaction exists and completed
    const transaksi = await Transaksi.findByPk(id_transaksi);
    if (!transaksi) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    
    // Get pengiriman to check status
    const pengiriman = await Pengiriman.findByPk(transaksi.id_pengiriman);
    if (!pengiriman || pengiriman.status_pengiriman !== 'Selesai') {
      return res.status(400).json({ 
        message: 'Review hanya dapat diberikan untuk transaksi yang telah selesai' 
      });
    }
    
    // Get pembelian to find the product
    const pembelian = await Pembelian.findByPk(pengiriman.id_pembelian);
    if (!pembelian) {
      return res.status(404).json({ message: 'Data pembelian tidak ditemukan' });
    }
    
    // Get product to find the seller (penitip)
    const barang = await Barang.findByPk(pembelian.id_barang);
    if (!barang) {
      return res.status(404).json({ message: 'Data barang tidak ditemukan' });
    }
    
    // Begin transaction to ensure data consistency
    const t = await sequelize.transaction();
    
    try {
      // Create the review
      const review = await ReviewProduk.create({
        id_review: `REV${Date.now()}`,
        id_transaksi,
        rating,
        tanggal_review: new Date()
      }, { transaction: t });
      
      // Update penitip's rating (cumulative)
      const penitip = await Penitip.findByPk(barang.id_penitip, { transaction: t });
      
      if (penitip) {
        // Get all reviews for this penitip's products
        const allPenitipReviews = await sequelize.query(`
          SELECT r.rating
          FROM ReviewProduk r
          JOIN Transaksi t ON r.id_transaksi = t.id_transaksi
          JOIN Pengiriman pg ON t.id_pengiriman = pg.id_pengiriman
          JOIN Pembelian pb ON pg.id_pembelian = pb.id_pembelian
          JOIN Barang b ON pb.id_barang = b.id_barang
          WHERE b.id_penitip = :id_penitip
        `, {
          replacements: { id_penitip: barang.id_penitip },
          type: sequelize.QueryTypes.SELECT,
          transaction: t
        });
        
        // Calculate average rating
        let totalRating = rating; // Include current rating
        let reviewCount = 1; // Start with current review
        
        if (allPenitipReviews && allPenitipReviews.length > 0) {
          totalRating += allPenitipReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          reviewCount += allPenitipReviews.length;
        }
        
        const averageRating = Math.round(totalRating / reviewCount);
        
        // Update penitip's cumulative rating
        await penitip.update({ 
          rating: averageRating 
        }, { transaction: t });
      }
      
      await t.commit();
      res.status(201).json(review);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: error.message });
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
    
    // Begin transaction
    const t = await sequelize.transaction();
    
    try {
      // Update review
      await review.update({ rating }, { transaction: t });
      
      // Get associated transaction, pengiriman, pembelian, and barang
      const transaksi = await Transaksi.findByPk(review.id_transaksi, { transaction: t });
      if (transaksi) {
        const pengiriman = await Pengiriman.findByPk(transaksi.id_pengiriman, { transaction: t });
        if (pengiriman) {
          const pembelian = await Pembelian.findByPk(pengiriman.id_pembelian, { transaction: t });
          if (pembelian) {
            const barang = await Barang.findByPk(pembelian.id_barang, { transaction: t });
            if (barang) {
              // Update penitip's rating
              const penitip = await Penitip.findByPk(barang.id_penitip, { transaction: t });
              if (penitip) {
                // Get all reviews for this penitip's products
                const allPenitipReviews = await sequelize.query(`
                  SELECT r.rating
                  FROM ReviewProduk r
                  JOIN Transaksi t ON r.id_transaksi = t.id_transaksi
                  JOIN Pengiriman pg ON t.id_pengiriman = pg.id_pengiriman
                  JOIN Pembelian pb ON pg.id_pembelian = pb.id_pembelian
                  JOIN Barang b ON pb.id_barang = b.id_barang
                  WHERE b.id_penitip = :id_penitip AND r.id_review != :current_review_id
                `, {
                  replacements: { 
                    id_penitip: barang.id_penitip,
                    current_review_id: review.id_review
                  },
                  type: sequelize.QueryTypes.SELECT,
                  transaction: t
                });
                
                // Calculate average rating
                let totalRating = rating; // Include current updated rating
                let reviewCount = 1; // Start with current review
                
                if (allPenitipReviews && allPenitipReviews.length > 0) {
                  totalRating += allPenitipReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
                  reviewCount += allPenitipReviews.length;
                }
                
                const averageRating = Math.round(totalRating / reviewCount);
                
                // Update penitip's cumulative rating
                await penitip.update({ 
                  rating: averageRating 
                }, { transaction: t });
              }
            }
          }
        }
      }
      
      await t.commit();
      res.status(200).json(review);
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
    
    // Begin transaction
    const t = await sequelize.transaction();
    
    try {
      // Get associated transaction, pengiriman, pembelian, and barang before deleting
      const transaksi = await Transaksi.findByPk(review.id_transaksi, { transaction: t });
      let penitipId = null;
      
      if (transaksi) {
        const pengiriman = await Pengiriman.findByPk(transaksi.id_pengiriman, { transaction: t });
        if (pengiriman) {
          const pembelian = await Pembelian.findByPk(pengiriman.id_pembelian, { transaction: t });
          if (pembelian) {
            const barang = await Barang.findByPk(pembelian.id_barang, { transaction: t });
            if (barang) {
              penitipId = barang.id_penitip;
            }
          }
        }
      }
      await review.destroy({ transaction: t });
 
      if (penitipId) {
        const allPenitipReviews = await sequelize.query(`
          SELECT r.rating
          FROM ReviewProduk r
          JOIN Transaksi t ON r.id_transaksi = t.id_transaksi
          JOIN Pengiriman pg ON t.id_pengiriman = pg.id_pengiriman
          JOIN Pembelian pb ON pg.id_pembelian = pb.id_pembelian
          JOIN Barang b ON pb.id_barang = b.id_barang
          WHERE b.id_penitip = :id_penitip
        `, {
          replacements: { id_penitip: penitipId },
          type: sequelize.QueryTypes.SELECT,
          transaction: t
        });

        let averageRating = 0;
        
        if (allPenitipReviews && allPenitipReviews.length > 0) {
          const totalRating = allPenitipReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
          averageRating = Math.round(totalRating / allPenitipReviews.length);
        }

        const penitip = await Penitip.findByPk(penitipId, { transaction: t });
        if (penitip) {
          await penitip.update({ 
            rating: averageRating 
          }, { transaction: t });
        }
      }
      
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

