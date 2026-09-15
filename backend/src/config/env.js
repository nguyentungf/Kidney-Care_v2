import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  SQLITE_PATH: process.env.SQLITE_PATH || path.resolve(__dirname, '../../../database/renalcare.sqlite'),
  ALERT_POTASSIUM_CRITICAL: parseFloat(process.env.ALERT_POTASSIUM_CRITICAL || '6.0'),
  ALERT_POTASSIUM_WARNING: parseFloat(process.env.ALERT_POTASSIUM_WARNING || '5.5'),
  ALERT_EGFR_CRITICAL: parseFloat(process.env.ALERT_EGFR_CRITICAL || '15.0'),
  ALERT_CREATININE_HIGH: parseFloat(process.env.ALERT_CREATININE_HIGH || '5.0'),
};

export default config;

