import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';

const router = Router();

router.get('/users', adminController.listUsers);
router.get('/agents', adminController.listAllAgents);
router.get('/system/health', adminController.systemHealth);

export default router;
