import { Router } from 'express';
import { spawnerService } from '../services/spawner.service';
import { messageProxyService } from '../services/message-proxy.service';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.post('/:id/start', asyncHandler(async (req, res) => {
  const agent = await spawnerService.startAgent(String(req.params.id));
  res.json({ status: 'success', data: { agent } });
}));

router.post('/:id/stop', asyncHandler(async (req, res) => {
  await spawnerService.stopAgent(String(req.params.id));
  res.json({ status: 'success', message: 'Agent stopped' });
}));

router.post('/:id/chat', asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ status: 'error', message: 'Message is required' });
  
  const response = await messageProxyService.sendMessage(String(req.params.id), message);
  res.json({ status: 'success', data: { response } });
}));

export default router;
