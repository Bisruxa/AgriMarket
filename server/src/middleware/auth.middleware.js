const jwt = require('jsonwebtoken');
const { prisma, ensureDbConnection } = require('../config/db');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in cookie first, then header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Fallback to Authorization header (for mobile apps, Postman, etc.)
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'none') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await ensureDbConnection();

    // Attach user to request
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        approvalStatus: true,
        deletedAt: true,
      }
    });
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.user.deletedAt) {
      return res.status(401).json({
        success: false,
        message: 'This account has been deleted.',
      });
    }

    if (req.user.role === 'TRADER') {
      if (req.user.approvalStatus === 'PENDING') {
        return res.status(403).json({
          success: false,
          message:
            'Your account is pending admin approval. Please wait for verification.',
          approvalStatus: 'PENDING',
        });
      }
      if (req.user.approvalStatus === 'REJECTED') {
        return res.status(403).json({
          success: false,
          message:
            'Your trader account was not approved. Contact support for more information.',
          approvalStatus: 'REJECTED',
        });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
