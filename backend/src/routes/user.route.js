const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/search', verifyToken, isAdmin, userController.search);
router.get('/:id', verifyToken, userController.getById);
router.put('/:id', verifyToken, userController.update);
router.get('/', verifyToken, isAdmin, userController.getAll);
router.delete('/:id', verifyToken, isAdmin, userController.delete);

module.exports = router;