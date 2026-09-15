import { Router } from 'express';
import renalRoutes from './renal.js';
import healthRoutes from './health.js';

const router = Router();

router.use('/healthz', healthRoutes);
router.use('/health', healthRoutes);
router.use('/', renalRoutes);

export default router;

