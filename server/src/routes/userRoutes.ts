import { Router } from 'express';
import { createUserAgent, getUserAgentStatus, updateRiskProfile } from '../controllers/userController';

const router: Router = Router();

// Endpoint to create a new user agent
router.post('/', createUserAgent);

// Endpoint to get the status of a user agent by ID
router.get('/:id', getUserAgentStatus);

router.put('/:id/risk', updateRiskProfile);

export default router;