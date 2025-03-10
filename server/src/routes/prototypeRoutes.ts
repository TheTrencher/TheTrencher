import { Router } from 'express';
import { triggerTradeSimulation, getEvents } from '../controllers/prototypeController';
import { auth } from '../middleware/auth';

const router: Router = Router();

// Endpoint to trigger the simulated trade flow
router.post('/trigger', auth, triggerTradeSimulation);

// Endpoint to retrieve logged simulation events
router.get('/events', auth, getEvents);

export default router;