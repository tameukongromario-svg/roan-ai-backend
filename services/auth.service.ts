import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'roan-ai-super-secret-key-change-this';
const usersFilePath = path.join(__dirname, '../data/users.json');

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'developer';
  createdAt: string;
}

export class AuthService {
  private readUsers(): { users: User[] } {
    try {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return { users: [] };
    }
  }

  private writeUsers(users: { users: User[] }): void {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  }

  async register(username: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'password'> }> {
    const data = this.readUsers();
    
    // Check if user exists
    if (data.users.find(u => u.email === email)) {
      return { success: false, message: 'User already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      role: 'user', // Default role is user
      createdAt: new Date().toISOString()
    };

    data.users.push(newUser);
    this.writeUsers(data);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, message: 'User created successfully', user: userWithoutPassword };
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: Omit<User, 'password'> }> {
    const data = this.readUsers();
    const user = data.users.find(u => u.email === email);

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, message: 'Login successful', token, user: userWithoutPassword };
  }

  verifyToken(token: string): { id: string; email: string; role: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return null;
    }
  }
}
