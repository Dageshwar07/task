
# 🛡️ Node.js MySQL OpenFGA CRUD API

This project is a **Node.js backend application** that implements **CRUD operations** using **MySQL** with **fine-grained access control** powered by **OpenFGA**.

---

## ✅ Features

- 🔐 **User Authentication**  
  - Register, login, update profile

- 📁 **Resource Management**  
  - Create, read, update, delete

- 🧩 **OpenFGA Authorization**  
  - Role- and relationship-based access control  
  - Share/unshare resources with specific users and permissions

- 📦 **RESTful API with JWT Auth**

---

## 🧠 OpenFGA Authorization Model

```fga
model
  schema 1.1

type user

type group
  relations
    define member: [user]

type resource
  relations
    define owner: [user]
    define editor: [user, group#member]
    define viewer: [user, group#member]

    define can_change_owner: owner
    define can_delete: owner
    define can_read: viewer or editor or owner
    define can_write: editor or owner
```

---

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/node-openfga-crud-api.git
cd node-openfga-crud-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Then update `.env` with your details:

```
PORT=4000
JWT_SECRET=your_jwt_secret

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=openfga_demo

OPENFGA_API_URL=http://localhost:8080
OPENFGA_STORE_ID=your_store_id
OPENFGA_MODEL_ID=your_model_id
```

---

## 🛠️ MySQL Database

### Create Database

```sql
CREATE DATABASE openfga_demo;
USE openfga_demo;
```

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Resources Table

```sql
CREATE TABLE resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  type VARCHAR(100),
  content TEXT,
  owner_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🚀 OpenFGA Setup

### 1. Download OpenFGA

```bash
wget https://github.com/openfga/openfga/releases/download/v1.4.3/openfga_1.4.3_linux_amd64.tar.gz
```

### 2. Extract & Run

```bash
tar -xzf openfga_1.4.3_linux_amd64.tar.gz
cd openfga_1.4.3_linux_amd64
./openfga run
```

### 3. Check if Running

```bash
curl http://localhost:8080/healthz
```

### 4. Migrate OpenFGA DB

```bash
openfga migrate   --datastore-engine mysql   --datastore-uri 'root:yourpassword@tcp(localhost:3306)/openfga?parseTime=true'
```

### 5. Run with MySQL

```bash
openfga run   --datastore-engine mysql   --datastore-uri 'root:yourpassword@tcp(localhost:3306)/openfga?parseTime=true'
```

---

## 🔁 API Endpoints

| Method | Endpoint                          | Description                            | Auth |
|--------|-----------------------------------|----------------------------------------|------|
| POST   | `/api/auth/register`              | Register a new user                    | ❌   |
| POST   | `/api/auth/login`                 | Login user and get token               | ❌   |
| GET    | `/api/auth/profile`               | Get logged-in user info                | ✅   |
| PUT    | `/api/auth/update`                | Update profile                         | ✅   |
| PUT    | `/api/auth/password`              | Change password                        | ✅   |
| POST   | `/api/resources`                  | Create resource                        | ✅   |
| GET    | `/api/resources`                  | Get all accessible resources           | ✅   |
| GET    | `/api/resources/:id`              | Get resource by ID                     | ✅   |
| PUT    | `/api/resources/:id`              | Update resource                        | ✅   |
| DELETE | `/api/resources/:id`              | Delete resource                        | ✅   |
| POST   | `/api/resources/:id/share`        | Share with user (read/write/delete)    | ✅   |
| DELETE | `/api/resources/:id/share/:userId`| Remove user access                     | ✅   |

---

## 📮 Postman Collection

A complete collection is provided in the root directory:

📁 `postman/Node-OpenFGA-API.postman_collection.json`

**Import it into Postman** and use the following:

- Set the `{{baseUrl}}` environment variable (e.g., `http://localhost:4000`)
- Use `{{token}}` for JWT from login response

---

## 🔐 Example Share Resource Request

**Endpoint**:  
`POST /api/resources/:id/share`

**Headers**:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body**:
```json
{
  "userId": 2,
  "permission": "read"
}
```

---

## 🧹 Delete Data Without Dropping Tables

Run in MySQL:
```sql
DELETE FROM resources;
DELETE FROM users;
```

---

## 📦 Tech Stack

- Node.js + Express
- MySQL
- OpenFGA
- JWT Auth
- Axios
- Postman (for testing)

---

## 📞 Support

Need help?  
- 💬 Open an issue on GitHub  
- 🛠️ PRs and contributions welcome!

---

> Built by Dageshwar Das 🛠️
