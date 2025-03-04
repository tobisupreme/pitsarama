module.exports = (req, res, next) => {
  if (req.user === null || req.user.user_type !== 'admin') {
    return res.status(401).json({
      error: 'Unauthorised',
    })
  }
  next()
}
