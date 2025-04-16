const roleCheck = (allowedRoles) => (req, res, next) => {
    const userRole = req.user.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Akses ditolak: role tidak memadai' });
    }
    next();
  };
  
  module.exports = roleCheck;