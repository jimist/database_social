const express = require('express')
const router = express.Router()
let auth = require('../middlewares/auth');
auth = auth.auth_user
// router.use('/comments', require('./comments'))
// router.use('/users', require('./users'))

router.get('/', auth, (req, res, next) => {
  res.render('index', {title: 'arash'})
});

module.exports = router
