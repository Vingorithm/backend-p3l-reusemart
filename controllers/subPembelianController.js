const { v4: uuidv4 } = require('uuid');
const SubPembelian = require('../models/subPembelian');
const generateId = require('../utils/generateId');
const Pembelian = require('../models/pembelian');
const Barang = require('../models/barang');
const Pengiriman = require('../models/pengiriman');

exports.createSubPembelian = async (req, res) => {
  try {
    const { id_pembelian, id_barang } = req.body;
    const newId = await generateId({
      model: SubPembelian,
      prefix: 'SPBLN',
      fieldName: 'id_sub_pembelian'
    });
    const subPembelian = await SubPembelian.create({
      id_sub_pembelian: newId,
      id_pembelian,
      id_barang,
    });
    res.status(201).json(subPembelian);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSubPembelian = async (req, res) => {
    try {
      const subPembelian = await SubPembelian.findAll({
        include: [
          {
            model: Pembelian,
            attributes: ['id_pembelian', 'id_customer_service', 'id_pembeli', 'id_alamat', 'bukti_transfer', 'tanggal_pembelian', 'tanggal_pelunasan', 'total_harga', 'ongkir', 'potongan_poin', 'total_bayar', 'poin_diperoleh', 'status_pembelian'],
          },
          {
            model: Barang,
            attributes: ['id_barang', 'id_penitip', 'id_hunter', 'id_pegawai_gudang', 'nama', 'deskripsi', 'gambar', 'harga', 'garansi_berlaku', 'tanggal_garansi', 'berat', 'status_qc', 'kategori_barang'],
          },
        ],
        order: [['id_pembelian', 'ASC']]
      });
      res.status(200).json(subPembelian);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

exports.getSubPembelianById = async (req, res) => {
    try {
      const subPembelian = await SubPembelian.findByPk(req.params.id, {
        include: [
          {
            model: Pembelian,
            attributes: ['id_pembelian', 'id_customer_service', 'id_pembeli', 'id_alamat', 'bukti_transfer', 'tanggal_pembelian', 'tanggal_pelunasan', 'total_harga', 'ongkir', 'potongan_poin', 'total_bayar', 'poin_diperoleh', 'status_pembelian'],
          },
          {
            model: Barang,
            attributes: ['id_barang', 'id_penitip', 'id_hunter', 'id_pegawai_gudang', 'nama', 'deskripsi', 'gambar', 'harga', 'garansi_berlaku', 'tanggal_garansi', 'berat', 'status_qc', 'kategori_barang'],
          }
        ]
      });
  
      if (!subPembelian) {
        return res.status(404).json({ message: 'Sub Pembelian tidak ditemukan' });
      }
  
      res.status(200).json(subPembelian);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
  

exports.updateSubPembelian = async (req, res) => {
  try {
    const { id_pembelian, id_barang } = req.body;
    const subPembelian = await SubPembelian.findByPk(req.params.id);
    if (!subPembelian) return res.status(404).json({ message: 'Sub Pembelian tidak ditemukan' });
    await subPembelian.update({ id_pembelian, id_barang });
    res.status(200).json(subPembelian);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSubPembelian = async (req, res) => {
  try {
    const subPembelian = await SubPembelian.findByPk(req.params.id);
    if (!subPembelian) return res.status(404).json({ message: 'Sub Pembelian tidak ditemukan' });
    await subPembelian.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubPembelianByIdPembelian = async (req, res) => {
  const { id } = req.params;

  try {
    const subPembelian = await SubPembelian.findAll({
      where: { id_pembelian: id },
      include: [
        {
          model: Pembelian,
          attributes: [
            'id_pembelian', 'id_customer_service', 'id_pembeli', 'id_alamat',
            'bukti_transfer', 'tanggal_pembelian', 'tanggal_pelunasan',
            'total_harga', 'ongkir', 'potongan_poin', 'total_bayar',
            'poin_diperoleh', 'status_pembelian'
          ],
          include: [
            {
              model: Pengiriman,
              attributes: [  
                'id_pengiriman', 'id_pembelian', 'id_pengkonfirmasi',
                'tanggal_mulai', 'tanggal_berakhir',
                'status_pengiriman', 'jenis_pengiriman'
              ]
            }
          ]
        },
        {
          model: Barang,
          attributes: [
            'id_barang', 'id_penitip', 'id_hunter', 'id_pegawai_gudang',
            'nama', 'deskripsi', 'gambar', 'harga',
            'garansi_berlaku', 'tanggal_garansi', 'berat',
            'status_qc', 'kategori_barang'
          ]
        }
      ]
    });

    if (subPembelian.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }


    const pembelian = subPembelian[0].Pembelian.toJSON();
    const pengiriman = pembelian.Pengiriman;
    const barang = subPembelian.map(sp => sp.Barang);

    delete pembelian.Pengiriman;

    res.status(200).json({
      ...pembelian,
      pengiriman,
      barang
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};