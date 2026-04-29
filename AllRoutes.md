# Backend Routes - Complete Reference

**Backend Base URL:** 
- Production: `https://khushieduserver.onrender.com/api/`
- Development: `http://localhost:8000/api/`

---

## 🔐 Authentication Routes

### Sign Up
```http
POST /auth/sign-up
```
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "image": "string (optional)",
  "role": "student|teacher",
  "imageCldPubId": "string (optional)",
  "teacherSecretKey": "string (optional, required if role=teacher)"
}
```

### Sign In
```http
POST /auth/sign-in
```
**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

### Sign Out
```http
POST /auth/sign-out
```

---

## 👥 Users

### List All Users
```http
GET /users
```
**Query Parameters:**
- `page` (number, optional) - default: 1
- `limit` (number, optional) - default: 10
- `search` (string, optional) - search by name or email
- `role` (string, optional) - filter by role: student|teacher|admin

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "image": "string (optional)",
      "imageCldPubId": "string (optional)"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

### Get User Details
```http
GET /users/:id
```
**Response:**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "image": "string (optional)"
  }
}
```

---

## 📚 Subjects

### List Subjects
```http
GET /subjects
```
**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `search` (string, optional) - search by name or code
- `department` (string, optional) - filter by department name

**Response:**
```json
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "code": "string",
      "description": "string",
      "departmentId": "number",
      "department": { "name": "string" }
    }
  ],
  "pagination": { "total": "number" }
}
```

### Get Subject Details
```http
GET /subjects/:id
```
**Response:**
```json
{
  "data": {
    "id": "number",
    "name": "string",
    "code": "string",
    "description": "string",
    "departmentId": "number",
    "department": { "id": "number", "name": "string" }
  }
}
```

### Create Subject
```http
POST /subjects
```
**Body:**
```json
{
  "name": "string (min 3 chars)",
  "code": "string (min 3 chars)",
  "description": "string (min 5 chars)",
  "departmentId": "number"
}
```

---

## 🏢 Departments

### List Departments
```http
GET /departments
```
**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `search` (string, optional) - search by name or code

**Response:**
```json
{
  "data": [
    {
      "id": "number",
      "code": "string",
      "name": "string",
      "description": "string"
    }
  ],
  "pagination": { "total": "number" }
}
```

### Get Department Details
```http
GET /departments/:id
```

### Create Department
```http
POST /departments
```
**Body:**
```json
{
  "code": "string (min 2 chars)",
  "name": "string (min 3 chars)",
  "description": "string (min 5 chars)"
}
```

### Get Department Options (Dropdown)
```http
GET /departments/options
```
**Response:**
```json
{
  "data": [
    { "id": "number", "name": "string" }
  ]
}
```

---

## 📖 Classes

### List Classes
```http
GET /classes
```
**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `search` (string, optional)
- `subject` (string, optional) - filter by subject ID
- `teacher` (string, optional) - filter by teacher ID

**Response:**
```json
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "status": "active|inactive",
      "bannerUrl": "string (optional)",
      "capacity": "number",
      "subjectId": "number",
      "subject": { "name": "string" },
      "teacherId": "string",
      "teacher": { "name": "string" }
    }
  ],
  "pagination": { "total": "number" }
}
```

### Get Class Details
```http
GET /classes/:id
```

### Create Class
```http
POST /classes
```
**Body:**
```json
{
  "name": "string",
  "subjectId": "number",
  "teacherId": "string",
  "capacity": "number",
  "status": "active|inactive",
  "bannerUrl": "string (optional)",
  "bannerCldPubId": "string (optional)"
}
```

### Update Class
```http
PATCH /classes/:id
```
**Body:** (same as create, all fields optional)

