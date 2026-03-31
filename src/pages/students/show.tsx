import { useShow, useList } from "@refinedev/core";
import { useMemo, useState } from "react";
import { useParams } from "react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShowViewHeader,
  ShowView,
} from "@/components/refine-ui/views/show-view";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@/types";

interface ClassEnrollment {
  id: number;
  name: string;
  code?: string;
  subject?: {
    id: number;
    name: string;
    code: string;
  };
  teacher?: {
    id: string;
    name: string;
  };
}

interface AttendanceRecord {
  id: number;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string | null;
  classId: number;
}

interface ClassAttendanceStats {
  classId: number;
  className: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

const StudentShow = () => {
  const { id } = useParams();
  const studentId = id ?? "";
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const { query: studentQuery } = useShow<User>({
    resource: "users",
  });

  const student = studentQuery.data?.data;

  // Get enrolled classes
  const { query: classesQuery } = useList<ClassEnrollment>({
    resource: `students/${studentId}/classes`,
    pagination: { pageSize: 100, mode: "off" },
    queryOptions: {
      enabled: Boolean(studentId),
    },
  });

  const enrolledClasses = classesQuery.data?.data ?? [];
  const currentClassId = selectedClassId ?? enrolledClasses[0]?.id;

  // Get attendance for selected class
  const { query: attendanceQuery } = useList<AttendanceRecord>({
    resource: "attendance",
    filters: [
      { field: "studentId", operator: "eq", value: studentId },
      {
        field: "classId",
        operator: "eq",
        value: currentClassId ? String(currentClassId) : "",
      },
    ],
    pagination: { pageSize: 100, mode: "off" },
    queryOptions: {
      enabled: Boolean(studentId && currentClassId),
    },
  });

  const attendanceRecords = attendanceQuery.data?.data ?? [];

  // Calculate stats
  const stats = useMemo(() => {
    const records = attendanceRecords;
    const total = records.length;

    if (total === 0) {
      return {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        percentage: 0,
      };
    }

    const counts = records.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const present = counts["present"] || 0;
    const percentage = Math.round((present / total) * 100);

    return {
      total,
      present,
      absent: counts["absent"] || 0,
      late: counts["late"] || 0,
      excused: counts["excused"] || 0,
      percentage,
    };
  }, [attendanceRecords]);

  // Calculate overall stats across all classes
  const overallStats = useMemo(() => {
    if (enrolledClasses.length === 0) return null;

    // This would require fetching all attendance for all classes
    // For now, we'll calculate for the current class
    return stats;
  }, [stats, enrolledClasses]);

  const attendanceColumns = useMemo<ColumnDef<AttendanceRecord>[]>(
    () => [
      {
        id: "date",
        accessorKey: "date",
        size: 140,
        header: () => <p className="column-title">Date</p>,
        cell: ({ getValue }) => {
          const date = getValue<string>();
          return (
            <span className="font-medium">
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
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
          const statusConfig = {
            present: {
              variant: "default" as const,
              bgColor: "bg-green-100",
              textColor: "text-green-800",
            },
            absent: {
              variant: "destructive" as const,
              bgColor: "bg-red-100",
              textColor: "text-red-800",
            },
            late: {
              variant: "secondary" as const,
              bgColor: "bg-yellow-100",
              textColor: "text-yellow-800",
            },
            excused: {
              variant: "outline" as const,
              bgColor: "bg-blue-100",
              textColor: "text-blue-800",
            },
          };

          const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.absent;

          return (
            <Badge variant={config.variant} className="capitalize">
              {status}
            </Badge>
          );
        },
      },
      {
        id: "remarks",
        accessorKey: "remarks",
        size: 250,
        header: () => <p className="column-title">Remarks</p>,
        cell: ({ getValue }) => {
          const remarks = getValue<string | null>();
          return remarks ? (
            <span className="text-sm text-muted-foreground">{remarks}</span>
          ) : (
            <span className="text-xs text-muted-foreground italic">-</span>
          );
        },
      },
    ],
    []
  );

  const attendanceTable = useTable<AttendanceRecord>({
    columns: attendanceColumns,
    refineCoreProps: {
      resource: "attendance",
      filters: {
        permanent: [
          { field: "studentId", operator: "eq", value: studentId },
          {
            field: "classId",
            operator: "eq",
            value: currentClassId ? String(currentClassId) : "",
          },
        ],
      },
      pagination: { pageSize: 20, mode: "server" },
      sorters: { initial: [{ field: "date", order: "desc" }] },
    },
  });

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
    return `${parts[0][0] ?? ""}${
      parts[parts.length - 1][0] ?? ""
    }`.toUpperCase();
  };

  if (studentQuery.isLoading || studentQuery.isError || !student) {
    return (
      <ShowView className="student-view">
        <ShowViewHeader resource="users" title="Student Details" />
        <p className="text-sm text-muted-foreground">
          {studentQuery.isLoading
            ? "Loading student details..."
            : studentQuery.isError
            ? "Failed to load student details."
            : "Student details not found."}
        </p>
      </ShowView>
    );
  }

  return (
    <ShowView className="student-view space-y-6">
      <ShowViewHeader resource="users" title={student.name} />

      {/* Student Profile Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile</CardTitle>
          <Badge variant="default">{student.role}</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-12">
              {student.image && (
                <AvatarImage src={student.image} alt={student.name} />
              )}
              <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{student.name}</p>
              <p className="text-sm text-muted-foreground">{student.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Overview */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Days</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats.present}
              </p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              <p className="text-xs text-muted-foreground">Late</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {stats.percentage}%
              </p>
              <p className="text-xs text-muted-foreground">Percentage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance by Class */}
      {enrolledClasses.length > 0 ? (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrolledClasses.length > 1 && (
              <div>
                <p className="text-sm font-medium mb-2">Select Class:</p>
                <Tabs
                  value={String(currentClassId)}
                  onValueChange={(value) => setSelectedClassId(Number(value))}
                  className="w-full"
                >
                  <TabsList className="grid w-full gap-2 grid-cols-2 lg:grid-cols-4">
                    {enrolledClasses.map((cls) => (
                      <TabsTrigger
                        key={cls.id}
                        value={String(cls.id)}
                        className="text-xs"
                      >
                        <span className="truncate">{cls.name}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}

            {enrolledClasses.length === 1 && (
              <p className="text-sm font-medium text-muted-foreground">
                Class: {enrolledClasses[0]?.name}
              </p>
            )}

            {attendanceRecords.length > 0 ? (
              <DataTable table={attendanceTable} paginationVariant="simple" />
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No attendance records found for this class yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This student is not enrolled in any classes yet.
            </p>
          </CardContent>
        </Card>
      )}
    </ShowView>
  );
};

export default StudentShow;
