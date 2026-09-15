import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from './config/env.js';
import './config/seed.js'; // Tự động nạp dữ liệu mẫu nếu CSDL mới tạo
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Phục vụ giao diện Frontend tĩnh (Single Host Mode)
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(config.PORT, () => {
  console.log(`\n🏥 RenalCare Patient Management System (Kidney_Project_v2)`);
  console.log(`   → Ứng dụng Web: http://localhost:${config.PORT}`);
  console.log(`   → REST API:     http://localhost:${config.PORT}/api/healthz`);
  console.log(`   → Database:     ${config.SQLITE_PATH}`);
  console.log(`   → Môi trường:   ${config.NODE_ENV}\n`);
});

export default app;
