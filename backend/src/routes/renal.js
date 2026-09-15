import { Router } from 'express';
import db from '../config/database.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { checkLabAlerts } from '../services/alertEngine.js';

const router = Router();

const patientFromRow = (row) => ({
  id: Number(row.id),
  code: String(row.code),
  fullName: String(row.full_name),
  dateOfBirth: String(row.date_of_birth),
  gender: String(row.gender),
  phone: String(row.phone),
  stage: String(row.stage),
  status: row.status,
  egfr: Number(row.egfr),
  egfrTrend: row.egfr_trend || 'stable',
  nextDialysis: row.next_dialysis ? String(row.next_dialysis) : null,
  doctor: String(row.doctor),
  updatedAt: String(row.updated_at),
  address: row.address ? String(row.address) : '',
  diagnosis: row.diagnosis ? String(row.diagnosis) : '',
  allergies: row.allergies ? String(row.allergies) : '',
  medications: row.medications ? String(row.medications) : '',
});

const labFromRow = (row) => ({
  id: Number(row.id),
  patientId: Number(row.patient_id),
  recordedAt: String(row.recorded_at),
  creatinine: Number(row.creatinine),
  egfr: Number(row.egfr),
  urea: Number(row.urea),
  potassium: Number(row.potassium),
  hemoglobin: Number(row.hemoglobin),
});

// ── GET /api/dashboard ──────────────────────────────────────────
router.get('/dashboard', asyncHandler((_req, res) => {
  const totalPatients = Number(db.prepare('SELECT COUNT(*) AS count FROM patients').get().count);
  const criticalPatients = Number(db.prepare("SELECT COUNT(*) AS count FROM patients WHERE status = 'critical'").get().count);
  const dialysisToday = Number(
    db.prepare("SELECT COUNT(*) AS count FROM dialysis_sessions WHERE date(scheduled_at) = date('now', 'localtime') AND status = 'scheduled'").get().count
  );
  const unreadAlerts = Number(db.prepare('SELECT COUNT(*) AS count FROM alerts WHERE read = 0').get().count);

  const stageBreakdown = db
    .prepare('SELECT stage, COUNT(*) AS count FROM patients GROUP BY stage ORDER BY stage')
    .all()
    .map((row) => ({ stage: String(row.stage), count: Number(row.count) }));

  const recentActivity = db
    .prepare(`
      SELECT id, 'alert' AS type, title, detail, created_at AS timestamp
      FROM alerts
      ORDER BY datetime(created_at) DESC
      LIMIT 5
    `)
    .all()
    .map((row) => ({
      id: Number(row.id),
      type: String(row.type),
      title: String(row.title),
      detail: String(row.detail),
      timestamp: String(row.timestamp),
    }));

  res.json({
    totalPatients,
    criticalPatients,
    dialysisToday,
    unreadAlerts,
    stageBreakdown,
    recentActivity,
  });
}));

// ── GET /api/patients ───────────────────────────────────────────
router.get('/patients', asyncHandler((req, res) => {
  const search = req.query.search ? String(req.query.search).trim() : '';
  const status = req.query.status || 'all';

  const rows = db
    .prepare(`
      SELECT * FROM patients
      WHERE (? = '' OR full_name LIKE ? OR code LIKE ? OR phone LIKE ?)
        AND (? = 'all' OR status = ?)
      ORDER BY datetime(updated_at) DESC
    `)
    .all(search, `%${search}%`, `%${search}%`, `%${search}%`, status, status);

  res.json(rows.map(patientFromRow));
}));

