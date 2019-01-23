const express = require('express')
const router = express.Router()
const passwordHash = require('password-hash');
// let user = require('../models/user')

router.get('/login', (req, res, next) => {
    res.render('pages/login')
});

router.post('/login', (req, res, next) => {
    let email = req.body.email;
    let pwd = req.body.password;

    let checkUserExistQuery = `SELECT * FROM users where (username = '${email}' OR email = '${email}')`;
    db.query(checkUserExistQuery, (err, result) => {
        if(result.length>0 && passwordHash.verify(pwd, result[0].password)){
            let now = new Date().getTime();
            let token = now+email+"APP_SECRET";
            token = passwordHash.generate(token)
            let updateQuery = `UPDATE users SET updated_at=${now}, token='${token}' where (username = '${email}' OR email = '${email}')`;
            db.query(updateQuery , (err, result) => {
                if(!err){
                    res.cookie('user-token', token);
                    res.redirect('/');
                }
            });
        }else{
            res.redirect('/account/login?exist=retry');
        }
    });
});

router.get('/logout', (req, res, next) => {
    res.cookie('user-token', '');
    res.redirect('/account/login?type=logout')
});

router.get('/register', (req, res, next) => {
    res.render('pages/register', {
        usernameExist: false,
        emailExist: false
    })
});

router.post('/register', (req, res) =>{
    let username = req.body.username;
    let email = req.body.email;
    let pwd = req.body.password;

    //check if username exist
    let checkUserExistQuery = `SELECT * FROM users where username = '${username}' OR email = '${email}'`;
    db.query(checkUserExistQuery, (err, result) => {
        console.log(result.length);
        if(result.length>0){
            res.redirect('/account/register?exist=true');
        }else{
            let now = (new Date()).getTime();
            console.log(now);
            pwd = passwordHash.generate(pwd);
            let token = now+username+"APP_SECRET";
            token = passwordHash.generate(token)
            let insertUserQuery = `INSERT INTO users(email, username, password, token, created_at, updated_at) 
            VALUES('${email}', '${username}', '${pwd}', '${token}', ${now}, ${now})`;
            console.log(insertUserQuery )

            db.query(insertUserQuery , (err, result) => {
                if(!err){
                    res.cookie('user-token', token);
                    res.redirect("/");
                }
            });
        }
    });

});

module.exports = router