# 🏥 RenalCare Patient Management System (Kidney_Project_v2)

> **Đồ án môn**: Kỹ thuật Phần mềm Ứng dụng (KTPMUD) – Học kỳ 2026.1  
> **Kiến trúc**: Standard Decoupled 2-Tier Architecture (Frontend React + Backend Express + SQLite)  
> **Nguồn gốc**: Kế thừa sự đơn giản, tiện lợi của `Folder_Project` và toàn bộ logic lâm sàng chuyên sâu, giao diện đẳng cấp từ `Kidney-Care-Manager`.

---

## 🌟 1. Điểm Nổi Bật Của Hệ Thống

* **Nghiệp vụ lâm sàng chuẩn khoa Thận nhân tạo**:
  * Theo dõi độ lọc cầu thận **eGFR**, chỉ số **Creatinine**, **Ure**, **Kali máu ($K^+$)**, **Hemoglobin**.
  * Phân loại giai đoạn suy thận mạn (Giai đoạn 1 đến 5) kèm biểu đồ xu hướng (*up / down / stable*).
  * Quản lý **lịch lọc máu chi tiết theo từng ghế/máy** (thời lượng ca lọc, trạm lọc).
  * **Alert Engine thông minh**: Tự động phát hiện Kali máu nguy kịch ($K^+ \ge 6.0\text{ mmol/L}$) hoặc eGFR suy giảm nghiêm trọng ($< 15$).
* **Giao diện hiện đại (Commercial-grade UI/UX)**:
  * Được xây dựng trên nền tảng **React 18 + Tailwind CSS + Radix UI + Recharts**.
  * Bố cục sắc sảo, tối ưu hiển thị trên cả máy tính bàn lẫn máy tính bảng của bác sĩ.
* **Kiến trúc chuẩn mực & Thuần túy (Zero Replit Lock-in)**:
  * Sử dụng công cụ **`npm` tiêu chuẩn** của Node.js, không phụ thuộc vào monorepo pnpm hay Replit plugins.
  * Tích hợp cơ chế **Hợp nhất 1-Host**: Chạy cả ứng dụng Web lẫn API trên **duy nhất Port 3001**.
  * Sẵn sàng cho **Docker** (`docker-compose.yml`) và **Render Blueprint** (`render.yaml`).

---

## 🚀 2. Hướng Dẫn Khởi Chạy (1-Click Trên Windows)

### Cách 1: Chế độ 1-Port (Đơn giản nhất – Dùng để xem & demo)
1. Vào thư mục `Kidney_Project_v2`.
2. **Double-click vào file [`run-dev.bat`](file:///D:/Trên%20lớp%2020261/00_KTPMUD/Kidney_Project_v2/run-dev.bat)**.
3. Cửa sổ CMD sẽ mở ra và tự động bật trình duyệt web tại:  
   👉 **http://localhost:3001**

### Cách 2: Chế độ 2-Port Hot Reload (Khi cần code chỉnh sửa UI)
* Double-click vào file **[`run-dev-hotreload.bat`](file:///D:/Trên%20lớp%2020261/00_KTPMUD/Kidney_Project_v2/run-dev-hotreload.bat)**:
  * Backend API: `http://localhost:3001`
  * Frontend UI: `http://localhost:5173` (Tự động tải lại trang khi sửa code)

### Cách 3: Chạy thủ công bằng Terminal
```powershell
# Chạy Backend (Port 3001)
cd backend
npm install
node src/config/seed.js
node src/app.js

# Chạy Frontend (Port 5173)
cd frontend
npm install
npm run dev
```

---

## 🗂️ 3. Cấu Trúc Thư Mục Chuẩn Mực

```
Kidney_Project_v2/
├── .github/workflows/ci.yml   # CI/CD GitHub Actions
├── backend/                  # Express RESTful API Server
│   ├── src/
│   │   ├── config/           # Cấu hình CSDL, biến môi trường, seed data
│   │   ├── routes/           # Định tuyến API (renal, health)
│   │   ├── services/         # Alert Engine phát hiện nguy cơ lâm sàng
│   │   └── app.js            # Express server kiêm serve frontend dist
│   ├── package.json          # npm dependencies
│   └── Dockerfile
├── database/
│   ├── renalcare.sqlite      # CSDL SQLite lưu trữ thực tế
│   └── schema.sql            # DDL bảng Patients, Labs, Dialysis, Alerts
├── docs/                     # Tài liệu học phần (SRS, Kiến trúc, Slide, Báo cáo)
├── frontend/                 # Giao diện người dùng React Web
│   ├── src/
│   │   ├── components/       # ui-kit, shadcn primitives
│   │   ├── pages/            # Dashboard, Patients, PatientDetail, Dialysis, Alerts
│   │   ├── api-client/       # Custom Fetch & TanStack Query hooks
│   │   ├── App.tsx & main.tsx
│   │   └── index.css         # Styling y tế
│   ├── dist/                 # Bản đóng gói hoàn chỉnh sẵn sàng phục vụ
│   ├── vite.config.ts        # Cấu hình Vite sạch
│   └── package.json          # npm dependencies
├── run-dev.bat               # Khởi động 1-Click Port 3001
├── run-dev-hotreload.bat     # Khởi động Dev Port 5173
├── start-dev.ps1             # Khởi động PowerShell
├── docker-compose.yml        # Docker compose 
├── render.yaml               # Render Cloud Blueprint
└── README.md
```

