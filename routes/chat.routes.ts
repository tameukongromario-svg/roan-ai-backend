import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();
const chatController = new ChatController();

router.post('/', chatController.sendMessage);
router.get('/models', chatController.getAvailableModels);
router.post('/stream', chatController.streamMessage);

export default router;
