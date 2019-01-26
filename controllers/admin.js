const express = require('express')
const router = express.Router()

let auth = require('../middlewares/auth');
auth = auth.auth_admin;

router.get('/', auth, (req, res, next) => {
    res.send('tests')
});

module.exports = router;