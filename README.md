# 🛠️ Project Management Tool

A comprehensive **full-stack project management application** built as part of an intern assignment.  
It features a **Django REST Framework (DRF)** backend with JWT authentication and a **Next.js (TypeScript)** frontend with role-based access control.

---

## 🚀 Live Demo

**Frontend Deployed on Vercel:** [https://project-management-tool-snowy.vercel.app/](https://project-management-tool-snowy.vercel.app/)

*(Note: The backend is not deployed. For the live demo to work, you must also be running the backend server on your local machine at `http://localhost:8000`)*

---

## ✨ Features

- **Full-Stack Authentication** — Secure login system using **JWT (JSON Web Tokens)**.
- **Role-Based Authorization**:
  - **Admin / Manager**: Full CRUD access for both projects and tasks.
  - **Developer**: Can view all projects and tasks but can only update the status of tasks. Other controls remain hidden.
- **Project Management** — Create, view, update, and delete projects.
- **Task Management** — Create, assign, update (title, status, assignee, deadline), and delete tasks.
- **Kanban Board** — Visual task board with “To Do”, “In Progress”, and “Done” columns on the project detail page.
- **Reporting Dashboard** — Task statistics by status and a list of all overdue tasks.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Backend** | Python, Django, Django REST Framework, Simple JWT |
| **Database** | SQLite3 (default) |
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Version Control** | Git & GitHub |

---

## ⚙️ Setup Instructions

You’ll need to run the **backend** and **frontend** in **separate terminals**.

---

### 🖥️ Backend Setup (Terminal 1)

```bash
# 1. Clone the repository
git clone https://github.com/NaderIkkeri/project-management-tool.git
cd project-management-tool/backend

# 2. Create and activate a virtual environment
python -m venv venv
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# 3. Install dependencies
# Create a requirements.txt file (if it doesn't exist) with the following content:
# Django==<your_django_version>
# djangorestframework==<your_drf_version>
# django-cors-headers==<your_cors_version>
# django-filter==<your_filter_version>
# djangorestframework-simplejwt==<your_jwt_version>
# Then run:
# pip install -r requirements.txt
# OR install manually:
pip install django djangorestframework django-cors-headers django-filter djangorestframework-simplejwt

# 4. Run database migrations
python manage.py migrate

# 5. Create superuser (Admin)
python manage.py createsuperuser
# (Follow prompts for username, email, password)

# 6. Create additional users (Manager & Developer)
python manage.py shell
python
Copy code
from api.models import User
User.objects.create_user(username='manager', password='password', role='MANAGER')
User.objects.create_user(username='dev', password='password', role='DEVELOPER')
exit()
bash
Copy code
# 7. Start the backend server
python manage.py runserver
The backend will be running at:
👉 http://127.0.0.1:8000

🌐 Frontend Setup (Terminal 2)
bash
Copy code
# 1. Open a new terminal and navigate to the frontend folder
cd project-management-tool/frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
The frontend will be running at:
👉 http://localhost:3000

🔐 Test Logins
Role	Username	Password
Admin	(your superuser)	(your password)
Manager	manager	password
Developer	dev	password

📡 API Endpoints Summary
All endpoints (except /api/token/) require an authentication header:
Authorization: Bearer <your_access_token>

🔑 Authentication
Method	Endpoint	Description
POST	/api/token/	Obtain JWT token (access + refresh). Returns user info (id, username, role).

📁 Projects
Method	Endpoint	Description	Permissions
GET	/api/projects/	Get all projects	Authenticated
POST	/api/projects/	Create a new project	Manager/Admin
PATCH	/api/projects/<id>/	Update a project's details	Manager/Admin
DELETE	/api/projects/<id>/	Delete a project (cascades tasks)	Manager/Admin

📌 Tasks
Method	Endpoint	Description	Permissions
GET	/api/tasks/	Get all tasks	Authenticated
GET	/api/tasks/?project=<id>	Get tasks for a specific project	Authenticated
POST	/api/tasks/	Create a new task	Manager/Admin
PATCH	/api/tasks/<id>/	Update a task (title, status, assignee, deadline)	Authenticated
DELETE	/api/tasks/<id>/	Delete a task	Manager/Admin

👥 Users
Method	Endpoint	Description	Permissions
GET	/api/users/	Get all users (for assigning tasks)	Authenticated

📌 Assumptions
Developers can see all projects and tasks but can only update task status.

Managers and Admins have full control over both projects and tasks.

📈 Future Improvements
💡 Add an AI-powered user story generator (was deprioritized for MVP).

📎 Enable image/file uploads for tasks.

✉️ Add email notifications for overdue tasks or new assignments.

📱 Improve responsive UI for mobile devices.

📇 Contact
Name: Nader Ahmed
Email: naderikkeri@gmail.com
Phone: +91 8971711881
