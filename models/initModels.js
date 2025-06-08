const Barang = require("./barang");
const Pegawai = require("./pegawai");
const Pembelian = require("./pembelian");
const Penitipan = require("./penitipan");
const SubPembelian = require("./subPembelian");
const Transaksi = require("./transaksi");

function initModels() {
    // Relasi barang
    Barang.hasOne(Penitipan, { foreignKey: 'id_barang' });

    Pembelian.hasMany(SubPembelian, { foreignKey: 'id_pembelian' });
    Pembelian.hasOne(Pegawai, { foreignKey: 'id_pegawai'});
    Transaksi.belongsTo(SubPembelian, { foreignKey: 'id_sub_pembelian', onDelete: 'CASCADE' });
    SubPembelian.hasOne(Transaksi, { foreignKey: 'id_sub_pembelian' });
}

module.exports = {initModels }