import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1),
  provider: z.enum(['local', 'openrouter']).default('local'),
  model: z.string().optional(),
  systemPrompt: z.string().optional(),
  conversation: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).default([]),
  temperature: z.number().min(0).max(2).default(0.7)
});

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = chatSchema.parse(req.body);
      const response = await this.chatService.processMessage(validated);
      res.json(response);
    } catch (error) {
      res.status(400).json({ error: 'Invalid request', details: error });
    }
  };

  streamMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = chatSchema.parse(req.body);
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      await this.chatService.streamMessage(validated, (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      });
      
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      res.status(400).json({ error: 'Stream error', details: error });
    }
  };

  getAvailableModels = async (req: Request, res: Response): Promise<void> => {
    try {
      const models = await this.chatService.getModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  };
}
