const express = require('express')
const router = express.Router()
let user = require('../models/user')
user = user.user

router.get('/login', (req, res, next) => {
    res.render('pages/login')
});

router.get('/register', (req, res, next) => {
    res.render('pages/register', {
        usernameExist: false,
        emailExist: false
    })
});


router.post('/register', (req, res) =>{
    let username = req.body.username
    let email = req.body.email
    let pwd = req.body.password

    // res.cookie('user-token', 'testtest');
    // res.redirect(302, '/');

    //check if username exist
    //check if email exist
    /*
    * if user is valid
    * 1 - save user
    * 2 - set response cookie
    * 3 - load index
    * */
});
module.exports = router