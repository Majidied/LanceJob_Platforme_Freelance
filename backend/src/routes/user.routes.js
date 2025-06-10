const express = require('express');
const userController = require('../controllers/user.controller');
const { verificationUser} = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', verificationUser, userController.getAllUsers);
router.get('/me', userController.getUserByToken);
router.get('/:id', verificationUser, userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', verificationUser, userController.updateUser);
router.delete('/:id', verificationUser, userController.deleteUser);

module.exports = router;