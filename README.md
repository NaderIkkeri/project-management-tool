# 🛠️ Project Management Tool

A comprehensive **full-stack project management application** built as part of an intern assignment.  
It features a **Django REST Framework (DRF)** backend with JWT authentication and a **Next.js (TypeScript)** frontend with role-based access control.

---

## 🚀 Features

- **Full-Stack Authentication** — Secure login using **JWT (JSON Web Tokens)**.
- **Role-Based Authorization**:
  - **Admin / Manager**: Full CRUD access for both projects and tasks.
  - **Developer**: Can view all projects and tasks but can only update the status of tasks. Other controls remain hidden.
- **Project Management** — Create, view, update, and delete projects.
- **Task Management** — Create, assign, update, and delete tasks.
- **Kanban Board** — Visual task board with “To Do”, “In Progress”, and “Done” columns on the project detail page.
- **Reporting Dashboard** — Task statistics by status and a list of overdue tasks.

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

### 🖥️ Backend Setup

```bash
# Clone the repository
git clone https://github.com/NaderIkkeri/project-management-tool.git
cd project-management-tool/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
# If requirements.txt is missing, install manually:
# pip install django djangorestframework django-cors-headers django-filter djangorestframework-simplejwt

# Run migrations
python manage.py migrate

# Create superuser (Admin)
python manage.py createsuperuser

# Create additional users (Manager & Developer)
python manage.py shell
Inside the Django shell:

python
Copy code
from api.models import User
User.objects.create_user(username='manager', password='password', role='MANAGER')
User.objects.create_user(username='dev', password='password', role='DEVELOPER')
exit()
Then, start the backend server:

bash
Copy code
python manage.py runserver
The backend will be running at: http://127.0.0.1:8000

🌐 Frontend Setup
bash
Copy code
# Open a new terminal
cd project-management-tool/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
The frontend will be running at: http://localhost:3000

🔐 Test Logins
Role	Username	Password
Admin	(your superuser)	(your password)
Manager	manager	password
Developer	dev	password

📡 API Endpoints Summary
All endpoints (except /api/token/) require an authentication header:
Authorization: Bearer <your_token>

🔑 Authentication
Method	Endpoint	Description
POST	/api/token/	Obtain JWT token (access + refresh)

📁 Projects
Method	Endpoint	Description
GET	/api/projects/	Get all projects
POST	/api/projects/	Create a new project (Manager/Admin)
PATCH	/api/projects/<id>/	Update a project (Manager/Admin)
DELETE	/api/projects/<id>/	Delete a project (Manager/Admin)

📌 Tasks
Method	Endpoint	Description
GET	/api/tasks/	Get all tasks
GET	/api/tasks/?project=<id>	Get tasks for a specific project
POST	/api/tasks/	Create a new task (Manager/Admin)
PATCH	/api/tasks/<id>/	Update a task (title, status, assignee, deadline)
DELETE	/api/tasks/<id>/	Delete a task (Manager/Admin)

👥 Users
Method	Endpoint	Description
GET	/api/users/	Get all users (for assigning tasks)

📌 Assumptions
Developers can see all projects and tasks but can only update task status.

Managers and Admins have full control over both projects and tasks.

📈 Future Improvements
💡 Add an AI-powered user story generator (was deprioritized for MVP)

📎 Enable image/file uploads for tasks

✉️ Add email notifications for overdue tasks or new assignments

📱 Improve responsive UI for mobile devices

📇 Contact
Name: Nader Ahmed
Email: naderikkeri@gmail.com
Phone: +918971711881