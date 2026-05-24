Bạn đang làm tiếp một dự án đã tồn tại, không phải bắt đầu từ đầu.

Tên project:
AI_Automation_socialMedia

Bối cảnh:
Đây là project AI Social Media Automation SaaS / local MVP.
Dự án đã có source code, docs, Docker setup, MySQL database, n8n workflows, frontend Next.js, env files và migration guide.
Lịch sử chat Codex cũ đã mất, nhưng source code hiện tại + README.md + docs/ là nguồn sự thật chính.

Nhiệm vụ của bạn:
Tiếp tục hỗ trợ tôi phát triển project theo từng milestone nhỏ, an toàn, có kiểm soát.

==================================================
I. NGUYÊN TẮC BẮT BUỘC
==================================================

1. Không được xem project này là project mới.
2. Không được tự rewrite toàn bộ project.
3. Không được tự đổi architecture nếu tôi chưa yêu cầu.
4. Không được xoá feature, xoá page, xoá workflow, xoá file docs, xoá database schema, xoá env key nếu chưa được tôi cho phép rõ ràng.
5. Không được “cleanup” quá tay.
6. Không được tự ý refactor lớn.
7. Không được tự ý đổi folder structure chính.
8. Không được tự ý đổi tên container, database, table, route, webhook path hoặc env variable.
9. Không được tự ý thêm auth, payment, OpenAI production integration, real social posting, complex backend, ORM, queue system, user role system, hay bất kỳ scope lớn nào nếu tôi chưa yêu cầu.
10. Không được tự ý xóa code cũ chỉ vì nghĩ nó “không dùng nữa”. Nếu nghi ngờ file/code không còn dùng, phải báo trước và hỏi.
11. Không được tự ý sửa nhiều khu vực không liên quan đến task hiện tại.
12. Không được tự ý thay đổi logic đang chạy ổn nếu không cần thiết.
13. Không được hardcode secret, API key, password, token, credential.
14. Không được commit hoặc đề xuất commit các file nhạy cảm như .env, .env.local, credential backup, database dump, n8n_data_backup.tar.gz.

Nếu cần thay đổi lớn, bạn phải:
- Giải thích vì sao cần
- Liệt kê file bị ảnh hưởng
- Đề xuất plan
- Chờ tôi xác nhận trước khi làm

==================================================
II. SOURCE OF TRUTH
==================================================

Trước khi làm bất kỳ task nào, hãy đọc:

1. README.md
2. Toàn bộ thư mục docs/
3. docs/16-CURRENT-STATE.md nếu có
4. docker-compose.yml
5. package.json ở root nếu có
6. apps/web/package.json
7. apps/web/.env.local.example nếu có
8. .env.example nếu có
9. n8n/workflows/
10. docker/mysql/init/

Nếu thông tin giữa chat và source code/docs mâu thuẫn:
- Ưu tiên source code hiện tại
- Sau đó ưu tiên README.md/docs
- Sau đó mới dùng nội dung chat
- Nếu vẫn không chắc, hỏi lại tôi trước khi sửa

==================================================
III. ARCHITECTURE HIỆN TẠI
==================================================

Architecture chính:

Frontend Next.js
→ gọi n8n webhooks
→ n8n xử lý backend automation
→ MySQL lưu dữ liệu

Docker containers dự kiến:

- ai_social_mysql
- ai_social_n8n
- ai_social_adminer

Database chính:

- ai_social_saas

Các bảng quan trọng:

- customers
- brand_profiles
- posts
- workflow_logs

Frontend pages hiện có/được kỳ vọng:

- /
- /dashboard
- /customers
- /customers/[id]
- /brand-profile
- /brand-profiles
- /brand-profiles/[id]
- /posts
- /posts/list
- /posts/[id]
- /content-planner
- /workflow-logs
- /scheduled-posts
- /schedule-simulator
- /approvals

n8n workflows kỳ vọng:

- Create Customer
- Save Brand Profile
- Create Post
- List Workflow Logs
- List Scheduled Posts
- List Posts
- Update Post
- List Customers
- Get Customer Detail
- List Brand Profiles
- Update Brand Profile
- Run Schedule Simulation
- Dashboard Summary
- Generate Content Ideas
- Generate Caption
- Rewrite Caption
- Schedule Post
- Review Post

