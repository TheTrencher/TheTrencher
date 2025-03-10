import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { tradingService } from '../services/tradingService';
import { marketService } from '../services/marketService';
import { User } from '../models/User';

interface EventLog {
  eventId: string;
  source: string;
  timestamp: Date;
  eventType: string;
  payload: any;
}

let eventLogs: EventLog[] = [];

// Update the controller to use real market data and trading service
export const triggerTradeSimulation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get all active users
    const users = await User.find({});
    const tradeResults = [];

    // Update markets first
    const markets = await marketService.updateMarkets();
    const currentPrice = markets[0]?.price || 2000; // Fallback price

    // Execute trades for each user
    for (const user of users) {
      const trades = await tradingService.checkAndExecuteTrades(user._id.toString());
      
      if (trades.length > 0) {
        tradeResults.push({
          userAgentId: user._id,
          trade: {
            tradeId: trades[0].tradeId,
            executedPrice: trades[0].executedPrice,
            timestamp: trades[0].timestamp,
            action: trades[0].action
          }
        });
      }
    }

    // Log events
    eventLogs.push({
      eventId: Date.now().toString(),
      source: 'Market Service',
      timestamp: new Date(),
      eventType: 'price_update',
      payload: { price: currentPrice },
    });

    tradeResults.forEach(result => {
      eventLogs.push({
        eventId: Date.now().toString(),
        source: 'Trading Service',
        timestamp: new Date(),
        eventType: 'trade_executed',
        payload: result,
      });
    });

    res.json({
      message: 'Trade simulation completed',
      price: currentPrice,
      tradeResults
    });

  } catch (error) {
    console.error('Trade simulation error:', error);
    res.status(500).json({ error: 'Error during trade simulation' });
  }
};

// Controller to retrieve logged events
export const getEvents = (req: Request, res: Response): void => {
  res.json(eventLogs);
};