var auth_user = function (req, res, next) {
    let userToken = req.cookies['user-token']
    if(userToken=='arash'){
        next()
    }
    res.redirect('/account/login?type=failed')
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