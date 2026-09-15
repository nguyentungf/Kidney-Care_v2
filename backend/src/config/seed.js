import db from './database.js';

console.log('[SEED] Seeding RenalCare database...');

const patientCount = db
  .prepare('SELECT COUNT(*) AS count FROM patients')
  .get();

if (patientCount.count === 0) {
  const insertPatient = db.prepare(`
    INSERT INTO patients
      (code, full_name, date_of_birth, gender, phone, stage, status, egfr, egfr_trend, next_dialysis, doctor, updated_at, address, diagnosis, allergies, medications)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedPatients = [
    ["RC-1048", "Nguyễn Minh Anh", "1968-04-12", "Nữ", "090 312 4488", "Giai đoạn 5", "critical", 11, "down", "2026-09-15T08:00:00", "BS. Trần Quốc Khánh", "2026-09-14T16:20:00", "12 Lê Lợi, Q.1", "Bệnh thận mạn giai đoạn 5, tăng huyết áp", "Không ghi nhận", "Amlodipine 5mg, Erythropoietin"],
    ["RC-1039", "Lê Hoàng Nam", "1975-11-03", "Nam", "091 204 7712", "Giai đoạn 4", "watch", 22, "down", "2026-09-15T13:30:00", "BS. Nguyễn Thu Hà", "2026-09-15T07:40:00", "45 Nguyễn Trãi, Q.5", "Bệnh thận mạn do đái tháo đường", "Penicillin", "Losartan 50mg, Furosemide 40mg"],
    ["RC-1017", "Phạm Thu Hương", "1982-02-27", "Nữ", "098 665 1020", "Giai đoạn 3b", "stable", 38, "stable", null, "BS. Trần Quốc Khánh", "2026-09-13T11:15:00", "8 Võ Văn Tần, Q.3", "Bệnh thận mạn do lupus", "Không ghi nhận", "Hydroxychloroquine 200mg"],
    ["RC-0994", "Võ Thành Công", "1959-08-19", "Nam", "093 776 2201", "Giai đoạn 5", "critical", 9, "down", "2026-09-15T16:00:00", "BS. Nguyễn Thu Hà", "2026-09-14T18:05:00", "102 Điện Biên Phủ, Q. Bình Thạnh", "Bệnh thận mạn giai đoạn cuối", "Sulfa", "Insulin glargine, Calcium carbonate"],
    ["RC-0972", "Đỗ Quốc Bảo", "1948-06-30", "Nam", "090 118 6224", "Giai đoạn 4", "stable", 25, "up", "2026-09-16T08:00:00", "BS. Trần Quốc Khánh", "2026-09-12T09:30:00", "21 Phan Đình Phùng, Q. Phú Nhuận", "Bệnh thận mạn do tăng huyết áp", "Không ghi nhận", "Ramipril 5mg"],
  ];

  for (const patient of seedPatients) {
    insertPatient.run(...patient);
  }

  const insertLab = db.prepare(`
    INSERT INTO labs (patient_id, recorded_at, creatinine, egfr, urea, potassium, hemoglobin)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  [
    [1, "2026-09-14", 6.2, 11, 28.4, 5.8, 9.6],
    [1, "2026-08-28", 5.7, 13, 24.1, 5.1, 10.2],
    [2, "2026-09-15", 3.9, 22, 18.8, 4.9, 11.1],
    [3, "2026-09-13", 2.1, 38, 12.7, 4.4, 12.4],
    [4, "2026-09-14", 7.1, 9, 31.2, 6.1, 8.8],
    [5, "2026-09-12", 3.5, 25, 17.1, 4.6, 11.7],
  ].forEach((lab) => insertLab.run(...lab));

  const insertDialysis = db.prepare(`
    INSERT INTO dialysis_sessions (patient_id, scheduled_at, duration, station, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  [
    [1, "2026-09-15T08:00:00", 240, "Ghế 04", "scheduled"],
    [2, "2026-09-15T13:30:00", 240, "Ghế 07", "scheduled"],
    [4, "2026-09-15T16:00:00", 240, "Ghế 02", "scheduled"],
    [5, "2026-09-16T08:00:00", 240, "Ghế 05", "scheduled"],
  ].forEach((session) => insertDialysis.run(...session));

  const insertAlert = db.prepare(`
    INSERT INTO alerts (patient_id, severity, title, detail, created_at, read)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  [
    [1, "high", "Kali máu tăng cao", "Kali 5.8 mmol/L — cần đánh giá trước ca lọc máu", "2026-09-15T07:15:00", 0],
    [4, "high", "eGFR giảm nhanh", "eGFR giảm 4 ml/phút trong 2 tuần gần đây", "2026-09-14T18:02:00", 0],
    [2, "medium", "Thiếu dữ liệu cân nặng", "Chưa cập nhật cân nặng khô sau lần tái khám gần nhất", "2026-09-14T14:40:00", 0],
    [3, "low", "Đến lịch tái khám", "Bệnh nhân cần tái khám trong 7 ngày tới", "2026-09-13T09:20:00", 1],
  ].forEach((alert) => insertAlert.run(...alert));

  console.log('[SEED] Seed data populated successfully!');
} else {
  console.log('[SEED] Database already has data. Skipping seed.');
}

