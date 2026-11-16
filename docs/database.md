# Thiết kế cơ sở dữ liệu

> Nguồn sự thật cho thiết kế CSDL đến khi nhóm chốt ORM. Mọi thay đổi bảng hoặc cột phải sửa file này qua PR.
> Kiểu dữ liệu đang ghi dạng chung, sẽ đổi theo hệ CSDL nhóm chọn.

## Sơ đồ

```mermaid
erDiagram
    users ||--o{ subjects : "tạo"
    users ||--o{ attempts : "làm bài"
    users ||--o{ ai_usage : "gọi AI"
    subjects ||--o{ questions : "chứa"
    subjects ||--o{ question_sets : "chứa"
    question_sets ||--o{ set_questions : "gồm"
    questions ||--o{ set_questions : "nằm trong"
    questions ||--|{ answer_options : "có"
    question_sets ||--o{ attempts : "được làm"
    attempts ||--o{ attempt_answers : "gồm"
    questions ||--o{ attempt_answers : "được trả lời"
    answer_options |o--o{ attempt_answers : "được chọn"

    users {
        int id PK
        string email UK
        string password_hash "đã mã hóa, không lưu mật khẩu gốc"
        string full_name
        string role "learner | admin"
        datetime created_at
    }
    subjects {
        int id PK
        int owner_id FK "users.id"
        string name
        text description
        datetime created_at
    }
    question_sets {
        int id PK
        int subject_id FK "subjects.id"
        string title
        string type "manual | ai | review"
        datetime created_at
    }
    questions {
        int id PK
        int subject_id FK "subjects.id"
        text content
        text explanation
        string topic
        string difficulty "easy | medium | hard"
        string source "manual | ai"
        text source_excerpt "đoạn trích tài liệu làm căn cứ, NULL nếu nhập tay"
        datetime created_at
        datetime updated_at
    }
    set_questions {
        int set_id PK, FK "question_sets.id"
        int question_id PK, FK "questions.id"
        int position "thứ tự câu trong đề"
    }
    answer_options {
        int id PK
        int question_id FK "questions.id"
        text content
        boolean is_correct
        int position
    }
    attempts {
        int id PK
        int user_id FK "users.id"
        int set_id FK "question_sets.id"
        string mode "practice | exam"
        int time_limit_sec "NULL nếu không giới hạn"
        datetime started_at
        datetime submitted_at "NULL khi đang làm"
        decimal score "NULL khi chưa nộp"
    }
    attempt_answers {
        int id PK
        int attempt_id FK "attempts.id"
        int question_id FK "questions.id"
        int selected_option_id FK "answer_options.id, NULL nếu bỏ trống"
        boolean is_correct
    }
    ai_usage {
        int id PK
        int user_id FK "users.id"
        string action "generate | solve | review"
        datetime created_at
    }
```

Ký hiệu: `||` đúng 1, `|o` 0 hoặc 1, `o{` 0 hoặc nhiều, `|{` 1 hoặc nhiều.

## Ý nghĩa từng bảng (mỗi dòng là gì)

| Bảng | Mỗi dòng là |
|---|---|
| `users` | Một tài khoản |
| `subjects` | Một môn học do một người tạo |
| `questions` | Một câu hỏi trong ngân hàng câu hỏi của môn |
| `answer_options` | Một lựa chọn (A/B/C/D) của một câu hỏi |
| `question_sets` | Một đề |
| `set_questions` | "Câu X nằm trong đề Y ở vị trí Z" |
| `attempts` | Một lần một người làm một đề |
| `attempt_answers` | Một câu đã trả lời trong một lần làm bài |
| `ai_usage` | Một lần gọi AI, dùng để giới hạn lượt theo ngày |

## Quyết định thiết kế

1. **Câu hỏi thuộc môn, không thuộc đề.** Một câu nằm được trong nhiều đề qua bảng trung gian `set_questions`, nên sửa câu một lần là mọi đề cập nhật theo.
2. **Đáp án là bảng riêng**, để `attempt_answers` ghi được chính xác lựa chọn của người dùng.
3. **Lưu từng câu trả lời**, không chỉ lưu điểm, vì thống kê câu sai và đề ôn đều cần dữ liệu này.
4. **Không có bảng thống kê.** Câu hay sai được tính từ `attempt_answers` với `is_correct = false`, nên dữ liệu chỉ nằm một chỗ.
5. **Đề ôn từ câu sai** là một `question_sets` có `type = review`, trỏ lại các câu cũ qua `set_questions`.
6. **Giới hạn lượt AI** bằng cách đếm số dòng `ai_usage` của người dùng trong ngày.

## Ràng buộc cần đảm bảo trong code

- `users.email` là duy nhất.
- Mỗi câu hỏi có ít nhất 2 đáp án và đúng 1 đáp án đúng.
- Một câu không xuất hiện hai lần trong cùng một đề (khóa chính kép của `set_questions`).
- `attempt_answers.question_id` phải thuộc đề của `attempts.set_id` tương ứng.
- `attempt_answers.selected_option_id`, nếu có, phải là đáp án của đúng `question_id` đó.
