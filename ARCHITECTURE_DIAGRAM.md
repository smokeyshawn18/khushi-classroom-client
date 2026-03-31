# 📊 Attendance Architecture - Visual Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND APPLICATION                           │
└─────────────────────────────────────────────────────────────────────────┘

                            ┌─────────────────┐
                            │  USER SESSIONS  │
                            └────────┬────────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  │                  │                  │
              ┌───▼──┐          ┌───▼──┐          ┌───▼──┐
              │Admin │          │Teacher          │Student
              └──┬──┘           └───┬──┘          └──────┘
                 │                  │
     ┌───────────┼──────────────────┼──────────────┐
     │           │                  │              │
     ▼           ▼                  ▼              ▼
  ┌─────┐   ┌─────────┐      ┌──────────┐   ┌──────────┐
  │ADMIN│   │ FACULTY │      │ CLASSES  │   │MY PROFILE
  │PAGES│   │ PAGES   │      │  PAGES   │   │  PAGES
  └──┬──┘   └────┬────┘      └────┬─────┘   └──┬───────┘
     │           │                │            │
     │     ┌─────▼─────┐         │            │
     │     │FacultyList│         │            │
     │     └─────┬─────┘         │            │
     │           │                │            │
     │     ┌─────▼──────────┐    │            │
     │     │FacultyShow     │    │            │
     │     │(Teachers/      │    │            │
     │     │ Subjects/      │    │            │
     │     │ Departments)   │    │            │
     │     └─────┬──────────┘    │            │
     │           │                │            │
     │     ┌─────▼─────────────┐  │            │
     │     │ "View Attendance" │  │            │
     │     │ Button Link       │  │            │
     │     └─────┬─────────────┘  │            │
     │           │                │            │
     └─┬─────────┼────────────────┼───────────┬┘
       │         │                │           │
       │         ▼                ▼           │
       │    ╔════════════════════════════════╗│
       │    ║                                ║│
       │    ║   /students/show/:id           ║│
       │    ║  (Student Attendance View)    ║│
       │    ║                                ║│
       │    ║  ┌──────────────────────────┐ ║│
       │    ║  │ Profile Card             │ ║│
       │    ║  │ - Avatar                 │ ║│
       │    ║  │ - Name                   │ ║│
       │    ║  │ - Email                  │ ║│
       │    ║  └──────────────────────────┘ ║│
       │    ║                                ║│
       │    ║  ┌──────────────────────────┐ ║│
       │    ║  │ Stats Grid               │ ║│
       │    ║  │ Total | Present | Absent│ ║│
       │    ║  │ Late  | Excused | %     │ ║│
       │    ║  └──────────────────────────┘ ║│
       │    ║                                ║│
       │    ║  ┌──────────────────────────┐ ║│
       │    ║  │ Class Tabs               │ ║│
       │    ║  │[Math][Physics][Chemistry]║ ║│
       │    ║  └──────────────────────────┘ ║│
       │    ║                                ║│
       │    ║  ┌──────────────────────────┐ ║│
       │    ║  │ Attendance Table         │ ║│
       │    ║  │ Date | Status | Remarks │ ║│
       │    ║  │ ───────────────────────  │ ║│
       │    ║  │ 3/20 | Present| -       │ ║│
       │    ║  │ 3/19 | Late   | Traffic │ ║│
       │    ║  │ 3/18 | Absent | Sick    │ ║│
       │    ║  └──────────────────────────┘ ║│
       │    ║                                ║│
       │    ╚════════════════════════════════╝│
       │         ▲        ▲        ▲           │
       │         │        │        │           │
   ┌───▼─────────┤        │        └───┬───────┘
   │             │        │            │
   │        ┌────▼────────▼─────────┐  │
   │        │  Class Show Page      │  │
   │        │ - Student List        │  │
   │        │ - Status Picker       │  │
   │        │ - "Attendance" Link   │  │
   │        └──────────────────────┘  │
   │                                    │
   ▼                                    ▼
╔════════════════════╗          ╔═══════════════╗
║  /attendance       ║          ║ /attendance   ║
║  (Attendance List) ║          ║ /create       ║
║                    ║          ║ (Mark Attnd)  ║
║ - All Records      ║          ║               ║
║ - Filter by:       ║          ║ - Form        ║
║   * Class          ║          ║ - Select:     ║
║   * Student        ║          ║   * Class     ║
║   * Date           ║          ║   * Student   ║
║   * Status         ║          ║   * Date      ║
║ - Search           ║          ║   * Status    ║
║ - Pagination       ║          ║   * Remarks   ║
╚════════════════════╝          ╚═══════════════╝
```

## Data Flow

```
┌───────────────────────────────────────────────────────────────┐
│                      BACKEND API CALLS                        │
└───────────────────────────────────────────────────────────────┘

FROM StudentShow PAGE:
────────────────────
1. GET /users/:studentId
   └─ Fetch student details

2. GET /students/:studentId/classes
   └─ Fetch enrolled classes

3. GET /attendance?studentId=X&classId=Y
   ├─ Parameters:
   │  ├─ studentId: string
   │  ├─ classId: number
   │  ├─ date: optional
   │  └─ status: optional
   └─ Returns: Array of attendance records


FROM ClassShow PAGE:
───────────────────
1. GET /classes/:classId
   └─ Fetch class details

2. GET /classes/:classId/users
   └─ Fetch students (role=student filter)

3. GET /attendance?classId=X&date=Y
   └─ Fetch attendance for that day

4. POST /attendance
   ├─ Body:
   │  ├─ classId: number
   │  ├─ studentId: string
   │  ├─ date: string (YYYY-MM-DD)
   │  ├─ status: enum (present|absent|late|excused)
   │  └─ remarks: string (optional)
   └─ Returns: Created attendance record

