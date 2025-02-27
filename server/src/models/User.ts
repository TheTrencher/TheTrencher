import mongoose, { Document } from 'mongoose';

const tradeSchema = new mongoose.Schema({
  tradeId: String,
  executedPrice: Number,
  timestamp: Date,
  action: {
    type: String,
    enum: ['buy', 'sell']
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  riskProfile: {
    threshold: {
      type: Number,
      default: 50
    }
  },
  status: {
    type: String,
    default: 'idle'
  },
  trades: [tradeSchema]
}, {
  timestamps: true
});

export interface IUserDocument extends Document {
  username: string;
  riskProfile: {
    threshold: number;
  };
  status: string;
  trades: Array<{
    tradeId: string;
    executedPrice: number;
    timestamp: Date;
    action: 'buy' | 'sell';
  }>;
}

export const User = mongoose.model<IUserDocument>('User', userSchema); 