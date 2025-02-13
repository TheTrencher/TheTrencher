import { Request, Response } from 'express';
import { getUserAgentsStore } from './userController';

interface Trade {
  tradeId: string;
  executedPrice: number;
  timestamp: Date;
  action: 'buy' | 'sell';
}

interface TradeResult {
  userAgentId: string;
  trade: Trade;
}

interface EventLog {
  eventId: string;
  source: string;
  timestamp: Date;
  eventType: string;
  payload: any;
}

let eventLogs: EventLog[] = [];

// Simulate price data from a feeder engine
const simulatePriceData = (): number => {
  // Generate a random price around a base of 2000 +/- 100
  return 2000 + (Math.random() - 0.5) * 200;
};

// Check if the trading signal is triggered based on user risk threshold
const checkTradingSignal = (price: number, riskThreshold: number): boolean => {
  // Trigger if the absolute deviation from 2000 exceeds the threshold
  return Math.abs(price - 2000) > riskThreshold;
};

// Simulate executing a trade for a user agent
const simulateTradeExecution = (agent: any, price: number): Trade => {
  const trade: Trade = {
    tradeId: Date.now().toString(),
    executedPrice: price,
    timestamp: new Date(),
    action: price > 2000 ? 'sell' : 'buy',
  };

  // Update user agent's trade history and status
  agent.trades.push(trade);
  agent.status = 'trade executed';
  return trade;
};

// Controller function to trigger the trade simulation
export const triggerTradeSimulation = (req: Request, res: Response): void => {
  const userAgents = getUserAgentsStore();
  const price = simulatePriceData();
  const tradeResults: TradeResult[] = [];

  // Log the price update event
  eventLogs.push({
    eventId: Date.now().toString(),
    source: 'Simulated Feeder',
    timestamp: new Date(),
    eventType: 'price_update',
    payload: { price },
  });

  // Iterate over user agents and trigger trades if conditions are met
  for (const id in userAgents) {
    const agent = userAgents[id];
    if (checkTradingSignal(price, agent.riskProfile.threshold)) {
      const trade = simulateTradeExecution(agent, price);
      tradeResults.push({ userAgentId: id, trade });

      // Log the trade execution event
      eventLogs.push({
        eventId: Date.now().toString(),
        source: 'Trigger Engine',
        timestamp: new Date(),
        eventType: 'trade_executed',
        payload: { userAgentId: id, trade },
      });
    }
  }

  res.json({ message: 'Trade simulation completed', price, tradeResults });
};

// Controller to retrieve logged events
export const getEvents = (req: Request, res: Response): void => {
  res.json(eventLogs);
};