import db from '../config/database.js';
import config from '../config/env.js';

/**
 * Alert Engine lâm sàng tự động phát hiện nguy cơ
 */
export function checkLabAlerts(patientId, labData) {
  const patient = db.prepare('SELECT full_name FROM patients WHERE id = ?').get(patientId);
  if (!patient) return [];

  const createdAlerts = [];
  const now = new Date().toISOString();

  const insertAlert = db.prepare(`
    INSERT INTO alerts (patient_id, severity, title, detail, created_at, read)
    VALUES (?, ?, ?, ?, ?, 0)
  `);

  // 1. Kiểm tra Kali máu (Potassium K+)
  if (labData.potassium != null) {
    if (labData.potassium >= config.ALERT_POTASSIUM_CRITICAL) {
      insertAlert.run(
        patientId,
        'high',
        'Kali máu tăng rất cao (Nguy kịch)',
        `Kali máu đo được ${labData.potassium} mmol/L (ngưỡng an toàn < ${config.ALERT_POTASSIUM_CRITICAL}). Cần can thiệp hạ Kali khẩn cấp!`,
        now
      );
      createdAlerts.push({ severity: 'high', title: 'Kali máu tăng rất cao' });
    } else if (labData.potassium >= config.ALERT_POTASSIUM_WARNING) {
      insertAlert.run(
        patientId,
        'medium',
        'Kali máu ở mức cảnh báo',
        `Kali máu ${labData.potassium} mmol/L tiệm cận ngưỡng nguy hiểm. Cần theo dõi sát trước ca lọc máu.`,
        now
      );
      createdAlerts.push({ severity: 'medium', title: 'Kali máu ở mức cảnh báo' });
    }
  }

  // 2. Kiểm tra độ lọc cầu thận (eGFR)
  if (labData.egfr != null && labData.egfr < config.ALERT_EGFR_CRITICAL) {
    insertAlert.run(
      patientId,
      'high',
      'eGFR suy giảm nghiêm trọng',
      `Độ lọc cầu thận eGFR = ${labData.egfr} mL/min/1.73m² (Giai đoạn 5). Cần duy trì lọc máu chu kỳ nghiêm ngặt.`,
      now
    );
    createdAlerts.push({ severity: 'high', title: 'eGFR suy giảm nghiêm trọng' });
  }

  return createdAlerts;
}

export default checkLabAlerts;

