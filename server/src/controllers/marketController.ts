import { Request, Response } from 'express';
import { marketService } from '../services/marketService';

export const getMarkets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.query;
    const markets = await marketService.getMarketData(symbol as string);
    res.json(markets);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching market data' });
  }
};

export const triggerMarketUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = await marketService.updateMarkets();
    res.json({ message: 'Markets updated', updates });
  } catch (error) {
    res.status(500).json({ error: 'Error updating markets' });
  }
}; 