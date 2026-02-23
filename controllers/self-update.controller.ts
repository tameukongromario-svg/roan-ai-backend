import { Request, Response } from 'express';
import { SelfUpdateService } from '../services/self-update.service';
import { AuthService } from '../services/auth.service';

const selfUpdateService = new SelfUpdateService();
const authService = new AuthService();

export class SelfUpdateController {
  async readFile(req: Request, res: Response) {
    try {
      // Verify authentication
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
      const user = authService.verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { filePath } = req.body;
      if (!filePath) {
        return res.status(400).json({ error: 'File path required' });
      }

      const result = await selfUpdateService.readFile(filePath);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, content: result.content });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async writeFile(req: Request, res: Response) {
    try {
      // Verify authentication and creator status
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
      const user = authService.verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user details to check if they're the creator
      const users = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '../data/users.json'), 'utf8'));
      const fullUser = users.users.find((u: any) => u.id === user.id);

      const { filePath, content } = req.body;
      if (!filePath || !content) {
        return res.status(400).json({ error: 'File path and content required' });
      }

      const result = await selfUpdateService.writeFile(filePath, content, fullUser?.username || '');
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, message: 'File updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async listFiles(req: Request, res: Response) {
    try {
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
      const user = authService.verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { directory } = req.body;
      const result = await selfUpdateService.listFiles(directory || '');
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, files: result.files });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async restart(req: Request, res: Response) {
    try {
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
      const user = authService.verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const users = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '../data/users.json'), 'utf8'));
      const fullUser = users.users.find((u: any) => u.id === user.id);

      if (fullUser?.username !== 'Tameukong Romario') {
        return res.status(403).json({ error: 'Only the creator can restart the server' });
      }

      const result = await selfUpdateService.restartServer();
      res.json({ success: true, message: 'Server restart initiated' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
