const express = require('express')
const router = express.Router()

let auth = require('../middlewares/auth');
auth = auth.auth_user

router.use('/account', require('./account'))

router.get('/', auth, (req, res, next) => {
  res.render('index', {title: 'arash'})
});

module.exports = router