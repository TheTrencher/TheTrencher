import { Request, Response } from 'express';
import { User, IUserDocument } from '../models/User';
import { AuthRequest } from '../middleware/auth';

interface RiskProfile {
  threshold: number;
}

interface Trade {
  tradeId: string;
  executedPrice: number;
  timestamp: Date;
  action: 'buy' | 'sell';
}

export interface UserAgent {
  id: string;
  username: string;
  riskProfile: RiskProfile;
  status: string;
  trades: Trade[];
}

// Create a new user agent
export const createUserAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;
    
    const newAgent = await User.create({
      username: username || 'anonymous',
      riskProfile: { threshold: 50 },
      status: 'idle',
      trades: []
    });

    res.status(201).json({ message: 'User agent created', userAgent: newAgent });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user agent' });
  }
};

// Get the current status of a user agent
export const getUserAgentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const agent = await User.findById(req.user._id);
    console.log('Finding agent with ID:', req.user._id);
    
    if (!agent) {
      console.log('Agent not found for ID:', req.user._id);
      res.status(404).json({ error: 'User agent not found' });
      return;
    }
    
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Error fetching user agent' });
  }
};

// Update the risk profile for a user agent
export const updateRiskProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { riskProfile } = req.body;
    
    const agent = await User.findByIdAndUpdate(
      id,
      { riskProfile },
      { new: true }
    );
    
    if (!agent) {
      res.status(404).json({ error: 'User agent not found' });
      return;
    }
    
    res.json({ message: 'Risk profile updated', userAgent: agent });
  } catch (error) {
    res.status(500).json({ error: 'Error updating risk profile' });
  }
};

// Export the user store getter (for compatibility with other modules)
export const getUserAgentsStore = async () => {
  const users = await User.find().lean();
  return users.reduce((acc, user) => {
    acc[user._id.toString()] = user as IUserDocument;
    return acc;
  }, {} as { [key: string]: IUserDocument });
};

// Register new user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = new User({
      username,
      password,
      riskProfile: { threshold: 50 },
      status: 'idle',
      trades: []
    });

    await user.save();
    const token = await user.generateAuthToken();
    
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Error registering user' });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username });

    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      res.status(401).json({ error: 'Invalid login credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid login credentials' });
      return;
    }

    const token = await user.generateAuthToken();
    console.log('Generated token:', token);
    
    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Error logging in' });
  }
};

// Logout user
export const logoutUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new Error();
    }

    user.tokens = user.tokens.filter(token => token.token !== req.header('Authorization')?.replace('Bearer ', ''));
    await user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error logging out' });
  }
};