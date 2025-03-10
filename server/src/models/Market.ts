import mongoose, { Document } from 'mongoose';

export interface IMarketDocument extends Document {
  symbol: string;
  price: number;
  timestamp: Date;
  volume: number;
  high24h: number;
  low24h: number;
  change24h: number;
}

export const marketSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  volume: {
    type: Number,
    default: 0
  },
  high24h: {
    type: Number,
    required: true
  },
  low24h: {
    type: Number,
    required: true
  },
  change24h: {
    type: Number,
    required: true
  }
});

export const Market = mongoose.model<IMarketDocument>('Market', marketSchema);

export default Market; 