### Get Students in Class
```http
GET /classes/:classId/users
```
**Query Parameters:**
- `role` (string, optional) - default: "student"
- `page` (number, optional)
- `limit` (number, optional)

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  ]
}
```

### Get Classes for Student
```http
GET /students/:studentId/classes
```
**Response:**
```json
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "subject": { "name": "string" },
      "teacher": { "name": "string" }
    }
  ]
}
```

---

## 📋 Attendance

### List Attendance Records
```http
GET /attendance
```
**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `classId` (number, optional)
- `studentId` (string, optional)
- `date` (string, optional) - format: YYYY-MM-DD
- `status` (string, optional) - present|absent|late|excused

**Response:**
```json
{
  "data": [
    {
      "id": "number",
      "studentId": "string",
      "classId": "number",
      "date": "string (YYYY-MM-DD)",
      "status": "present|absent|late|excused",
      "remarks": "string (optional)",
      "student": { "id": "string", "name": "string", "email": "string" },
      "class": { "id": "number", "name": "string" }
    }
  ],
  "pagination": { "total": "number" }
}
```

### Get Attendance by Class & Date
```http
GET /attendance?classId=:classId&date=:date
```
**Query Parameters:**
- `classId` (number, required)
- `date` (string, required) - format: YYYY-MM-DD

### Get Attendance by Student & Class
```http
GET /attendance?studentId=:studentId&classId=:classId
```
**Query Parameters:**
- `studentId` (string, required)
- `classId` (number, required)

### Create Attendance
```http
POST /attendance
```
**Body:**
```json
{
  "classId": "number",
  "studentId": "string",
  "date": "string (YYYY-MM-DD)",
  "status": "present|absent|late|excused",
  "remarks": "string (optional)"
}
```

### Update Attendance
```http
PATCH /attendance/:id
```
**Body:**
```json
{
  "status": "present|absent|late|excused",
  "remarks": "string (optional)"
}
```

### Delete Attendance
```http
DELETE /attendance/:id
```

### Get Daily Summary (by Date)
```http
GET /attendance/class/:classId/summary?date=:date
```
**Query Parameters:**
- `classId` (number, required)
- `date` (string, required) - format: YYYY-MM-DD

**Response:**
```json
{
  "data": {
    "classId": "number",
    "date": "string",
    "byStatus": {
      "present": "number",
      "absent": "number",
      "late": "number",
      "excused": "number"
    },
    "total": "number"
  }
}
```

### Get Monthly Summary
```http
GET /attendance/class/:classId/summary/month?year=:year&month=:month
```
**Query Parameters:**
- `classId` (number, required)
- `year` (number, required) - e.g., 2024
- `month` (number, required) - 1-12

**Response:**
```json
{
  "data": {
    "classId": "number",
    "year": "number",
    "month": "number",
    "days": [
      {
        "date": "string",
        "byStatus": { "present": "number", "absent": "number", ... },
        "total": "number"
      }
    ]
  }
}
```

---

## 📝 Enrollments

### List Enrollments
```http
GET /enrollments
```
**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `classId` (number, optional)

**Response:**
```json
{
  "data": [
    {
      "id": "number",
      "classId": "number",
      "studentId": "string",
      "enrolledAt": "string (ISO date)",
      "class": { "id": "number", "name": "string" },
      "student": { "id": "string", "name": "string", "email": "string" }
    }
  ],
  "pagination": { "total": "number" }
}
```

### Enroll Student in Class
```http
POST /enrollments
```
**Body:**
```json
{
  "classId": "number",
  "studentId": "string"
}
```

### Join Class by Invite Code
```http
POST /enrollments/join
```
**Body:**
```json
{
  "inviteCode": "string (min 3 chars)",
  "studentId": "string"
}
```

---

## 📊 Summary Statistics

### HTTP Methods Distribution
| Method | Count |
|--------|-------|
| GET | 18 |
| POST | 7 |
| PATCH | 2 |
| DELETE | 1 |
| **Total** | **28** |

### Resources by Type
| Resource | GET | POST | PATCH | DELETE |
|----------|-----|------|-------|--------|
| Users | 2 | 0 | 0 | 0 |
| Subjects | 2 | 1 | 0 | 0 |
| Departments | 3 | 1 | 0 | 0 |
| Classes | 5 | 1 | 1 | 0 |
| Attendance | 6 | 1 | 1 | 1 |
| Enrollments | 2 | 2 | 0 | 0 |
| Auth | 0 | 3 | 0 | 0 |

---

## 🔗 Resource Relationships

```
Users (1)
├── (1:N) Classes (as teacher)
├── (M:N) Enrollments (as student)
└── (M:N) Attendance (as student)

Departments (1)
└── (1:N) Subjects

Subjects (1)
└── (1:N) Classes

Classes (1)
├── (1:N) Enrollments
├── (1:N) Attendance
└── (M) Users (students)

Enrollments (joins)
├── Student (User)
└── Class

Attendance (joins)
├── Student (User)
└── Class
```

---

## 🔑 Common Response Format

### Success Response
```json
{
  "data": { /* resource data */ },
  "pagination": { "total": "number", "page": "number", "limit": "number" }
}
```

### Single Resource Response
```json
{
  "data": { /* single resource */ }
}
```

### Error Response
```json
{
  "error": {
    "message": "string",
    "code": "string (optional)"
  }
}
```

---

## 🛡️ Authentication & Authorization

- **Auth Method:** Cookie-based (credentials: "include" on all requests)
- **Protected:** All routes require authentication except `/auth/sign-up` and `/auth/sign-in`
- **Role-based Access:**
  - `student` - can view own profile, classes, attendance
  - `teacher` - can manage classes, mark attendance
  - `admin` - full access to all resources
