-- ====================================================================
-- Database Schema: RenalCare Patient Management System
-- Compatible with SQLite & PostgreSQL (KTPMUD 2026.1)
-- ====================================================================

-- 1. Bảng bệnh nhân (Patients)
CREATE TABLE IF NOT EXISTS patients (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  code          TEXT NOT NULL UNIQUE,                                         -- Mã bệnh nhân: RC-1048
  full_name     TEXT NOT NULL,                                                -- Họ và tên
  date_of_birth TEXT NOT NULL,                                                -- Ngày sinh
  gender        TEXT NOT NULL,                                                -- Giới tính (Nam/Nữ)
  phone         TEXT NOT NULL,                                                -- Số điện thoại liên hệ
  stage         TEXT NOT NULL,                                                -- Giai đoạn suy thận: Giai đoạn 1 - 5
  status        TEXT NOT NULL CHECK (status IN ('stable', 'watch', 'critical')), -- Trạng thái lâm sàng
  egfr          REAL NOT NULL,                                                -- Độ lọc cầu thận gần nhất (mL/min/1.73m²)
  egfr_trend    TEXT NOT NULL DEFAULT 'stable' CHECK (egfr_trend IN ('up', 'down', 'stable')),
  next_dialysis TEXT,                                                         -- Lịch lọc máu tiếp theo
  doctor        TEXT NOT NULL,                                                -- Bác sĩ điều trị chính
  updated_at    TEXT NOT NULL,                                                -- Cập nhật lần cuối
  address       TEXT NOT NULL DEFAULT '',                                     -- Địa chỉ
  diagnosis     TEXT NOT NULL DEFAULT '',                                     -- Chẩn đoán bệnh kèm theo
  allergies     TEXT NOT NULL DEFAULT '',                                     -- Tiền sử dị ứng
  medications   TEXT NOT NULL DEFAULT ''                                      -- Thuốc đang dùng
);

-- 2. Bảng kết quả xét nghiệm sinh hóa (Lab Results)
CREATE TABLE IF NOT EXISTS labs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id  INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recorded_at TEXT NOT NULL,                                                  -- Thời gian xét nghiệm (YYYY-MM-DD)
  creatinine  REAL NOT NULL,                                                  -- Creatinine huyết thanh (mg/dL)
  egfr        REAL NOT NULL,                                                  -- Độ lọc cầu thận ước tính (mL/min)
  urea        REAL NOT NULL,                                                  -- Ure máu (mmol/L)
  potassium   REAL NOT NULL,                                                  -- Kali máu K+ (mmol/L)
  hemoglobin  REAL NOT NULL                                                   -- Hemoglobin Hb (g/dL)
);

-- 3. Bảng quản lý ca lọc máu theo trạm/ghế (Dialysis Sessions)
CREATE TABLE IF NOT EXISTS dialysis_sessions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  scheduled_at TEXT NOT NULL,                                                 -- Giờ hẹn lọc máu (ISO 8601)
  duration     INTEGER NOT NULL,                                              -- Thời lượng lọc máu (phút, thường là 240)
  station      TEXT NOT NULL,                                                 -- Vị trí ghế/máy: Ghế 01, Ghế 04...
  status       TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

-- 4. Bảng cảnh báo rủi ro lâm sàng (Clinical Alerts)
CREATE TABLE IF NOT EXISTS alerts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  severity   TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),      -- Mức độ rủi ro (high/medium/low)
  title      TEXT NOT NULL,                                                   -- Tiêu đề cảnh báo
  detail     TEXT NOT NULL,                                                   -- Mô tả chi tiết nguy cơ
  created_at TEXT NOT NULL,                                                   -- Thời điểm phát hiện
  read       INTEGER NOT NULL DEFAULT 0                                       -- Đã đọc/xử lý chưa (0: chưa, 1: rồi)
);

