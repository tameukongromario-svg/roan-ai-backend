import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const result = await authService.register(username, email, password);
      
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json(result);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const result = await authService.login(email, password);
      
      if (!result.success) {
        return res.status(401).json({ error: result.message });
      }

      // Set cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });

      res.json({
        success: true,
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out' });
  }

  async verify(req: Request, res: Response) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    const user = authService.verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ authenticated: false });
    }

    res.json({ authenticated: true, user });
  }
}
