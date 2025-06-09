const { v4: uuidv4 } = require('uuid');
const RequestDonasi = require('../models/requestDonasi');
const generateId = require('../utils/generateId');
const Organisasi = require('../models/organisasiAmal');
const Akun = require('../models/akun');
const Donasi = require('../models/donasiBarang');

// const generateNewId = async () => {
//   const last = await RequestDonasi.findOne({
//     order: [['id_request_donasi', 'DESC']]
//   });

//   if (!last || !/^RDN\d+$/.test(last.id_request_donasi)) return 'RDN1';

//   const lastId = last.id_request_donasi;
//   const numericPart = parseInt(lastId.slice(3));
//   const newNumericPart = numericPart + 1;
//   return `RDN${newNumericPart}`;
// };

exports.createRequestDonasi = async (req, res) => {
  try {
    const { id_organisasi, deskripsi_request, tanggal_request, status_request } = req.body;
    const newId = await generateId({
      model: RequestDonasi,
      prefix: 'RDN',
      fieldName: 'id_request_donasi'
    });
    const request = await RequestDonasi.create({
      id_request_donasi: newId,
      id_organisasi,
      deskripsi_request,
      tanggal_request,
      status_request,
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllRequestDonasi = async (req, res) => {
  try {
    const request = await RequestDonasi.findAll({
      include: [
        {
          model: Organisasi,
          attributes: ['id_organisasi', 'id_akun', 'nama_organisasi', 'alamat', 'tanggal_registrasi'],
          include: [
            {
              model: Akun,
              attributes: ['id_akun', 'email', 'profile_picture']
            }
          ]
        },
        {
          model: Donasi
        }
      ],
      order: [['id_organisasi', 'ASC']]
    });

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getRequestDonasiById = async (req, res) => {
  try {
    const request = await RequestDonasi.findByPk(req.params.id, {
      include: [
        {
          model: Organisasi,
          attributes: ['id_organisasi', 'id_akun', 'nama_organisasi', 'alamat', 'tanggal_registrasi'],
          include: [
            {
              model: Akun,
              attributes: ['id_akun', 'email', 'profile_picture']
            }
          ]
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ message: 'Request donasi tidak ditemukan' });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateRequestDonasi = async (req, res) => {
  try {
    const { id_organisasi, deskripsi_request, tanggal_request, status_request } = req.body;
    const request = await RequestDonasi.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request donasi tidak ditemukan' });
    await request.update({ id_organisasi, deskripsi_request, tanggal_request, status_request });
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRequestDonasi = async (req, res) => {
  try {
    const request = await RequestDonasi.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request donasi tidak ditemukan' });
    await request.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRequestDonasiByIdOrganisasi = async (req, res) => {
  try {
    const { id } = req.params;

    const requestDonasi = await RequestDonasi.findAll({
      where: { id_organisasi: id },
      include: [
        {
          model: Organisasi,
          attributes: ['id_organisasi', 'nama_organisasi', 'alamat'],
          include: [
            {
              model: Akun,
              attributes: ['id_akun', 'email', 'profile_picture']
            }
          ]
        }
      ],
      order: [['tanggal_request', 'DESC']]
    });

    if (requestDonasi.length === 0) {
      return res.status(404).json({ message: 'Tidak ada request donasi untuk organisasi ini' });
    }

    res.status(200).json(requestDonasi);
  } catch (error) {
    console.error('Error in getRequestDonasiByIdOrganisasi:', error);
    res.status(500).json({ error: error.message });
  }
};