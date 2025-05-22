const Barang = require("./barang");
const Penitipan = require("./penitipan");

function initModels() {
    // Relasi barang
    Barang.hasOne(Penitipan, { foreignKey: 'id_barang' });
}

module.exports = {initModels }