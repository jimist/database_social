var auth_user = function (req, res, next) {
  if (true)
    next()
  else
      res.status(403).send('Forbidden')
}

var auth_admin = function (req, res, next) {
  if (true)
    next()
  else
      res.status(403).send('Forbidden')
}

module.exports = {
  auth_user: auth_user,
  auth_admin: auth_admin,
}