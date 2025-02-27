import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDB } from './config/database';

// Import route modules (they are placeholders for now)
import userRoutes from './routes/userRoutes';
import prototypeRoutes from './routes/prototypeRoutes';

const app: Application = express();
const PORT: number | string = process.env.PORT || 5000;

// Enable CORS middleware
app.use(cors());

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Mount API endpoints
app.use('/api/users', userRoutes);
app.use('/api/prototype', prototypeRoutes);

// Basic health-check endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('TheTrencher backend is up and running!');
});

// Custom error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

// Connect to MongoDB before starting the server
connectDB().then(() => {
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`TheTrencher backend is listening on port ${PORT}`);
    });
  }
});

// Export the app so that Vercel can handle it as a serverless function
export default app;