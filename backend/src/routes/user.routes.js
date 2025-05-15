const express = require('express');
const userController = require('../controllers/user.controller');
const authenticateJWT = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticateJWT, userController.getAllUsers);
router.get('/me', authenticateJWT, userController.getUserByToken);
router.get('/:id', authenticateJWT, userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', authenticateJWT, userController.updateUser);
router.delete('/:id', authenticateJWT, userController.deleteUser);

module.exports = router;