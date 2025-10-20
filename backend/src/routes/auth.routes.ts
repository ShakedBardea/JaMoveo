import { Router } from 'express';
import { loginController, userRegisterController, adminRegisterController } from '../controllers/auth.controller';

const router = Router();

// User registration
router.post('/register', userRegisterController);

// Admin registration
router.post('/admin/register', adminRegisterController);

// Login
router.post('/login', loginController);

router.get('/test', (req, res) => {
    res.send('Auth routes are working');
});


export default router;
