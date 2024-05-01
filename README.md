# Task Manager API

Task Manager API is a RESTful API for managing tasks and projects. It provides endpoints for creating, updating, and deleting tasks and projects, as well as handling user authentication and session management. This API is designed to serve as a backend for a task management application.

## Table of Contents

- [✨ Features](#features)
- [🔧 Installation](#installation)
- [💻 Usage](#usage)
- [📡 API Endpoints](#api-endpoints)
  - [🔑 User Authentication](#user-authentication)
  - [📂 Projects](#projects)
  - [🗂️ Tasks](#tasks)
- [📦 Dependencies](#dependencies)

## ✨ Features

- 🔐 User authentication and session management
- 📂 Create, update, and delete projects
- 🗂️ Create, update, and delete tasks within projects
- 👤 Retrieve all projects and tasks for a user
- 🔒 Secure access control for authenticated users

## 🔧 Installation

1. Clone the repository:

    ```shell
    git clone https://github.com/2003salar/task_manager.git
    ```

2. Install dependencies:

    ```shell
    cd task_manager
    npm install
    ```

3. Set up the database and configuration:
    - Make sure to have a PostgreSQL database running and create the required tables.
    - Provide the database connection details in a `.env` file in the root of the project:
    
    ```plaintext
    DB_HOST=your_database_host
    DB_PORT=your_database_port
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_NAME=your_database_name
    SESSION_SECRET=your_secret_key
    ```

4. Run the server:

    ```shell
    npm start
    ```

    The server will start running on the specified port (default is 3000).

## 💻 Usage

The API is accessible via HTTP requests. Each endpoint requires an appropriate HTTP method (`GET`, `POST`, `PATCH`, `DELETE`) and request parameters.

Use a tool like Postman or curl to interact with the API.

## 📡 API Endpoints

### 🔑 User Authentication

- **Login**: `POST /login`
    - Authenticate a user using username and password.
    - **Request body**: `{ "username": "user", "password": "pass" }`
    - **Response**: `{ "success": true, "message": "You are signed in" }`

- **Register**: `POST /register`
    - Register a new user with the provided information.
    - **Request body**: `{ "first_name": "John", "last_name": "Doe", "username": "johndoe", "password": "pass", "password2": "pass", "email": "johndoe@example.com" }`
    - **Response**: `{ "success": true, "data": { "id": 1, "username": "johndoe", ... } }`

- **Logout**: `GET /logout`
    - Log out the authenticated user.
    - **Response**: `{ "success": true, "message": "Logged out" }`

### 📂 Projects

- **Get all projects**: `GET /projects`
    - Get all projects for the authenticated user.
    - **Response**: `{ "success": true, "data": [ { "id": 1, "name": "Project 1", ... }, ... ] }`

- **Create a project**: `POST /projects`
    - Create a new project.
    - **Request body**: `{ "name": "New Project", "description": "Project description" }`
    - **Response**: `{ "success": true, "data": { "id": 1, "name": "New Project", ... } }`

- **Update a project**: `PATCH /projects/:id`
    - Update an existing project.
    - **Request body**: `{ "name": "Updated Project", "description": "Updated description" }`
    - **Response**: `{ "success": true, "data": { "id": 1, "name": "Updated Project", ... } }`

- **Delete a project**: `DELETE /projects/:id`
    - Delete a project.
    - **Response**: `{ "success": true, "message": "Deleted successfully" }`

- **Get a specific project**: `GET /projects/:id`
    - Get details of a specific project.
    - **Response**: `{ "success": true, "data": { "id": 1, "name": "Project 1", ... } }`

### 🗂️ Tasks

- **Get all tasks in a project**: `GET /tasks/project/:id`
    - Get all tasks in a specific project for the authenticated user.
    - **Response**: `{ "success": true, "data": [ { "id": 1, "title": "Task 1", ... }, ... ] }`

- **Create a task**: `POST /tasks`
    - Create a new task.
    - **Request body**: `{ "title": "New Task", "description": "Task description", "due_date": "2024-05-05", "priority": 2, "project_id": 1 }`
    - **Response**: `{ "success": true, "data": { "id": 1, "title": "New Task", ... } }`

- **Update a task**: `PATCH /tasks/:id`
    - Update an existing task.
    - **Request body**: `{ "title": "Updated Task", "description": "Updated description" }`
    - **Response**: `{ "success": true, "data": { "id": 1, "title": "Updated Task", ... } }`

- **Delete a task**: `DELETE /tasks/:id`
    - Delete a task.
    - **Response**: `{ "success": true, "message": "Deleted successfully" }`

- **Get a specific task**: `GET /tasks/:id`
    - Get details of a specific task.
    - **Response**: `{ "success": true, "data": { "id": 1, "title": "Task 1", ... } }`

## 📦 Dependencies

- 🛠️ Node.js
- ⚡ Express
- 🗄️ PostgreSQL
- 💻 Sequelize
- ✅ Validator
- 🔑 Passport
- 🔒 bcrypt
- 🗂️ express-session
- 📦 connect-pg-simple
