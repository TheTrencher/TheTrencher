import { Router } from 'express';
import { triggerTradeSimulation, getEvents } from '../controllers/prototypeController';

const router: Router = Router();

// Endpoint to trigger the simulated trade flow
router.post('/trigger', triggerTradeSimulation);

// Endpoint to retrieve logged simulation events
router.get('/events', getEvents);

export default router;