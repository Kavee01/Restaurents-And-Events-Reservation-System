const utilSecurity = require("../util/security");

module.exports = {
  checkJWT,
  checkLogin,
  checkIfOwner,
  checkIfAdmin,
};

function checkJWT(req, res, next) {
  let token = req.get("Authorization") || req.query.token;
  if (token) {
    if (token.startsWith("Bearer ")) {
      token = token.replace("Bearer ", "");
    }
    
    try {
      const jwt = utilSecurity.verifyJWT(token);
      if (!jwt || !jwt.payload) {
        console.log('Invalid JWT token provided or missing payload');
        req.user = null;
      } else {
        // Copy all properties from jwt.payload to req.user
        req.user = jwt.payload;
        
        // Ensure id field is available (might be _id in some places)
        if (!req.user.id && req.user._id) {
          req.user.id = req.user._id;
        } else if (!req.user._id && req.user.id) {
          req.user._id = req.user.id;
        }
        
        console.log(`User authenticated: ${req.user.id || req.user._id || 'Unknown ID'}`);
      }
    } catch (err) {
      console.log('JWT verification error:', err.message);
      req.user = null;
    }
  } else {
    // No token provided
    console.log('No JWT token provided in request');
    req.user = null;
  }
  next();
}

function checkLogin(req, res, next) {
  if (!req.user) {
    console.log('Unauthorized access attempt - no user found in request');
    return res.status(401).json({
      message: "Unauthorized - Please log in to access this resource",
      code: "AUTH_REQUIRED"
    });
  }
  next();
}

function checkIfOwner(req, res, next) {
  if (!req.user) {
    console.log('Unauthorized access attempt - no user found in request');
    return res.status(401).json({
      message: "Unauthorized - Please log in to access this resource",
      code: "AUTH_REQUIRED"
    });
  }
  if (!req.user.isOwner) {
    console.log(`User ${req.user.id || req.user._id} attempted to access owner-only resource`);
    return res.status(403).json({
      message: "Forbidden - You do not have permission to access this resource",
      code: "OWNER_REQUIRED"
    });
  }
  next();
}

function checkIfAdmin(req, res, next) {
  if (!req.user) {
    console.log('Unauthorized access attempt - no user found in request');
    return res.status(401).json({
      message: "Unauthorized - Please log in to access this resource",
      code: "AUTH_REQUIRED"
    });
  }
  if (!req.user.isAdmin) {
    console.log(`User ${req.user.id || req.user._id} attempted to access admin-only resource`);
    return res.status(403).json({
      message: "Forbidden - You do not have permission to access this resource",
      code: "ADMIN_REQUIRED"
    });
  }
  next();
}
