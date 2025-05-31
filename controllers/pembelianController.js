const { v4: uuidv4 } = require('uuid');
const Pembelian = require('../models/pembelian');
const generateId = require('../utils/generateId');
const AlamatPembeli = require('../models/alamatPembeli');
const Pembeli = require('../models/pembeli');
const Pengiriman = require('../models/pengiriman');
const SubPembelian = require('../models/subPembelian');
const Pegawai = require('../models/pegawai');
const Barang = require('../models/barang');
const Akun = require('../models/akun');
const path = require('path');
const fs = require('fs');

// const generateNewId = async () => {
//   const last = await Pembelian.findOne({
//     order: [['id_pembelian', 'DESC']]
//   });

//   if (!last || !/^PBLN\d+$/.test(last.id_pembelian)) return 'PBLN1';

//   const lastId = last.id_pembelian;
//   const numericPart = parseInt(lastId.slice(4));
//   const newNumericPart = numericPart + 1;
//   return `PBLN${newNumericPart}`;
// };

exports.createPembelian = async (req, res) => {
  try {
    const { id_customer_service, id_pembeli, id_alamat, bukti_transfer, tanggal_pembelian, tanggal_pelunasan, total_harga, ongkir, potongan_poin, total_bayar, poin_diperoleh, status_pembelian } = req.body;
    const newId = await generateId({
      model: Pembelian,
      prefix: 'PBLN',
      fieldName: 'id_pembelian'
    });
    const pembelian = await Pembelian.create({
      id_pembelian: newId,
      id_customer_service,
      id_pembeli,
      id_alamat,
      bukti_transfer,
      tanggal_pembelian,
      tanggal_pelunasan,
      total_harga,
      ongkir,
      potongan_poin,
      total_bayar,
      poin_diperoleh,
      status_pembelian,
    });
    res.status(201).json(pembelian);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPembelian = async (req, res) => {
  try {
    const pembelian = await Pembelian.findAll({
      include: [
        {
          model: Pegawai,
          as: 'CustomerService',
          include: [
            {
              model: Akun,
              attributes: ['role']
            }
          ]
        },
        { model: AlamatPembeli },
        { 
          model: Pembeli,
          include: [
            {
              model: Akun,
              attributes: ['email']
            }
          ]
         },
        { model: Pengiriman,
          include: [
            {
              model: Pegawai,
              include: [
                {
                  model: Akun,
                  attributes: ['role']
                }
              ]
            }
          ],
        },
        {
          model: SubPembelian,
          include: [
            {
              model: Barang,
              include: [
                {
                  model: Pegawai,
                  as: 'PegawaiGudang',
                  include: [
                    {
                      model: Akun,
                      attributes: ['role']
                    }
                  ]
                },
                {
                  model: Pegawai,
                  as: 'Hunter',
                  include: [
                    {
                      model: Akun,
                      attributes: ['role']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });
    res.status(200).json(pembelian);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPembelianById = async (req, res) => {
  try {
    const pembelian = await Pembelian.findByPk(req.params.id, {
      include: [
        { model: AlamatPembeli },
        { 
          model: Pembeli,
          include: [
            {
              model: Akun,
              attributes: ['email']
            }
          ]
         },
        { model: Pengiriman,
          include: [
            {
              model: Pegawai,
              include: [
                {
                  model: Akun,
                  attributes: ['role']
                }
              ]
            }
          ],
        },
        {
          model: SubPembelian,
          include: [
            {
              model: Barang,
              include: [
                {
                  model: Pegawai,
                  as: 'PegawaiGudang',
                  include: [
                    {
                      model: Akun,
                      attributes: ['role']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    if (!pembelian) return res.status(404).json({ message: 'Pembelian tidak ditemukan' });

    res.status(200).json(pembelian);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePembelian = async (req, res) => {
   try {
    const {
      id_customer_service,
      id_pembeli,
      id_alamat,
      tanggal_pembelian,
      tanggal_pelunasan,
      total_harga,
      ongkir,
      potongan_poin,
      total_bayar,
      poin_diperoleh,
      status_pembelian,
    } = req.body;

    const id = req.params.id;
    const numericId = id.match(/\d+/)?.[0] || '0';

    // Ambil pembelian berdasarkan ID
    const pembelian = await Pembelian.findByPk(id);
    if (!pembelian) return res.status(404).json({ message: 'Pembelian tidak ditemukan' });

    const updateData = {
      id_customer_service,
      id_pembeli,
      id_alamat,
      tanggal_pembelian,
      tanggal_pelunasan,
      total_harga,
      ongkir,
      potongan_poin,
      total_bayar,
      poin_diperoleh,
      status_pembelian
    };

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFilename = `tf${numericId}${ext}`;
      const uploadDir = path.join(__dirname, '..', 'uploads', 'bukti_bayar');
      const destPath = path.join(uploadDir, newFilename);

      if (pembelian.bukti_transfer) {
        const oldPath = path.join(uploadDir, pembelian.bukti_transfer);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      updateData.bukti_transfer = newFilename;
    }

    // Update data pembelian
    await pembelian.update(updateData);

    res.status(200).json(pembelian);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.deletePembelian = async (req, res) => {
  try {
    const pembelian = await Pembelian.findByPk(req.params.id);
    if (!pembelian) return res.status(404).json({ message: 'Pembelian tidak ditemukan' });
    await pembelian.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPembelianByPembeliId = async (req, res) => {
  try {
    const pembelian = await Pembelian.findAll({
      where: {
        id_pembeli: req.params.id
      }
    });
    if (!pembelian || pembelian.length === 0) {
      return res.status(404).json({ message: 'Tidak ada pembelian ditemukan untuk pembeli ini' });
    }
    res.status(200).json(pembelian);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};