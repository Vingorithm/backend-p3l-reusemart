const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const OrganisasiAmal = require('./organisasiAmal');

const RequestDonasi = sequelize.define('RequestDonasi', {
  id_request_donasi: { type: DataTypes.STRING(50), primaryKey: true },
  id_organisasi: { type: DataTypes.STRING(50), allowNull: false },
  deskripsi_request: { type: DataTypes.STRING(1000), allowNull: false },
  tanggal_request: { type: DataTypes.DATE, allowNull: false },
  status_request: { type: DataTypes.STRING(255), allowNull: false },
}, {
  tableName: 'RequestDonasi',
  timestamps: false,
});

RequestDonasi.belongsTo(OrganisasiAmal, { foreignKey: 'id_organisasi', onDelete: 'RESTRICT' });

module.exports = RequestDonasi;