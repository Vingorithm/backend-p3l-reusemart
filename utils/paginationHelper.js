// utils/pagination.js
function getPagination(page, limit) {
  const currentPage = page ? parseInt(page) : 1;
  const perPage = limit ? parseInt(limit) : 10;
  const offset = (currentPage - 1) * perPage;
  return { limit: perPage, offset, currentPage };
}
module.exports = getPagination;

// Contoh cara menggunakan di controller
// const getPagination = require('../utils/pagination');
// const { limit, offset, currentPage } = getPagination(req.query.page, req.query.limit);