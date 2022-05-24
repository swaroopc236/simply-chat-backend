const router = require('express').Router();
const userController = require('./controllers');
const { requireAuth } = require('./middlewares/authMiddleware');

router.get('/', userController.getUsers);
router.post('/signin', userController.signInUser);
router.post('/signup', userController.signUpUser);
router.post('/email', userController.getUserByEmailId);
router.patch('/displayname', userController.updateDisplayname);

module.exports = router;
