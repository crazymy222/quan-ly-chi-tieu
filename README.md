# Hướng dẫn sử dụng

## Docker

Cần **khởi động Docker Desktop** (hoặc daemon Docker tương đương) trước khi chạy các lệnh Docker trong dự án

## Biến môi trường (`.env`)

Tạo file **`.env`** trong từng thư mục và sao chép nội dung từ **`.env.example`** tương ứng (hoặc đổi tên `.env.example` thành `.env`) — **ba vị trí**:

| Thư mục | File mẫu |
|---------|-----------|
| `apps/client` | `.env.example` → `.env` |
| `apps/server` | `.env.example` → `.env` |
| `infra/compose` | `.env.example` → `.env` |

Sử dụng giá trị mặc định hoặc điều chỉnh giá trị trong từng `.env` cho đúng môi trường của bạn trước khi chạy ứng dụng hoặc Compose.

## Chế độ phát triển (dev)

1. Tại thư mục gốc của repo, chạy:

```bash
pnpm run dev
```

2. Mở trình duyệt và truy cập **http://localhost:3001** để dùng giao diện web.

## Chạy toàn bộ dự án bằng Docker

1. Tại thư mục gốc:

```bash
pnpm run docker:up
```

2. Đợi quá trình **build và khởi động container** hoàn tất (lần đầu có thể lâu hơn do build image).
3. Truy cập **http://localhost:3001** để mở trang web.

Để dừng stack Docker Compose (theo cấu hình trong repo):

```bash
pnpm run docker:down
```
