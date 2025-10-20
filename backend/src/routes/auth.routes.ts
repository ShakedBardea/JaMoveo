import { Router } from 'express';
import { loginController, userRegisterController, adminRegisterController } from '../controllers/auth.controller';

const router = Router();


router.post('/register', userRegisterController);
router.post('/admin/register', adminRegisterController);
router.post('/login', loginController);



export default router;
