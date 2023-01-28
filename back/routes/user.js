const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const emailValidator = require('../middleware/email-validation');

router.post('/signup', emailValidator,  userCtrl.signup);
router.post('/login', emailValidator, userCtrl.login);

module.exports = router;