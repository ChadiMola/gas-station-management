const jwt = require("jsonwebtoken");
const { secret } = require("../config/auth");

const verifyToken = (req, res, next) => {
  const token =
    req.headers["x-access-token"] || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      message: "No token provided!",
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized! Invalid or expired token.",
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.userRole === "admin" || req.userRole === "super_admin") {
    next();
    return;
  }

  res.status(403).json({
    message: "Require Admin Role!",
  });
};

const isSuperAdmin = (req, res, next) => {
  if (req.userRole === "super_admin") {
    next();
    return;
  }

  res.status(403).json({
    message: "Require Super Admin Role!",
  });
};

module.exports = {
  verifyToken,
  isAdmin,
  isSuperAdmin,
};
