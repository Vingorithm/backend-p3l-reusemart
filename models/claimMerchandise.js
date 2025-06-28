const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Merchandise = require('./merchandise');
const Pembeli = require('./pembeli');
const Pegawai = require('./pegawai');

const ClaimMerchandise = sequelize.define('ClaimMerchandise', {
  id_claim_merchandise: { type: DataTypes.STRING(50), primaryKey: true },
  id_merchandise: { type: DataTypes.STRING(50), allowNull: false },
  id_pembeli: { type: DataTypes.STRING(50), allowNull: false },
  id_customer_service: { type: DataTypes.STRING(50), allowNull: false },
  tanggal_claim: { type: DataTypes.DATE, allowNull: false },
  tanggal_ambil: { type: DataTypes.DATE, allowNull: true },
  status_claim_merchandise: { type: DataTypes.STRING(255), allowNull: false },
}, {
  tableName: 'claimmerchandise',
  timestamps: false,
});

ClaimMerchandise.belongsTo(Merchandise, { foreignKey: 'id_merchandise', onDelete: 'RESTRICT' });
ClaimMerchandise.belongsTo(Pembeli, { foreignKey: 'id_pembeli', onDelete: 'RESTRICT' });
ClaimMerchandise.belongsTo(Pegawai, { foreignKey: 'id_customer_service', onDelete: 'RESTRICT' });

module.exports = ClaimMerchandise;