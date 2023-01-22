const express = require('express');
const router = express.Router();
const stuffCtrl = require('../controllers/stuff');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/', auth, stuffCtrl.getAllSauces);
router.get('/:id', auth, stuffCtrl.getSauceByid); 
router.post('/', auth, multer,  stuffCtrl.createSauce);
router.put('/:id', auth, multer, stuffCtrl.modifySauce);
router.delete('/:id', auth, multer, stuffCtrl.deleteSauce);
//router.post('/:id/like', auth, stuffCtrl.likeSauce);

module.exports = router;