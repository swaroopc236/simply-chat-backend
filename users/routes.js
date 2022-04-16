const router = require('express').Router();
const userController = require('./controllers');

router.get('/', userController.getUsers);
router.post('/signin', userController.signInUser);
router.post('/email', userController.getUserByEmailId);

module.exports = router;