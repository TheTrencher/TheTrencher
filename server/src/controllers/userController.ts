import { Request, Response } from 'express';

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

// In-memory store for user agents
const userAgents: { [key: string]: UserAgent } = {};

// Create a new user agent
export const createUserAgent = (req: Request, res: Response): void => {
  const { username } = req.body;
  const id = Date.now().toString(); // Using timestamp as a simple unique ID
  const newAgent: UserAgent = {
    id,
    username: username || 'anonymous',
    riskProfile: { threshold: 50 }, // default risk threshold
    status: 'idle',
    trades: [],
  };
  userAgents[id] = newAgent;
  console.log(userAgents);
  res.status(201).json({ message: 'User agent created', userAgent: newAgent });
};

// Get the current status of a user agent
export const getUserAgentStatus = (req: Request, res: Response): void => {
  const { id } = req.params;
  const agent = userAgents[id];
  if (!agent) {
    res.status(404).json({ error: 'User agent not found' });
    return;
  }
  res.json(agent);
};

// Update the risk profile for a user agent
export const updateRiskProfile = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { riskProfile } = req.body;
  const agent = userAgents[id];
  if (!agent) {
    res.status(404).json({ error: 'User agent not found' });
    return;
  }
  agent.riskProfile = riskProfile;
  res.json({ message: 'Risk profile updated', userAgent: agent });
};

// Export the in-memory user store (to be used by other modules)
export const getUserAgentsStore = (): { [key: string]: UserAgent } => userAgents;