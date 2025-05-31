const Barang = require("./barang");
const Pegawai = require("./pegawai");
const Pembelian = require("./pembelian");
const Penitipan = require("./penitipan");
const SubPembelian = require("./subPembelian");

function initModels() {
    // Relasi barang
    Barang.hasOne(Penitipan, { foreignKey: 'id_barang' });

    Pembelian.hasMany(SubPembelian, { foreignKey: 'id_pembelian' });
    Pembelian.hasOne(Pegawai, { foreignKey: 'id_customer_service'});
}

module.exports = {initModels }