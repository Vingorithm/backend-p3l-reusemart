const { v4: uuidv4 } = require('uuid');
const RequestDonasi = require('../models/requestDonasi');

exports.createRequestDonasi = async (req, res) => {
  try {
    const { id_organisasi, deskripsi_request, tanggal_request, status_request } = req.body;
    const request = await RequestDonasi.create({
      id_request_donasi: uuidv4(),
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