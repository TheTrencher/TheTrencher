import { Router } from 'express';
import { 
  createUserAgent, 
  getUserAgentStatus, 
  updateRiskProfile,
  registerUser,
  loginUser,
  logoutUser
} from '../controllers/userController';
import { auth } from '../middleware/auth';

const router: Router = Router();

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', auth, logoutUser);

// Protected routes
router.post('/', auth, createUserAgent);
router.get('/me', auth, getUserAgentStatus);
router.put('/:id/risk', auth, updateRiskProfile);

export default router;