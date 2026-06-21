# Commit message chuẩn cho dự án

Dự án này sử dụng Husky và CommitLint để kiểm tra commit message theo chuẩn [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## Cú pháp commit message

```
type(scope?): subject
```

- **type**: Loại thay đổi (bắt buộc)
  - feat: Thêm tính năng mới
  - fix: Sửa lỗi
  - docs: Thay đổi tài liệu
  - style: Thay đổi style, format, không ảnh hưởng logic
  - refactor: Refactor code, không thêm tính năng hay sửa bug
  - test: Thêm hoặc sửa test
  - chore: Công việc khác (build, cấu hình, ...)
- **scope**: Phạm vi ảnh hưởng (không bắt buộc, viết trong ngoặc đơn)
- **subject**: Là nội dung commit

## Ví dụ commit hợp lệ

- feat(auth): add login API
- fix: resolve crash on startup
- docs(readme): update usage guide
- chore(deps): update dependencies

## Tham khảo

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [CommitLint](https://commitlint.js.org/)