5. PATCH /attendance/:id
   ├─ Body: { status: string, remarks?: string }
   └─ Returns: Updated attendance record


FROM AttendanceList PAGE:
────────────────────────
1. GET /attendance
   ├─ Filters (all optional):
   │  ├─ classId
   │  ├─ studentId
   │  ├─ date
   │  └─ status
   ├─ Pagination: page, limit
   └─ Returns: Paginated attendance records
```

## Component Hierarchy

```
App.tsx
├── Layout
│   ├── Sidebar
│   │   ├── Home
│   │   ├── Subjects
│   │   ├── Departments
│   │   ├── Faculty (with "users" resource)
│   │   ├── Enrollments
│   │   ├── Classes
│   │   └── Attendance
│   │
│   └── Routes
│       ├── /faculty
│       │   └── FacultyList
│       │       └── [Click Student] → Link to FacultyShow
│       │
│       ├── /faculty/show/:id
│       │   └── FacultyShow
│       │       ├── Profile Card
│       │       ├── Departments Table
│       │       ├── Subjects Table
│       │       └── Button: "View Attendance"
│       │           └─ Navigate to /students/show/:studentId
│       │
│       ├── /students/show/:id (NEW!)
│       │   └── StudentShow (NEW COMPONENT!)
│       │       ├── ShowViewHeader
│       │       ├── Profile Card
│       │       ├── Attendance Overview (Stats)
│       │       ├── Class Selection (Tabs)
│       │       ├── Attendance Table
│       │       └── Handles multiple classes
│       │
│       ├── /classes
│       │   └── ClassesList
│       │
│       ├── /classes/show/:id
│       │   └── ClassShow
│       │       ├── Banner
│       │       ├── Class Details
│       │       ├── Stats Cards
│       │       ├── Attendance Charts
│       │       ├── Student List Table
│       │       │   ├── Student Name
│       │       │   ├── Status Picker (mark attendance)
│       │       │   └── Button: "Attendance"
│       │       │       └─ Navigate to /students/show/:studentId
│       │       └── Tabs:
│       │           ├── Overview
│       │           ├── Students
│       │           └── Attendance
│       │
│       ├── /attendance
│       │   └── AttendanceList (shows all records)
│       │       ├── Search by student
│       │       ├── Filter by status
│       │       └── DataTable with pagination
│       │
│       └── /attendance/create
│           └── AttendanceCreate
│               ├── Form fields:
│               │   ├─ Class select
│               │   ├─ Student select
│               │   ├─ Date input
│               │   ├─ Status select
│               │   └─ Remarks textarea
│               └── Submit button
```

## State & Props Flow

```
StudentShow Component:
├── State:
│   ├─ selectedClassId: number (current tab)
│   └─ All other state in hooks
│
├── Hooks (Data Fetching):
│   ├─ useShow → student profile
│   ├─ useList → enrolled classes
│   └─ useList → attendance records
│
├── Computed Values:
│   ├─ currentClassId: number
│   ├─ stats: { total, present, absent, late, percentage }
│   └─ attendanceRecords: AttendanceRecord[]
│
└── Renders:
    ├─ Profile Card (from useShow data)
    ├─ Stats Grid (from computed stats)
    ├─ Class Tabs (from enrolledClasses)
    ├─ Selected Class Info (from currentClassId)
    └─ Attendance Table (from attendanceRecords)
```

## State Management Flow

```
USER INTERACTION:
1. Click "View Attendance" on Faculty page
   ↓
2. Navigate to /students/show/:studentId
   ↓
3. StudentShow component mounts
   ↓
4. useShow hook fetches student data
   └─ Set: student profile
   ↓
5. useList hook fetches enrolled classes
   └─ Set: enrolledClasses array
   └─ Set: selectedClassId = enrolledClasses[0].id (default)
   ↓
6. useList hook fetches attendance (filtered by studentId + classId)
   └─ Set: attendanceRecords array
   ↓
7. Calculate stats from attendanceRecords
   └─ Set: stats { total, present, absent, late, percentage }
   ↓
8. Render all sections with fetched data
   ↓
USER CLICKS TAB:
9. onClick → setSelectedClassId(newClassId)
   ↓
10. useList hook re-runs with new classId filter
    └─ Fetches attendance for new class
    ↓
11. Stats recalculate, table re-renders
```

## Information Architecture

```
KNOWLEDGE BASE:
├── Students
│   ├─ ID
│   ├─ Name
│   ├─ Email
│   ├─ Role
│   └─ Classes (many-to-many via enrollments)
│
├── Classes
│   ├─ ID
│   ├─ Name
│   ├─ Subject
│   ├─ Teacher
│   └─ Students (many-to-many via enrollments)
│
└── Attendance (SINGLE TABLE)
    ├─ ID
    ├─ StudentID (FK)
    ├─ ClassID (FK)
    ├─ Date
    ├─ Status (enum: present|absent|late|excused)
    └─ Remarks (optional)

VIEWS:
├─ Student View
│  ├─ Show own attendance across all classes
│  └─ Class-wise breakdown
│
├─ Teacher View
│  ├─ Show class attendance summary
│  ├─ Mark attendance per student
│  └─ View individual student attendance
│
└─ Admin View
   ├─ Show all attendance records
   ├─ Filter & search
   └─ Export/Reports
```

---

**Visual Architecture Diagram Created:** March 20, 2026
**Complexity Level:** Medium (well-structured multi-entry point system)
**Database Tables:** 1 (attendance) + relationships to students & classes
**API Endpoints Used:** 6+ core endpoints
**Frontend Components:** 3 main pages + multiple reusable components