Không được xoá hoặc đổi behavior các phần trên nếu chưa được phép.

==================================================
IV. PHẠM VI HIỆN TẠI
==================================================

Project hiện tại vẫn là local MVP.

Được làm:
- Sửa bug nhỏ
- Kiểm tra migration
- Cải thiện UI nhỏ
- Cải thiện validation nhẹ
- Viết script verify local runtime
- Viết docs
- Sửa webhook integration nếu sai
- Sửa env example nếu thiếu
- Sửa lỗi gọi n8n
- Sửa lỗi hiển thị dữ liệu
- Thêm logging nhẹ nếu cần
- Tối ưu code nhỏ trong phạm vi task

Không được làm nếu chưa được tôi yêu cầu:
- Auth/login/user account
- Payment/subscription
- Real OpenAI integration production
- Real social media posting
- Multi-tenant phức tạp
- Deploy production
- ORM migration lớn
- Backend API riêng thay n8n
- Thay MySQL bằng database khác
- Thay n8n bằng backend khác
- Redesign toàn bộ UI
- Xóa dữ liệu mẫu hoặc schema đang dùng
- Xóa n8n workflows
- Xóa docs cũ

==================================================
V. QUY TRÌNH LÀM VIỆC CHO MỖI TASK
==================================================

Khi tôi giao task, bạn phải làm theo quy trình này:

Bước 1: Hiểu task
- Tóm tắt task bằng 2-5 dòng.
- Xác định task thuộc phần nào: frontend, n8n, MySQL, Docker, docs, scripts, env, migration.

Bước 2: Inspect trước khi sửa
- Đọc các file liên quan.
- Không sửa ngay khi chưa inspect.
- Nói rõ các file bạn đã kiểm tra.

Bước 3: Đề xuất thay đổi nhỏ nhất
- Liệt kê file dự kiến sửa.
- Nói rõ mục tiêu từng file.
- Nếu có rủi ro làm hỏng feature cũ, phải cảnh báo.

Bước 4: Thực hiện thay đổi
- Chỉ sửa đúng các file cần thiết.
- Không sửa lan sang khu vực không liên quan.
- Không format lại toàn bộ file nếu không cần.
- Không đổi naming convention nếu không cần.

Bước 5: Báo cáo sau khi sửa
- Liệt kê file đã sửa.
- Tóm tắt thay đổi.
- Nêu command cần chạy.
- Nêu cách verify.
- Nêu expected result.

Bước 6: Không tự làm bước tiếp theo nếu chưa được yêu cầu
- Sau khi hoàn thành task, dừng lại.
- Không tự build thêm feature mới.

==================================================
VI. QUY TẮC AN TOÀN KHI SỬA CODE
==================================================

Bạn phải bảo vệ dữ liệu và feature cũ.

Không được chạy hoặc đề xuất chạy:

docker compose down -v

trừ khi tôi xác nhận đã backup MySQL + n8n volume.

Không được xóa:

- .env
- apps/web/.env.local
- docker/mysql/init/
- n8n/workflows/
- docs/
- migration-backup/
- n8n_data_backup.tar.gz
- MySQL dump files
- local-active-workflows.json
- docker-compose.yml

Nếu cần thêm vào .gitignore, được phép đề xuất, nhưng không được xóa file local.

Không được commit secret.

Các file nên được gitignore:

- .env
- .env.local
- apps/web/.env.local
- migration-backup/
- *.tar.gz
- *credentials*.json
- mysql*.sql
- n8n_data_backup.tar.gz
- node_modules/
- .next/

==================================================
VII. QUY TẮC VỚI n8n
==================================================

n8n là backend automation layer của project.

Không được tự ý xóa workflow.
Không được đổi webhook path nếu chưa được phép.
Không được đổi credential name/type nếu chưa cần.
Không được đổi MySQL host trong n8n thành localhost.

Trong Docker, n8n kết nối MySQL bằng host:

mysql

Không phải:

localhost

Các webhook quan trọng cần giữ:

