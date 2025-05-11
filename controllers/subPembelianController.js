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
    const subPembelianRecords = await SubPembelian.findAll({
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
      ],
      order: [['id_pembelian', 'ASC']]
    });

    if (!subPembelianRecords || subPembelianRecords.length === 0) {
      return res.status(404).json({ message: 'Tidak ada sub-pembelian ditemukan' });
    }

    // Group SubPembelian records by id_pembelian
    const groupedByPembelian = subPembelianRecords.reduce((acc, subPembelian) => {
      const pembelianId = subPembelian.id_pembelian;
      if (!acc[pembelianId]) {
        acc[pembelianId] = {
          pembelian: subPembelian.Pembelian.toJSON(),
          barang: []
        };
        // Add pengiriman to the pembelian object
        acc[pembelianId].pembelian.pengiriman = subPembelian.Pembelian.Pengiriman || null;
      }
      acc[pembelianId].barang.push(subPembelian.Barang);
      return acc;
    }, {});

    const response = Object.values(groupedByPembelian).map(({ pembelian, barang }) => {
      const { pengiriman, ...pembelianData } = pembelian; 
      return {
        ...pembelianData,
        pengiriman,
        barang
      };
    });

    res.status(200).json(response);
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

// exports.getSubPembelianByPembeliId = async (req, res) => {
//   try {
//     const { id_pembeli } = req.params;

//     // Fetch Pembelian records for the given id_pembeli, including related SubPembelian and Pengiriman
//     const pembelianRecords = await Pembelian.findAll({
//       where: { id_pembeli },
//       include: [
//         {
//           model: Pengiriman, // Include Pengiriman through Pembelian
//           required: false, // Left join to include Pembelian even if Pengiriman is null
//         },
//         {
//           model: SubPembelian,
//           include: [
//             {
//               model: Barang, // Include Barang through SubPembelian
//               required: true, // Inner join to ensure we only get SubPembelian with Barang
//             },
//           ],
//         },
//       ],
//     });

//     if (!pembelianRecords || pembelianRecords.length === 0) {
//       return res.status(404).json({ message: 'Tidak ada pembelian ditemukan untuk pembeli ini' });
//     }

//     // Format the response to match the desired structure
//     const response = pembelianRecords.map(pembelian => ({
//       id_pembelian: pembelian.id_pembelian,
//       id_customer_service: pembelian.id_customer_service,
//       id_pembeli: pembelian.id_pembeli,
//       id_alamat: pembelian.id_alamat,
//       bukti_transfer: pembelian.bukti_transfer,
//       tanggal_pembelian: pembelian.tanggal_pembelian,
//       tanggal_pelunasan: pembelian.tanggal_pelunasan,
//       total_harga: pembelian.total_harga,
//       ongkir: pembelian.ongkir,
//       potongan_poin: pembelian.potongan_poin,
//       total_bayar: pembelian.total_bayar,
//       poin_diperoleh: pembelian.poin_diperoleh,
//       status_pembelian: pembelian.status_pembelian,
//       pengiriman: pembelian.Pengiriman || null, // Handle case where Pengiriman might be null
//       barang: pembelian.SubPembelians.map(sub => ({
//         id_barang: sub.Barang.id_barang,
//         id_penitip: sub.Barang.id_penitip,
//         id_hunter: sub.Barang.id_hunter,
//         id_pegawai_gudang: sub.Barang.id_pegawai_gudang,
//         nama: sub.Barang.nama,
//         deskripsi: sub.Barang.deskripsi,
//         gambar: sub.Barang.gambar,
//         harga: sub.Barang.harga,
//         garansi_berlaku: sub.Barang.garansi_berlaku,
//         tanggal_garansi: sub.Barang.tanggal_garansi,
//         berat: sub.Barang.berat,
//         status_qc: sub.Barang.status_qc,
//         kategori_barang: sub.Barang.kategori_barang,
//       })),
//     }));

//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };