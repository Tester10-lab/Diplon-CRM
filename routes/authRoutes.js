const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { loginSchema, registerUserSchema } = require('../schemas/authSchemas');

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', requireRole(['SUPER_ADMIN', 'ADMIN']), validate(registerUserSchema), authController.register);
router.get('/me', requireAuth, authController.me);

module.exports = router;
