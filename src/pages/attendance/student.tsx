import { Search, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { useGetIdentity, useList } from "@refinedev/core";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import type { User } from "@/types";

type AttendanceRecord = {
  id: number;
  studentId: string;
  classId: number;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  class?: {
    name: string;
    subject?: {
      name: string;
    };
  };
};

const StudentAttendance = () => {
  const { data: currentUser } = useGetIdentity<User>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Fetch all classes to filter attendance
  const { query: classesQuery } = useList({
    resource: "classes",
    pagination: {
      pageSize: 100,
    },
  });

  const classes = (classesQuery.data?.data ?? []) as any[];

  const attendanceColumns = useMemo<ColumnDef<AttendanceRecord>[]>(
    () => [
      {
        id: "date",
        accessorKey: "date",
        size: 120,
        header: () => <p className="column-title">Date</p>,
        cell: ({ getValue }) => {
          const date = getValue<string>();
          return (
            <span className="text-foreground">
              {new Date(date).toLocaleDateString()}
            </span>
          );
        },
      },
      {
        id: "className",
        accessorKey: "class.name",
        size: 220,
        header: () => <p className="column-title">Class</p>,
        cell: ({ getValue }) => {
          const className = getValue<string>();
          return className ? (
            <Badge variant="secondary">{className}</Badge>
          ) : (
            <span className="text-muted-foreground">Not assigned</span>
          );
        },
      },
      {
        id: "subject",
        accessorKey: "class.subject.name",
        size: 200,
        header: () => <p className="column-title">Subject</p>,
        cell: ({ getValue }) => {
          const subject = getValue<string>();
          return subject ? (
            <span className="text-foreground">{subject}</span>
          ) : (
            <span className="text-muted-foreground">Not assigned</span>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        size: 140,
        header: () => <p className="column-title">Status</p>,
        cell: ({ getValue }) => {
          const status = getValue<string>();
          const variants: Record<
            string,
            "default" | "secondary" | "destructive" | "outline"
          > = {
            present: "default",
            absent: "destructive",
            late: "secondary",
            excused: "outline",
          };
          return (
            <Badge variant={variants[status] || "outline"}>{status}</Badge>
          );
        },
      },
    ],
    []
  );

  const searchFilters = searchQuery
    ? [
        {
          field: "class.name",
          operator: "contains" as const,
          value: searchQuery,
        },
      ]
    : [];

  const classFilters =
    selectedClass === "all"
      ? []
      : [
          {
            field: "classId",
            operator: "eq" as const,
            value: selectedClass,
          },
        ];

  const studentIdFilters = currentUser?.id
    ? [
        {
          field: "studentId",
          operator: "eq" as const,
          value: currentUser.id,
        },
      ]
    : [];

  const attendanceTable = useTable<AttendanceRecord>({
    columns: attendanceColumns,
    refineCoreProps: {
      resource: "attendance",
      pagination: {
        pageSize: 20,
        mode: "server",
      },
      filters: {
        permanent: [...studentIdFilters, ...classFilters, ...searchFilters],
      },
      sorters: {
        initial: [
          {
            field: "date",
            order: "desc",
          },
        ],
      },
    },
  });

  // Fetch all attendance records for the student to calculate stats
  const { result: allAttendanceResult } = useList<AttendanceRecord>({
    resource: "attendance",
    filters: currentUser?.id
      ? [
          {
            field: "studentId",
            operator: "eq" as const,
            value: currentUser.id,
          },
        ]
      : [],
    pagination: {
      pageSize: 1000,
    },
    queryOptions: {
      enabled: Boolean(currentUser?.id),
    },
  });

  const allAttendanceRecords = allAttendanceResult?.data ?? [];

  // Calculate attendance statistics
  const stats = useMemo(() => {
    const total = allAttendanceRecords.length;
    const present = allAttendanceRecords.filter(
      (r: AttendanceRecord) => r.status === "present"
    ).length;
    const absent = allAttendanceRecords.filter(
      (r: AttendanceRecord) => r.status === "absent"
    ).length;
    const late = allAttendanceRecords.filter(
      (r: AttendanceRecord) => r.status === "late"
    ).length;
    const excused = allAttendanceRecords.filter(
      (r: AttendanceRecord) => r.status === "excused"
    ).length;

    return {
      total,
      present,
      absent,
      late,
      excused,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  }, [allAttendanceRecords]);

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">My Attendance</h1>

      <div className="intro-row">
        <p>View your attendance records across all classes.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.present}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.absent}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Late
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.late}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600">
              Attendance %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">
                {stats.percentage}%
              </div>
              <TrendingUp className="size-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <div className="intro-row">
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search by class name..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All Classes</option>
            {classes.map((classItem: any) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <DataTable table={attendanceTable} />
    </ListView>
  );
};

export default StudentAttendance;
