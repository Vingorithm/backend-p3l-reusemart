const { v4: uuidv4 } = require('uuid');
const OrganisasiAmal = require('../models/organisasiAmal');
const generateId = require('../utils/generateId');

exports.createOrganisasiAmal = async (req, res) => {
  try {
    const { id_akun, nama_organisasi, alamat, tanggal_registrasi } = req.body;
    const newId = await generateId({
      model: OrganisasiAmal,
      prefix: 'ORG',
      fieldName: 'id_organisasi'
    });
    const organisasi = await OrganisasiAmal.create({
      id_organisasi: newId,
      id_akun,
      nama_organisasi,
      alamat,
      tanggal_registrasi,
    });
    res.status(201).json(organisasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllOrganisasiAmal = async (req, res) => {
  try {
    const organisasi = await OrganisasiAmal.findAll();
    res.status(200).json(organisasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrganisasiAmalById = async (req, res) => {
  try {
    const organisasi = await OrganisasiAmal.findByPk(req.params.id);
    if (!organisasi) return res.status(404).json({ message: 'Organisasi tidak ditemukan' });
    res.status(200).json(organisasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrganisasiAmal = async (req, res) => {
  try {
    const { id_akun, nama_organisasi, alamat, tanggal_registrasi } = req.body;
    const organisasi = await OrganisasiAmal.findByPk(req.params.id);
    if (!organisasi) return res.status(404).json({ message: 'Organisasi tidak ditemukan' });
    await organisasi.update({ id_akun, nama_organisasi, alamat, tanggal_registrasi });
    res.status(200).json(organisasi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOrganisasiAmal = async (req, res) => {
  try {
    const organisasi = await OrganisasiAmal.findByPk(req.params.id);
    if (!organisasi) return res.status(404).json({ message: 'Organisasi tidak ditemukan' });
    await organisasi.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};