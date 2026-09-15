import { Router } from 'express';
import config from '../config/env.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'RenalCare Clinical Management System API',
    env: config.NODE_ENV,
  });
});

export default router;

