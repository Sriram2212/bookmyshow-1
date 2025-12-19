const { verifyToken } = require('../utils/jwt');

const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = verifyToken(token);
    
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin access required'
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = adminAuth;
