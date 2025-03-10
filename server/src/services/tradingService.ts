import { User, IUserDocument } from '../models/User';
import { Market } from '../models/Market';

interface TradeResult {
  tradeId: string;
  symbol: string;
  executedPrice: number;
  timestamp: Date;
  action: 'buy' | 'sell';
  quantity: number;
  total: number;
}

class TradingService {
  private calculateTradeSignal(price: number, lastPrice: number, riskThreshold: number): 'buy' | 'sell' | null {
    try {
      if (!price || !lastPrice || !riskThreshold) {
        throw new Error('Invalid parameters for trade signal calculation');
      }

      const priceChange = ((price - lastPrice) / lastPrice) * 100;
      const absChange = Math.abs(priceChange);

      console.log({
        currentPrice: price,
        previousPrice: lastPrice,
        priceChange: priceChange.toFixed(2) + '%',
        threshold: riskThreshold + '%',
        absChange: absChange.toFixed(2) + '%'
      });

      if (absChange > riskThreshold) {
        const signal = priceChange > 0 ? 'sell' : 'buy';
        console.log(`Signal triggered: ${signal} for ${absChange.toFixed(2)}% change`);
        return signal;
      }
      return null;
    } catch (error) {
      console.error('Error in calculateTradeSignal:', error);
      return null;
    }
  }

  private calculateQuantity(price: number, riskThreshold: number): number {
    try {
      if (!price || price <= 0) {
        throw new Error(`Invalid price for quantity calculation: ${price}`);
      }
      const baseQuantity = 100; // $100 worth
      const quantity = +(baseQuantity / price).toFixed(8);
      console.log(`Calculated quantity: ${quantity} at price ${price}`);
      return quantity;
    } catch (error) {
      console.error('Error in calculateQuantity:', error);
      return 0;
    }
  }

  public async checkAndExecuteTrades(userId: string): Promise<TradeResult[]> {
    try {
      // Validate user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      console.log(`Processing trades for user: ${user.username} (Risk: ${user.riskProfile.threshold}%)`);

      // Get markets
      const markets = await Market.find();
      if (!markets.length) {
        console.log('No markets found, initializing markets...');
        throw new Error('No markets available for trading');
      }
      console.log(`Found ${markets.length} markets to analyze`);

      const results: TradeResult[] = [];

      // Process each market
      for (const market of markets) {
        try {
          console.log(`\nAnalyzing ${market.symbol} at ${market.price}`);

          // Get previous market data
          const lastMarket = await Market.findOne({ 
            symbol: market.symbol,
            timestamp: { $lt: market.timestamp }
          }).sort({ timestamp: -1 });

          if (!lastMarket) {
            console.log(`No previous data for ${market.symbol}, skipping...`);
            continue;
          }

          // Calculate signal
          const signal = this.calculateTradeSignal(
            market.price,
            lastMarket.price,
            user.riskProfile.threshold
          );

          if (signal) {
            const quantity = this.calculateQuantity(market.price, user.riskProfile.threshold);
            if (quantity <= 0) {
              console.log(`Invalid quantity calculated for ${market.symbol}, skipping...`);
              continue;
            }

            const trade: TradeResult = {
              tradeId: `${Date.now()}-${market.symbol}`,
              symbol: market.symbol,
              executedPrice: market.price,
              timestamp: new Date(),
              action: signal,
              quantity,
              total: +(market.price * quantity).toFixed(2)
            };

            // Save trade
            const updated = await User.findByIdAndUpdate(
              userId,
              {
                $push: { trades: trade },
                status: 'trade executed'
              },
              { new: true }
            );

            if (!updated) {
              throw new Error(`Failed to save trade for ${market.symbol}`);
            }

            console.log(`Trade executed: ${trade.action} ${trade.quantity} ${trade.symbol} at ${trade.executedPrice}`);
            results.push(trade);
          }
        } catch (marketError) {
          console.error(`Error processing market ${market.symbol}:`, marketError);
          continue; // Skip this market but continue with others
        }
      }

      console.log(`Completed trade check. Executed ${results.length} trades`);
      return results;

    } catch (error) {
      console.error('Fatal error in checkAndExecuteTrades:', error);
      throw new Error(`Trading service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const tradingService = new TradingService(); 