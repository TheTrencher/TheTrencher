import { Router } from 'express';
import { getMarkets, triggerMarketUpdate } from '../controllers/marketController';
import { auth } from '../middleware/auth';

const router: Router = Router();

router.get('/', auth, getMarkets);
router.post('/update', auth, triggerMarketUpdate);

export default router; 