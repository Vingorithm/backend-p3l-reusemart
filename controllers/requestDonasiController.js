const { v4: uuidv4 } = require('uuid');
const RequestDonasi = require('../models/requestDonasi');

const generateNewId = async () => {
  const last = await RequestDonasi.findOne({
    order: [['id_request_donasi', 'DESC']]
  });

  if (!last || !/^RDN\d+$/.test(last.id_request_donasi)) return 'RDN001';

  const lastId = last.id_request_donasi;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = numericPart + 1;
  const formatted = newNumericPart.toString().padStart(3, '0');
  return `RDN${formatted}`;
};

exports.createRequestDonasi = async (req, res) => {
  try {
    const { id_organisasi, deskripsi_request, tanggal_request, status_request } = req.body;
    const newId = await generateNewId();
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
    const request = await RequestDonasi.findAll();
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRequestDonasiById = async (req, res) => {
  try {
    const request = await RequestDonasi.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request donasi tidak ditemukan' });
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