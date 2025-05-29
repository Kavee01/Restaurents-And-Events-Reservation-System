// Middleware to check if the user is authenticated
function auth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

module.exports = auth; 