var auth_user = function (req, res, next) {
    let userToken = req.cookies['user-token']
    let checkTokenQuery = `SELECT * FROM users where token= '${userToken}'`;
    db.query(checkTokenQuery, (err, result) => {

        if(result.length>0){
            next()
        }else{
            res.redirect('/account/login?type=failed');
        }
    });
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