const jwt = require("jsonwebtoken");

const JWT_SECRET = "jwt_secret";

const authMiddleware = async (req) => {
    const token = req.headers.authorization;
    if (!token) {
        throw new Error("Authorization header missing!");
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(decoded);
        return { userId: decoded.userId }; // Return user context (only userId here)
    } catch (error) {
        throw new Error("Invalid or expired token!");
    }
};

module.exports = authMiddleware;
