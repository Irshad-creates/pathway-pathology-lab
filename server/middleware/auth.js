const jwt = require("jsonwebtoken");

const authMiddleware =
  (roles = []) =>
  (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key",
      );

      if (roles.length && !roles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden - Insufficient permissions" });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

module.exports = authMiddleware;
