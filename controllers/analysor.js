const express = require('express')
const router = express.Router()

let auth = require('../middlewares/auth');
auth = auth.auth_analysor;

module.exports = router;