# Góp Sáng - Nền tảng chia sẻ & mượn sách cộng đồng

Một ứng dụng hiện đại giúp kết nối cộng đồng thông qua việc chia sẻ và mượn sách cũ.

## Công nghệ sử dụng
- **Frontend**: React + TailwindCSS + Framer Motion
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **UI/UX**: Mobile-first, Premium design, Glassmorphism

## Hướng dẫn cài đặt

### 1. Chuẩn bị Backend (Supabase)
1. Tạo một dự án mới trên [Supabase](https://supabase.com).
2. Mở phần **SQL Editor** và chạy toàn bộ nội dung trong tệp `supabase_schema.sql` (đã có trong thư mục dự án).
3. Copy **Project URL** và **Anon Key** từ mục `Settings > API`.

### 2. Cài đặt Frontend
1. Mở terminal trong thư mục `app`.
2. Chạy lệnh cài đặt thư viện:
   ```bash
   npm install
   ```
3. Tạo tệp `.env` dựa trên `.env.example` và điền thông tin Supabase của bạn:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Chạy ứng dụng ở chế độ phát triển:
   ```bash
   npm run dev
   ```

## Các tính năng chính
- **Hệ thống mượn sách**: Quy trình Request -> Accept -> Handover -> Return.
- **Trust Score**: Hệ thống điểm uy tín tự động dựa trên hành vi người dùng.
- **Bản đồ & Khu vực**: Tìm kiếm sách theo quận/huyện gần bạn.
- **Thông báo Realtime**: Nhận thông báo tức thì khi có yêu cầu mượn hoặc nhắc nhở trả sách.
- **Hệ thống Badge**: Huy hiệu cho người chia sẻ tích cực.

## Triển khai (Deploy)
- Đẩy code lên GitHub.
- Kết nối với **Vercel** để deploy frontend.
- Nhớ cấu hình các Environment Variables trên Vercel.

---
© 2026 Góp Sáng Team - Lan tỏa tri thức Việt.
