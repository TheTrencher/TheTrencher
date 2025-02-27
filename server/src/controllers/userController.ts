import { Request, Response } from 'express';
import { User, IUserDocument } from '../models/User';

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
export const getUserAgentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const agent = await User.findById(id);
    
    if (!agent) {
      res.status(404).json({ error: 'User agent not found' });
      return;
    }
    
    res.json(agent);
  } catch (error) {
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