const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/public-profile/:id', userController.getPublicProfile);

// Rutas privadas (protegidas)
router.get('/profile', verifyToken, userController.getProfile);
router.put('/update', verifyToken, userController.update);
router.delete('/delete', verifyToken, userController.delete);
router.get('/dashboard', verifyToken, userController.getDashboard);
router.post('/change-password', verifyToken, userController.changePassword);

module.exports = router;