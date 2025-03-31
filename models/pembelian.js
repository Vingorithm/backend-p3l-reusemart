const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Barang = require('./barang');
const Pegawai = require('./pegawai');
const Pembeli = require('./pembeli');
const AlamatPembeli = require('./alamatPembeli');

const Pembelian = sequelize.define('Pembelian', {
  id_pembelian: { type: DataTypes.STRING(50), primaryKey: true },
  id_barang: { type: DataTypes.STRING(50), allowNull: false },
  id_customer_service: { type: DataTypes.STRING(50), allowNull: false },
  id_pembeli: { type: DataTypes.STRING(50), allowNull: false },
  id_alamat: { type: DataTypes.STRING(50), allowNull: false },
  bukti_transfer: { type: DataTypes.STRING(255), allowNull: false },
  tanggal_pembelian: { type: DataTypes.DATE, allowNull: false },
  tanggal_pelunasan: { type: DataTypes.DATE, allowNull: true },
  total_harga: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  ongkir: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
  potongan_poin: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  total_bayar: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  poin_diperoleh: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status_pembelian: { type: DataTypes.STRING(20), allowNull: false },
}, {
  tableName: 'Pembelian',
  timestamps: false,
});

Pembelian.belongsTo(Barang, { foreignKey: 'id_barang', onDelete: 'RESTRICT' });
Pembelian.belongsTo(Pegawai, { foreignKey: 'id_customer_service', onDelete: 'RESTRICT' });
Pembelian.belongsTo(Pembeli, { foreignKey: 'id_pembeli', onDelete: 'RESTRICT' });
Pembelian.belongsTo(AlamatPembeli, { foreignKey: 'id_alamat', onDelete: 'RESTRICT' });

module.exports = Pembelian;