import { Market, IMarketDocument } from '../models/Market';

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ARB/USDT'];
const UPDATE_INTERVAL = 60000; // 1 minute

class MarketService {
  private lastPrices: Map<string, number>;

  constructor() {
    this.lastPrices = new Map();
    // Initialize markets immediately
    this.initializeMarkets().catch(err => console.error('Failed to initialize markets:', err));
  }

  private async initializeMarkets() {
    console.log('Initializing markets...');
    for (const symbol of SYMBOLS) {
      const basePrice = this.getBasePrice(symbol);
      const existingMarket = await Market.findOne({ symbol });
      
      if (!existingMarket) {
        console.log(`Creating initial market data for ${symbol}`);
        await Market.create({
          symbol,
          price: basePrice,
          high24h: basePrice,
          low24h: basePrice,
          change24h: 0,
          volume: Math.random() * 1000000,
          timestamp: new Date()
        });
      }
      this.lastPrices.set(symbol, basePrice);
    }
    console.log('Markets initialized');
  }

  private getBasePrice(symbol: string): number {
    switch (symbol) {
      case 'BTC/USDT': return 50000;
      case 'ETH/USDT': return 3000;
      case 'SOL/USDT': return 100;
      case 'ARB/USDT': return 2;
      default: return 100;
    }
  }

  private simulatePrice(lastPrice: number, volatility: number = 0.02): number {
    const changePercent = (Math.random() - 0.5) * 2 * volatility;
    return lastPrice * (1 + changePercent);
  }

  private async createOrUpdateMarket(symbol: string, currentPrice: number): Promise<IMarketDocument> {
    const lastPrice = this.lastPrices.get(symbol) || currentPrice;
    const change24h = ((currentPrice - lastPrice) / lastPrice) * 100;

    const marketData = {
      price: currentPrice,
      high24h: Math.max(currentPrice, lastPrice),
      low24h: Math.min(currentPrice, lastPrice),
      change24h,
      volume: Math.random() * 1000000,
      timestamp: new Date()
    };

    const market = await Market.findOneAndUpdate(
      { symbol },
      marketData,
      { upsert: true, new: true }
    );

    return market;
  }

  public async updateMarkets(): Promise<IMarketDocument[]> {
    console.log('Updating market prices...');
    const updates = [];
    
    for (const symbol of SYMBOLS) {
      const lastPrice = this.lastPrices.get(symbol) || this.getBasePrice(symbol);
      const newPrice = this.simulatePrice(lastPrice);
      console.log(`${symbol}: ${lastPrice} -> ${newPrice}`);
      
      const market = await this.createOrUpdateMarket(symbol, newPrice);
      this.lastPrices.set(symbol, newPrice);
      updates.push(market);
    }

    console.log('Market updates completed');
    return updates;
  }

  public async getMarketData(symbol?: string): Promise<IMarketDocument | IMarketDocument[]> {
    if (symbol) {
      return await Market.findOne({ symbol }) || await this.createOrUpdateMarket(symbol, this.getBasePrice(symbol));
    }
    return await Market.find();
  }
}

// Create a single instance
export const marketService = new MarketService();

// Start the market update loop
setInterval(() => {
  marketService.updateMarkets()
    .catch(error => console.error('Error updating markets:', error));
}, UPDATE_INTERVAL); 