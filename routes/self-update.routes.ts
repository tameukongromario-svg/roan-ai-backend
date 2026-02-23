import { Router } from 'express';
import { SelfUpdateController } from '../controllers/self-update.controller';

const router = Router();
const selfUpdateController = new SelfUpdateController();

// Self-update endpoints (protected)
router.post('/read', selfUpdateController.readFile);
router.post('/write', selfUpdateController.writeFile);
router.post('/list', selfUpdateController.listFiles);
router.post('/restart', selfUpdateController.restart);

export default router;
