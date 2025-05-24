const Penitipan = require('../models/penitipan');
const Barang = require('../models/barang');
const Penitip = require('../models/penitip');
const Akun = require('../models/akun');
const generateId = require('../utils/generateId');

const Pembelian = require('../models/pembelian');
const Pengiriman = require('../models/pengiriman');
const Pembeli = require('../models/pembeli');
const AlamatPembeli = require('../models/alamatPembeli');
const SubPembelian = require('../models/subPembelian');

exports.createPenitipan = async (req, res) => {
  try {
    const { id_barang, tanggal_awal_penitipan, tanggal_akhir_penitipan, tanggal_batas_pengambilan, perpanjangan, status_penitipan } = req.body;
    const newId = await generateId({
      model: Penitipan,
      prefix: 'PTP',
      fieldName: 'id_penitipan'
    });
    const penitipan = await Penitipan.create({
      id_penitipan: newId,
      id_barang,
      tanggal_awal_penitipan,
      tanggal_akhir_penitipan,
      tanggal_batas_pengambilan,
      perpanjangan,
      status_penitipan,
    });
    res.status(201).json(penitipan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPenitipan = async (req, res) => {
  try {
    const baseUrl = 'http://localhost:3000/uploads/barang/';
    const penitipan = await Penitipan.findAll({
      include: [
        {
          model: Barang,
          attributes: ['id_barang', 'id_penitip', 'id_hunter', 'id_pegawai_gudang', 'nama', 'gambar', 'harga', 'garansi_berlaku', 'tanggal_garansi', 'berat', 'status_qc', 'kategori_barang'],
          include: [
            {
              model: Penitip,
              attributes: ['id_penitip', 'nama_penitip', 'total_poin', 'tanggal_registrasi'],
              include: [{
                model: Akun,
                attributes: ['id_akun', 'email', 'profile_picture', 'role'],
              }],
            }
          ]
        }
      ],
      order: [['id_barang', 'ASC']]
    });
    
    // Tambahin Url pada saat return gambar
    const penitipanWithFullImageUrl = penitipan.map(p => {
      const barang = p.Barang;
      if (barang && barang.gambar) {
        const gambarList = barang.gambar.split(',').map(g => `${baseUrl}${g.trim()}`);
        barang.gambar = gambarList.join(',');
      }
      return p;
    });
    
    res.status(200).json(penitipanWithFullImageUrl);    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPenitipanById = async (req, res) => {
  try {
    const penitipan = await Penitipan.findByPk(req.params.id, {
      include: [
        {
          model: Barang,
          attributes: ['id_barang', 'id_penitip', 'id_hunter', 'id_pegawai_gudang', 'nama', 'gambar', 'harga', 'garansi_berlaku', 'tanggal_garansi', 'berat', 'status_qc', 'kategori_barang'],
          include: [
            {
              model: Penitip,
              attributes: ['id_penitip', 'nama_penitip', 'total_poin', 'tanggal_registrasi'],
              include: [{
                model: Akun,
                attributes: ['id_akun', 'email', 'profile_picture', 'role'],
              }],
            }
          ]
        }
      ],
      order: [['id_barang', 'ASC']]
    });
    if (!penitipan) return res.status(404).json({ message: 'Penitipan tidak ditemukan' });
    res.status(200).json(penitipan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPenitipanByIdBarang = async (req, res) => {
  try {
    const { id_barang } = req.params;
    const baseUrl = 'http://localhost:3000/uploads/barang/';

    const penitipan = await Penitipan.findOne({
      where: { id_barang },
      include: [
        {
          model: Barang,
          attributes: [
            'id_barang', 'id_penitip', 'id_hunter', 'id_pegawai_gudang',
            'nama', 'gambar', 'harga', 'garansi_berlaku', 'tanggal_garansi',
            'berat', 'status_qc', 'kategori_barang'
          ],
          include: [
            {
              model: Penitip,
              attributes: ['id_penitip', 'nama_penitip', 'total_poin', 'tanggal_registrasi'],
              include: [{
                model: Akun,
                attributes: ['id_akun', 'email', 'profile_picture', 'role'],
              }],
            }
          ]
        }
      ]
    });

    if (!penitipan) return res.status(404).json({ message: 'Penitipan untuk id_barang ini tidak ditemukan' });

    const barang = penitipan.Barang;
    if (barang && barang.gambar) {
      const gambarList = barang.gambar.split(',').map(g => `${baseUrl}${g.trim()}`);
      barang.gambar = gambarList.join(',');
    }

    res.status(200).json(penitipan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updatePenitipan = async (req, res) => {
  try {
    const { id_barang, tanggal_awal_penitipan, tanggal_akhir_penitipan, tanggal_batas_pengambilan, perpanjangan, status_penitipan } = req.body;
    const penitipan = await Penitipan.findByPk(req.params.id);
    if (!penitipan) return res.status(404).json({ message: 'Penitipan tidak ditemukan' });
    await penitipan.update({ id_barang, tanggal_awal_penitipan, tanggal_akhir_penitipan, tanggal_batas_pengambilan, perpanjangan, status_penitipan });
    res.status(200).json(penitipan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePenitipan = async (req, res) => {
  try {
    const penitipan = await Penitipan.findByPk(req.params.id);
    if (!penitipan) return res.status(404).json({ message: 'Penitipan tidak ditemukan' });
    await penitipan.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPenitipanByIdPenitip = async (req, res) => {
  try {
    const { id } = req.params; // Pakai id, bukan id_penitip
    console.log('Requested ID Penitip:', id); // Log ID
    const baseUrl = 'http://localhost:3000/uploads/barang/';
    
    const penitipan = await Penitipan.findAll({
      where: {
        '$Barang.Penitip.id_penitip$': id
      },
      include: [
        {
          model: Barang,
          attributes: ['id_barang', 'id_penitip', 'id_hunter', 'id_pegawai_gudang', 'nama', 'gambar', 'harga', 'garansi_berlaku', 'tanggal_garansi', 'berat', 'status_qc', 'kategori_barang'],
          include: [
            {
              model: Penitip,
              attributes: ['id_penitip', 'nama_penitip', 'total_poin', 'tanggal_registrasi'],
              include: [{
                model: Akun,
                attributes: ['id_akun', 'email', 'profile_picture', 'role'],
              }],
            }
          ]
        }
      ],
      order: [['id_barang', 'ASC']]
    });

    console.log('Penitipan Found:', penitipan.length, 'records'); // Log jumlah data
    if (!penitipan.length) {
      return res.status(404).json({ message: `Penitipan tidak ditemukan untuk id_penitip: ${id}` });
    }

    const penitipanWithFullImageUrl = penitipan.map(p => {
      const barang = p.Barang;
      if (barang && barang.gambar) {
        const gambarList = barang.gambar.split(',').map(g => `${baseUrl}${g.trim()}`);
        barang.gambar = gambarList.join(',');
      }
      return p;
    });

    res.status(200).json(penitipanWithFullImageUrl);
  } catch (error) {
    console.error('Error in getPenitipanByIdPenitip:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.getItemForScheduling = async (req, res) => {
  try {
    const { id: id_penitipan } = req.params;
    if (!id_penitipan) {
      return res.status(400).json({ message: 'id_penitipan is required' });
    }

    const baseUrl = 'http://localhost:3000/uploads/barang/';

    const penitipan = await Penitipan.findOne({
      where: {
        id_penitipan,
        status_penitipan: 'Terjual',
      },
      include: [
        {
          model: Barang,
          attributes: ['id_barang', 'id_penitip', 'nama', 'gambar', 'harga', 'berat'],
          include: [
            {
              model: Penitip,
              attributes: ['id_penitip', 'nama_penitip'],
            },
          ],
        },
      ],
    });

    if (!penitipan) {
      return res.status(404).json({ message: 'Penitipan with status "Terjual" not found' });
    }

    if (!penitipan.Barang) {
      return res.status(404).json({ message: 'Associated Barang not found for this Penitipan' });
    }

    const subPembelian = await SubPembelian.findOne({
      where: { id_barang: penitipan.Barang.id_barang },
      include: [
        {
          model: Pembelian,
          attributes: ['id_pembelian', 'id_pembeli', 'id_alamat', 'tanggal_pembelian'],
          include: [
            {
              model: Pembeli,
              attributes: ['id_pembeli', 'nama'],
            },
            {
              model: AlamatPembeli,
              attributes: ['id_alamat', 'nama_alamat', 'alamat_lengkap'],
            },
            {
              model: Pengiriman,
              required: false,
              attributes: ['id_pengiriman', 'jenis_pengiriman', 'status_pengiriman', 'tanggal_mulai', 'tanggal_berakhir'],
            },
          ],
        },
      ],
    });

    const barang = penitipan.Barang;
    if (barang && barang.gambar) {
      const gambarList = barang.gambar.split(',').map((g) => `${baseUrl}${g.trim()}`);
      barang.gambar = gambarList.join(',');
    }

    const response = {
      id_penitipan: penitipan.id_penitipan,
      status_penitipan: penitipan.status_penitipan,
      tanggal_batas_pengambilan: penitipan.tanggal_batas_pengambilan,
      barang: {
        id_barang: barang.id_barang,
        nama: barang.nama,
        gambar: barang.gambar,
        harga: barang.harga,
        berat: barang.berat,
        penitip: barang.Penitip ? { id_penitip: barang.Penitip.id_penitip, nama_penitip: barang.Penitip.nama_penitip } : null,
      },
      subPembelian: subPembelian ? { id_sub_pembelian: subPembelian.id_sub_pembelian } : null,
      pembelian: subPembelian && subPembelian.Pembelian
        ? {
            id_pembelian: subPembelian.Pembelian.id_pembelian,
            tanggal_pembelian: subPembelian.Pembelian.tanggal_pembelian,
            pembeli: { id_pembeli: subPembelian.Pembelian.Pembeli.id_pembeli, nama: subPembelian.Pembelian.Pembeli.nama },
            alamat: {
              id_alamat: subPembelian.Pembelian.AlamatPembeli.id_alamat,
              nama_alamat: subPembelian.Pembelian.AlamatPembeli.nama_alamat,
              alamat_lengkap: subPembelian.Pembelian.AlamatPembeli.alamat_lengkap,
            },
            pengiriman: subPembelian.Pembelian.Pengiriman
              ? {
                  id_pengiriman: subPembelian.Pembelian.Pengiriman.id_pengiriman,
                  jenis_pengiriman: subPembelian.Pembelian.Pengiriman.jenis_pengiriman,
                  status_pengiriman: subPembelian.Pembelian.Pengiriman.status_pengiriman,
                  tanggal_mulai: subPembelian.Pembelian.Pengiriman.tanggal_mulai,
                  tanggal_berakhir: subPembelian.Pembelian.Pengiriman.tanggal_berakhir,
                }
              : null,
          }
        : null,
    };

    if (!subPembelian) {
      response.message = 'No SubPembelian found. This item may not have been purchased.';
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getItemForScheduling:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.schedulePickup = async (req, res) => {
  try {
    console.log('Schedule Pickup Request Body:', req.body);
    const { id_pengiriman, tanggal_mulai, tanggal_berakhir } = req.body;
    if (!id_pengiriman || !tanggal_mulai || !tanggal_berakhir) {
      return res.status(400).json({ message: 'id_pengiriman, tanggal_mulai, and tanggal_berakhir are required' });
    }

    const startDate = new Date(tanggal_mulai);
    startDate.setHours(8, 0, 0, 0);

    const dayOfWeek = startDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json({ message: 'Scheduling is only allowed on weekdays (Monday-Friday)' });
    }

    const today = new Date();
    today.setHours(16, 0, 0, 0);
    if (startDate.toDateString() === today.toDateString() && new Date().getHours() >= 16) {
      return res.status(400).json({ message: 'Cannot schedule pickup on the same day after 4 PM' });
    }

    const pengiriman = await Pengiriman.findByPk(id_pengiriman);
    if (!pengiriman) {
      console.log(`Pengiriman with id_pengiriman ${id_pengiriman} not found`);
      return res.status(404).json({ message: 'Pengiriman not found' });
    }

    console.log('Updating Pengiriman:', pengiriman.toJSON());
    await pengiriman.update({
      tanggal_mulai,
      tanggal_berakhir,
    });

    console.log('Updated Pengiriman:', pengiriman.toJSON());
    res.status(200).json({
      id_pengiriman: pengiriman.id_pengiriman,
      tanggal_mulai,
      tanggal_berakhir,
    });
  } catch (error) {
    console.error('Error in schedulePickup:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.confirmReceipt = async (req, res) => {
  try {
    const { id_pengiriman } = req.params;
    if (!id_pengiriman) {
      return res.status(400).json({ message: 'id_pengiriman is required' });
    }

    const pengiriman = await Pengiriman.findByPk(id_pengiriman);
    if (!pengiriman) {
      return res.status(404).json({ message: 'Pengiriman not found' });
    }

    await pengiriman.update({ status_pengiriman: 'transaksi selesai' });

    res.status(200).json({ message: 'Pengiriman status updated to "transaksi selesai"' });
  } catch (error) {
    console.error('Error in confirmReceipt:', error);
    res.status(500).json({ error: error.message });
  }
};