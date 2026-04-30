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

**Used in:**

- [src/components/refine-ui/form/sign-up-form.tsx](src/components/refine-ui/form/sign-up-form.tsx) - User registration form
- [src/pages/register/index.tsx](src/pages/register/index.tsx) - Register page

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

**Used in:**

- [src/components/refine-ui/form/sign-in-form.tsx](src/components/refine-ui/form/sign-in-form.tsx) - User login form
- [src/pages/login/index.tsx](src/pages/login/index.tsx) - Login page

### Sign Out

```http
POST /auth/sign-out
```

**Used in:**

- [src/providers/auth.ts](src/providers/auth.ts) - Auth provider logout handler
- [src/components/refine-ui/layout/layout.tsx](src/components/refine-ui/layout/layout.tsx) - Logout button in navbar

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

**Used in:**

- [src/providers/data.ts](src/providers/data.ts) - Data provider for listing users
- Faculty management pages (implied via Refine CRUD)

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

**Used in:**

- [src/pages/faculty/show.tsx](src/pages/faculty/show.tsx) - Faculty/Teacher profile details
- [src/pages/dashboard.tsx](src/pages/dashboard.tsx) - Dashboard (current user info)
- [src/components/auth-and-mutation-listener.tsx](src/components/auth-and-mutation-listener.tsx) - User authentication listener

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

**Used in:**

- [src/pages/subjects/list.tsx](src/pages/subjects/list.tsx) - Subjects list page
- [src/pages/classes/create.tsx](src/pages/classes/create.tsx) - Class creation form (subjects dropdown)
- [src/providers/data.ts](src/providers/data.ts) - Data provider for listing subjects

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

**Used in:**

- [src/pages/subjects/show.tsx](src/pages/subjects/show.tsx) - Subject details page

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

**Used in:**

- [src/pages/subjects/create.tsx](src/pages/subjects/create.tsx) - Subject creation form

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

**Used in:**

- [src/pages/departments/list.tsx](src/pages/departments/list.tsx) - Departments list page
- [src/providers/data.ts](src/providers/data.ts) - Data provider for listing departments

### Get Department Details

```http
GET /departments/:id
```

**Used in:**

- [src/pages/departments/show.tsx](src/pages/departments/show.tsx) - Department details page with subjects and classes

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

**Used in:**

- [src/pages/departments/create.tsx](src/pages/departments/create.tsx) - Department creation form

### Get Department Options (Dropdown)

```http
GET /departments/options
```

**Response:**

```json
{
  "data": [{ "id": "number", "name": "string" }]
}
```

**Used in:**

- [src/pages/subjects/list.tsx](src/pages/subjects/list.tsx) - Department filter dropdown in subjects list
- [src/pages/classes/create.tsx](src/pages/classes/create.tsx) - Subject selection form (indirectly)

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

**Used in:**

- [src/pages/classes/list.tsx](src/pages/classes/list.tsx) - Classes list page
- [src/pages/enrollments/create.tsx](src/pages/enrollments/create.tsx) - Enrollment class selection
- [src/pages/attendance/list.tsx](src/pages/attendance/list.tsx) - Class filter dropdown for attendance records
- [src/providers/data.ts](src/providers/data.ts) - Data provider for listing classes

### Get Class Details

```http
GET /classes/:id
```

**Used in:**

- [src/pages/classes/show.tsx](src/pages/classes/show.tsx) - Class details page

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

**Used in:**

- [src/pages/classes/create.tsx](src/pages/classes/create.tsx) - Class creation form

### Update Class

```http
PATCH /classes/:id
```

**Body:** (same as create, all fields optional)
**Used in:**

- [src/pages/classes/show.tsx](src/pages/classes/show.tsx) - Class editing

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

**Used in:**

- [src/pages/classes/show.tsx](src/pages/classes/show.tsx) - Display enrolled students in class

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

**Used in:**

- [src/pages/students/show.tsx](src/pages/students/show.tsx) - Student's enrolled classes list

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

**Used in:**

- [src/pages/attendance/list.tsx](src/pages/attendance/list.tsx) - Attendance records list with filters
- [src/providers/data.ts](src/providers/data.ts) - Data provider for attendance

### Get Attendance by Class & Date

```http
GET /attendance?classId=:classId&date=:date
```

**Query Parameters:**

- `classId` (number, required)
- `date` (string, required) - format: YYYY-MM-DD
  **Used in:**
- [src/pages/attendance/list.tsx](src/pages/attendance/list.tsx) - Filter attendance by class and date

### Get Attendance by Student & Class

```http
GET /attendance?studentId=:studentId&classId=:classId
```

**Query Parameters:**

- `studentId` (string, required)
- `classId` (number, required)
  **Used in:**
- [src/pages/attendance/student.tsx](src/pages/attendance/student.tsx) - Student's attendance records for a specific class

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

**Used in:**

- [src/pages/attendance/create.tsx](src/pages/attendance/create.tsx) - Mark individual attendance
- [src/pages/attendance/bulk.tsx](src/pages/attendance/bulk.tsx) - Bulk attendance marking

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

**Used in:**

- [src/pages/attendance/list.tsx](src/pages/attendance/list.tsx) - Edit attendance status
- [src/pages/attendance/student.tsx](src/pages/attendance/student.tsx) - Student can update own attendance remarks

### Delete Attendance

```http
DELETE /attendance/:id
```

**Used in:**

- [src/pages/attendance/list.tsx](src/pages/attendance/list.tsx) - Delete attendance records

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

**Used in:**

- [src/pages/attendance/student.tsx](src/pages/attendance/student.tsx) - Show daily attendance summary
- [src/components/attendance/attendance-summary-chart.tsx](src/components/attendance/attendance-summary-chart.tsx) - Display attendance chart

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

**Used in:**

- [src/pages/attendance/student.tsx](src/pages/attendance/student.tsx) - Monthly attendance view
- [src/components/attendance/monthly-attendance-chart.tsx](src/components/attendance/monthly-attendance-chart.tsx) - Monthly chart display
- [src/hooks/use-attendance-charts.ts](src/hooks/use-attendance-charts.ts) - Attendance chart data fetching

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

**Used in:**

- [src/providers/data.ts](src/providers/data.ts) - Data provider for enrollments

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

**Used in:**

- [src/pages/enrollments/create.tsx](src/pages/enrollments/create.tsx) - Enrollment creation form

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

**Used in:**

- [src/pages/enrollments/join.tsx](src/pages/enrollments/join.tsx) - Join class via invite code

---

## 📊 Summary Statistics

### HTTP Methods Distribution

| Method    | Count  |
| --------- | ------ |
| GET       | 18     |
| POST      | 7      |
| PATCH     | 2      |
| DELETE    | 1      |
| **Total** | **28** |

### Resources by Type

| Resource    | GET | POST | PATCH | DELETE |
| ----------- | --- | ---- | ----- | ------ |
| Users       | 2   | 0    | 0     | 0      |
| Subjects    | 2   | 1    | 0     | 0      |
| Departments | 3   | 1    | 0     | 0      |
| Classes     | 5   | 1    | 1     | 0      |
| Attendance  | 6   | 1    | 1     | 1      |
| Enrollments | 2   | 2    | 0     | 0      |
| Auth        | 0   | 3    | 0     | 0      |

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
  "data": {
    /* resource data */
  },
  "pagination": { "total": "number", "page": "number", "limit": "number" }
}
```

### Single Resource Response

```json
{
  "data": {
    /* single resource */
  }
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
