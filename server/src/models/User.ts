import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const tradeSchema = new mongoose.Schema({
  tradeId: String,
  executedPrice: Number,
  timestamp: Date,
  action: {
    type: String,
    enum: ['buy', 'sell']
  }
});

export interface IUserDocument extends Document {
  username: string;
  password: string;
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
  tokens: { token: string }[];
  generateAuthToken(): Promise<string>;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
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
  trades: [tradeSchema],
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Generate JWT token
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET as string);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// Compare password
userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUserDocument>('User', userSchema); 