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

var auth_analysor = function (req, res, next) {
    let userToken = req.cookies['user-token']
    let checkTokenQuery = `SELECT * FROM users where token= '${userToken}'`;
    db.query(checkTokenQuery, (err, result) => {
        if(result.length>0 && (result[0].role=='analysor' || result[0].role=='admin')){
            next()
        }else{
            res.status(403).render('errors/403')
        }
    });
}

var auth_admin = function (req, res, next) {
    let userToken = req.cookies['user-token']
    let checkTokenQuery = `SELECT * FROM users where token= '${userToken}'`;
    db.query(checkTokenQuery, (err, result) => {
        if(result.length>0 && result[0].role=='admin'){
            next()
        }else{
            res.status(403).render('errors/403')
        }
    });
}

module.exports = {
  auth_user: auth_user,
  auth_admin: auth_admin,
  auth_analysor: auth_analysor,
}