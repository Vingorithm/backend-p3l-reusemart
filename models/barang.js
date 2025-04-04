const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Penitip = require('./penitip');
const Pegawai = require('./pegawai');

const Barang = sequelize.define('Barang', {
  id_barang: {
    type: DataTypes.STRING(50),
    primaryKey: true,
  },
  id_penitip: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  id_hunter: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  id_pegawai_gudang: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  nama: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  deskripsi: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  gambar: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  harga: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  garansi_berlaku: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0,
  },
  tanggal_garansi: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  berat: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status_qc: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  kategori_barang: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'Barang',
  timestamps: false,
});

Barang.belongsTo(Penitip, { foreignKey: 'id_penitip', onDelete: 'RESTRICT' });
Barang.belongsTo(Pegawai, { as: 'Hunter', foreignKey: 'id_hunter', onDelete: 'SET NULL' });
Barang.belongsTo(Pegawai, { as: 'PegawaiGudang', foreignKey: 'id_pegawai_gudang', onDelete: 'RESTRICT' });

module.exports = Barang;