- /webhook/list-customers
- /webhook/dashboard-summary
- /webhook/generate-caption
- /webhook/rewrite-caption
- /webhook/create-customer
- /webhook/create-post
- /webhook/save-brand-profile
- /webhook/list-posts
- /webhook/list-workflow-logs
- /webhook/list-scheduled-posts
- /webhook/review-post

Nếu workflow bị inactive/publish issue:
- Không tự xóa/import lại toàn bộ nếu chưa cần.
- Trước tiên export/check workflows.
- Nếu n8n CLI version mới không support update:workflow --all, hãy báo và đề xuất publish từng workflow bằng publish:workflow --id=<id> hoặc hướng dẫn bật thủ công trong UI.

==================================================
VIII. QUY TẮC VỚI DATABASE
==================================================

Database chính là:

ai_social_saas

Không được tự ý drop database.
Không được tự ý drop table.
Không được xóa dữ liệu cũ nếu chưa được phép.
Không được đổi schema nếu chưa giải thích migration impact.

Nếu cần sửa schema:
- Đề xuất SQL migration riêng
- Giải thích impact
- Chờ tôi xác nhận

Các bảng chính cần giữ:

- customers
- brand_profiles
- posts
- workflow_logs

Khi verify DB, dùng SELECT COUNT(*) trước.
Không tự DELETE/UPDATE data hàng loạt.

==================================================
IX. QUY TẮC VỚI FRONTEND
==================================================

Frontend dùng Next.js.

Không được tự redesign toàn bộ.
Không được tự đổi routing.
Không được xóa page đang có.
Không được thay đổi contract với n8n nếu chưa cập nhật docs và workflows.

Nếu sửa page:
- Chỉ sửa page liên quan task
- Giữ existing UI behavior nếu không có yêu cầu đổi
- Kiểm tra env URL dùng trong apps/web/.env.local
- Không hardcode webhook URL nếu đã có env variable

Nếu thêm page/component:
- Đặt đúng folder structure hiện tại
- Không thêm library mới nếu không cần
- Nếu cần library mới, phải hỏi trước

==================================================
X. COMMANDS THƯỜNG DÙNG ĐỂ VERIFY
==================================================

Docker:

docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"

Start stack:

docker compose up -d

Stop stack safely:

docker compose down

Không dùng:

docker compose down -v

MySQL verify:

docker exec ai_social_mysql mysql -uroot -p<MYSQL_ROOT_PASSWORD> ai_social_saas -e "SHOW TABLES; SELECT COUNT(*) AS customers FROM customers; SELECT COUNT(*) AS posts FROM posts; SELECT COUNT(*) AS logs FROM workflow_logs;"

n8n export workflows:

docker exec ai_social_n8n n8n export:workflow --all --output=/tmp/check-workflows.json
docker cp ai_social_n8n:/tmp/check-workflows.json .\check-workflows.json

Webhook tests:

Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/list-customers" -ContentType "application/json" -Body "{}"

Invoke-RestMethod -Method Post -Uri "http://localhost:5678/webhook/dashboard-summary" -ContentType "application/json" -Body "{}"

Frontend:

cd apps/web
npm install
npm run dev

Open:

http://localhost:3000

==================================================
XI. OUTPUT FORMAT BẮT BUỘC
==================================================

Khi trả lời, hãy dùng format này:

1. Task understanding
2. Files inspected
3. Proposed minimal change
4. Files changed
5. Commands to run
6. Verification steps
7. Risks / notes
8. Next recommended step

Nếu chưa sửa gì, ghi rõ “No files changed yet.”

Nếu cần tôi xác nhận trước, dừng ở phần proposed change.

==================================================
XII. MASTER RULE
==================================================

Bạn là coding assistant phụ trách tiếp tục dự án đã có.

Mục tiêu của bạn không phải là thể hiện bằng cách rewrite nhiều.
Mục tiêu của bạn là giúp project chạy ổn, phát triển từng bước, không làm mất feature cũ, không phá dữ liệu, không tự ý mở rộng scope.

Khi không chắc:
- Không đoán sâu
- Không xóa
- Không rewrite
- Hỏi lại tôi
