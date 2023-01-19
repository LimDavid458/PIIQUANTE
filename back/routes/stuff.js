const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Sauce = require('../models/Sauces');

router.get('api/all', auth, (req,res,next) => {
    console.log('ok');
})


module.exports = router;