// ── POST /api/patients ──────────────────────────────────────────
router.post('/patients', asyncHandler((req, res) => {
  const input = req.body;
  if (!input.fullName) return res.status(400).json({ error: 'Họ tên là bắt buộc' });

  const now = new Date().toISOString();
  const code = `RC-${Math.floor(1000 + Math.random() * 8999)}`;

  const result = db
    .prepare(`
      INSERT INTO patients
        (code, full_name, date_of_birth, gender, phone, stage, status, egfr, egfr_trend, next_dialysis, doctor, updated_at, address, diagnosis, allergies, medications)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'stable', NULL, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      code,
      input.fullName,
      input.dateOfBirth || '1970-01-01',
      input.gender || 'Nam',
      input.phone || '',
      input.stage || 'Giai đoạn 3',
      input.status || 'stable',
      input.egfr || 45,
      input.doctor || 'BS. Trần Quốc Khánh',
      now,
      input.address || '',
      input.diagnosis || '',
      input.allergies || '',
      input.medications || ''
    );

  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(Number(result.lastInsertRowid));
  res.status(201).json(patientFromRow(row));
}));

// ── GET /api/patients/:id ───────────────────────────────────────
router.get('/patients/:id', asyncHandler((req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });

  const labs = db
    .prepare('SELECT * FROM labs WHERE patient_id = ? ORDER BY date(recorded_at) DESC')
    .all(id)
    .map(labFromRow);

  res.json({
    ...patientFromRow(row),
    labs,
  });
}));

// ── PATCH /api/patients/:id ─────────────────────────────────────
router.patch('/patients/:id', asyncHandler((req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });

  const input = req.body;
  db.prepare(`
    UPDATE patients SET
      full_name = ?, phone = ?, stage = ?, status = ?, egfr = ?, doctor = ?,
      address = ?, diagnosis = ?, allergies = ?, medications = ?, updated_at = ?
    WHERE id = ?
  `).run(
    input.fullName !== undefined ? input.fullName : existing.full_name,
    input.phone !== undefined ? input.phone : existing.phone,
    input.stage !== undefined ? input.stage : existing.stage,
    input.status !== undefined ? input.status : existing.status,
    input.egfr !== undefined ? Number(input.egfr) : existing.egfr,
    input.doctor !== undefined ? input.doctor : existing.doctor,
    input.address !== undefined ? input.address : existing.address,
    input.diagnosis !== undefined ? input.diagnosis : existing.diagnosis,
    input.allergies !== undefined ? input.allergies : existing.allergies,
    input.medications !== undefined ? input.medications : existing.medications,
    new Date().toISOString(),
    id
  );

  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  res.json(patientFromRow(row));
}));

// ── DELETE /api/patients/:id ────────────────────────────────────
router.delete('/patients/:id', asyncHandler((req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT id FROM patients WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });

  db.prepare('DELETE FROM patients WHERE id = ?').run(id);
  res.status(204).send();
}));

// ── GET /api/patients/:id/labs ──────────────────────────────────
router.get('/patients/:id/labs', asyncHandler((req, res) => {
  const id = Number(req.params.id);
  const rows = db
    .prepare('SELECT * FROM labs WHERE patient_id = ? ORDER BY date(recorded_at) DESC')
    .all(id);
  res.json(rows.map(labFromRow));
}));

// ── POST /api/patients/:id/labs ─────────────────────────────────
router.post('/patients/:id/labs', asyncHandler((req, res) => {
  const id = Number(req.params.id);
  const patient = db.prepare('SELECT id, egfr FROM patients WHERE id = ?').get(id);
  if (!patient) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });

  const input = req.body;
  const result = db
    .prepare(`
      INSERT INTO labs (patient_id, recorded_at, creatinine, egfr, urea, potassium, hemoglobin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      id,
      input.recordedAt || new Date().toISOString().slice(0, 10),
      Number(input.creatinine),
      Number(input.egfr),
      Number(input.urea),
      Number(input.potassium),
      Number(input.hemoglobin)
    );

  // Tính toán xu hướng eGFR (egfr_trend)
  const prevEgfr = Number(patient.egfr);
  const newEgfr = Number(input.egfr);
  let trend = 'stable';
  if (newEgfr - prevEgfr > 2) trend = 'up';
  else if (prevEgfr - newEgfr > 2) trend = 'down';

  db.prepare('UPDATE patients SET egfr = ?, egfr_trend = ?, updated_at = ? WHERE id = ?')
    .run(newEgfr, trend, new Date().toISOString(), id);

  // Chạy Alert Engine tự động
  const alertsCreated = checkLabAlerts(id, input);

  const row = db.prepare('SELECT * FROM labs WHERE id = ?').get(Number(result.lastInsertRowid));
  res.status(201).json({
    ...labFromRow(row),
    alertsCreated,
  });
}));

// ── GET /api/dialysis-sessions ──────────────────────────────────
router.get('/dialysis-sessions', asyncHandler((req, res) => {
  const date = req.query.date ? String(req.query.date) : null;
  const rows = db
    .prepare(`
      SELECT d.*, p.full_name AS patient_name
      FROM dialysis_sessions d
      JOIN patients p ON p.id = d.patient_id
      WHERE (? IS NULL OR date(d.scheduled_at) = date(?))
      ORDER BY datetime(d.scheduled_at)
    `)
    .all(date, date)
    .map((row) => ({
      id: Number(row.id),
      patientId: Number(row.patient_id),
      patientName: String(row.patient_name),
      scheduledAt: String(row.scheduled_at),
      duration: Number(row.duration),
      station: String(row.station),
      status: row.status,
    }));

  res.json(rows);
}));

// ── POST /api/dialysis-sessions ─────────────────────────────────
router.post('/dialysis-sessions', asyncHandler((req, res) => {
  const input = req.body;
  const patient = db.prepare('SELECT full_name FROM patients WHERE id = ?').get(Number(input.patientId));
  if (!patient) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });

  const result = db
    .prepare(`
      INSERT INTO dialysis_sessions (patient_id, scheduled_at, duration, station, status)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(Number(input.patientId), input.scheduledAt, Number(input.duration), input.station, input.status || 'scheduled');

  res.status(201).json({
    id: Number(result.lastInsertRowid),
    patientId: Number(input.patientId),
    patientName: String(patient.full_name),
    scheduledAt: input.scheduledAt,
    duration: Number(input.duration),
    station: input.station,
    status: input.status || 'scheduled',
  });
}));

// ── GET /api/alerts ─────────────────────────────────────────────
router.get('/alerts', asyncHandler((_req, res) => {
  const rows = db
    .prepare(`
      SELECT a.*, p.full_name AS patient_name
      FROM alerts a
      JOIN patients p ON p.id = a.patient_id
      ORDER BY a.read ASC, datetime(a.created_at) DESC
    `)
    .all()
    .map((row) => ({
      id: Number(row.id),
      patientId: Number(row.patient_id),
      patientName: String(row.patient_name),
      severity: row.severity,
      title: String(row.title),
      detail: String(row.detail),
      createdAt: String(row.created_at),
      read: Boolean(row.read),
    }));

  res.json(rows);
}));

// ── PATCH /api/alerts/:id/read ──────────────────────────────────
router.patch('/alerts/:id/read', asyncHandler((req, res) => {
  const id = Number(req.params.id);
  db.prepare('UPDATE alerts SET read = 1 WHERE id = ?').run(id);

  const row = db
    .prepare(`
      SELECT a.*, p.full_name AS patient_name
      FROM alerts a JOIN patients p ON p.id = a.patient_id
      WHERE a.id = ?
    `)
    .get(id);

  if (!row) return res.status(404).json({ error: 'Không tìm thấy cảnh báo' });

  res.json({
    id: Number(row.id),
    patientId: Number(row.patient_id),
    patientName: String(row.patient_name),
    severity: row.severity,
    title: String(row.title),
    detail: String(row.detail),
    createdAt: String(row.created_at),
    read: Boolean(row.read),
  });
}));

export default router;

