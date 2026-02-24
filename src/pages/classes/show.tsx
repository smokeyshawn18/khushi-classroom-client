import { AdvancedImage } from "@cloudinary/react";
import {
  useShow,
  useCreate,
  useUpdate,
  useGetIdentity,
  useList,
  useInvalidate,
} from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useCallback } from "react";
import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/refine-ui/views/show-view";
import { AttendanceStatusPicker } from "@/components/attendance/attendance-status-picker";
import { AttendanceSummaryChart } from "@/components/attendance/attendance-summary-chart";
import { MonthlyAttendanceChart } from "@/components/attendance/monthly-attendance-chart";
import type { AttendanceStatus } from "@/components/attendance/attendance-status-picker";
import {
  useAttendanceMonthly,
  useAttendanceSummary,
} from "@/hooks/use-attendance-charts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { bannerPhoto } from "@/lib/cloudinary";
import { ClassDetails } from "@/types";

type ClassUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
};

type AttendanceRecord = {
  id: number;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string | null;
  student?: { id: string; name: string; email: string };
};

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return `${parts[0][0] ?? ""}${
    parts[parts.length - 1][0] ?? ""
  }`.toUpperCase();
}

const ClassesShow = () => {
  const { id } = useParams();
  const classId = id ?? "";
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );

  const invalidate = useInvalidate();
  const queryClient = useQueryClient();
  const { query } = useShow<ClassDetails>({ resource: "classes" });
  const classDetails = query.data?.data;

  const { data: authData } = useGetIdentity();
  const userRole = (authData as { role?: string })?.role ?? "student";
  const isTeacherOrAdmin = userRole === "teacher" || userRole === "admin";

  const { result, query: attendanceQuery } = useList<AttendanceRecord>({
    resource: "attendance",
    filters: [
      {
        field: "classId",
        operator: "eq",
        value: classId ? Number(classId) : "",
      },
      { field: "date", operator: "eq", value: selectedDate },
    ],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: Boolean(classId) && isTeacherOrAdmin,
    },
  });

  const attendanceRecords = result?.data ?? [];
  const [chartMonth, setChartMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [chartYear, chartMonthNum] = useMemo(() => {
    const [y, m] = chartMonth.split("-").map(Number);
    const now = new Date();
    return [
      Number.isFinite(y) ? y : now.getFullYear(),
      Number.isFinite(m) && m >= 1 && m <= 12 ? m : now.getMonth() + 1,
    ];
  }, [chartMonth]);

  const { data: summaryData } = useAttendanceSummary(
    classId,
    selectedDate,
    isTeacherOrAdmin
  );
  const { data: monthlyData } = useAttendanceMonthly(
    classId,
    chartYear,
    chartMonthNum,
    isTeacherOrAdmin
  );

  const attendanceByStudent = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const r of attendanceRecords) {
      map.set(r.studentId, r);
    }
    return map;
  }, [attendanceRecords]);

  const { mutate: createAttendance } = useCreate();
  const { mutate: updateAttendance } = useUpdate();

  const handleMarkAttendance = useCallback(
    (studentId: string, status: AttendanceStatus) => {
      const existing = attendanceByStudent.get(studentId);

      const onSuccess = () => {
        invalidate({ resource: "attendance", invalidates: ["list"] });
        queryClient.invalidateQueries({ queryKey: ["attendance"] });
        void attendanceQuery.refetch();
      };

      if (existing) {
        updateAttendance(
          {
            resource: "attendance",
            id: existing.id,
            values: { status },
          },
          { onSuccess }
        );
      } else {
        createAttendance(
          {
            resource: "attendance",
            values: {
              classId: Number(classId),
              studentId,
              date: selectedDate,
              status,
            },
          },
          { onSuccess }
        );
      }
    },
    [
      attendanceByStudent,
      classId,
      selectedDate,
      createAttendance,
      updateAttendance,
      invalidate,
      queryClient,
      attendanceQuery,
    ]
  );

  const studentColumns = useMemo<ColumnDef<ClassUser>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        size: 240,
        header: () => <p className="column-title">Student</p>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              {row.original.image && (
                <AvatarImage src={row.original.image} alt={row.original.name} />
              )}
              <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="truncate">{row.original.name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {row.original.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "details",
        size: 200,
        header: () => <p className="column-title">Details</p>,
        cell: ({ row }) => {
          const student = row.original;
          const record = attendanceByStudent.get(student.id);

          return (
            <div className="flex items-center gap-2">
              <ShowButton
                resource="users"
                recordItemId={student.id}
                variant="outline"
                size="sm"
              >
                View
              </ShowButton>
              {isTeacherOrAdmin && (
                <AttendanceStatusPicker
                  value={record?.status ?? null}
                  onChange={(status) =>
                    handleMarkAttendance(student.id, status)
                  }
                />
              )}
            </div>
          );
        },
      },
    ],
    [attendanceByStudent, isTeacherOrAdmin, handleMarkAttendance]
  );

  const studentsTable = useTable<ClassUser>({
    columns: studentColumns,
    refineCoreProps: {
      resource: `classes/${classId}/users`,
      pagination: { pageSize: 10, mode: "server" },
      filters: {
        permanent: [{ field: "role", operator: "eq", value: "student" }],
      },
    },
  });

  if (query.isLoading || query.isError || !classDetails) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title="Class Details" />
        <p className="state-message">
          {query.isLoading
            ? "Loading class details..."
            : query.isError
            ? "Failed to load class details."
            : "Class details not found."}
        </p>
      </ShowView>
    );
  }

  const teacherName = classDetails.teacher?.name ?? "Unknown";
  const teacherInitials = teacherName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(
    teacherInitials || "NA"
  )}`;

  return (
    <ShowView className="class-view class-show space-y-6">
      <ShowViewHeader resource="classes" title="Class Details" />

      <div className="banner">
        {classDetails.bannerUrl ? (
          classDetails.bannerUrl.includes("res.cloudinary.com") &&
          classDetails.bannerCldPubId ? (
            <AdvancedImage
              cldImg={bannerPhoto(
                classDetails.bannerCldPubId ?? "",
                classDetails.name
              )}
              alt="Class Banner"
            />
          ) : (
            <img
              src={classDetails.bannerUrl}
              alt={classDetails.name}
              loading="lazy"
            />
          )
        ) : (
          <div className="placeholder" />
        )}
      </div>

      <Card className="details-card">
        <div>
          <div className="details-header">
            <div>
              <h1>{classDetails.name}</h1>
              <p>{classDetails.description}</p>
            </div>
            <div>
              <Badge variant="outline">{classDetails.capacity} spots</Badge>
              <Badge
                variant={
                  classDetails.status === "active" ? "default" : "secondary"
                }
                data-status={classDetails.status}
              >
                {classDetails.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="details-grid">
            <div className="instructor">
              <p>👨‍🏫 Instructor</p>
              <div>
                <img
                  src={classDetails.teacher?.image ?? placeholderUrl}
                  alt={teacherName}
                />
                <div>
                  <p>{teacherName}</p>
                  <p>{classDetails?.teacher?.email}</p>
                </div>
              </div>
            </div>

            <div className="department">
              <p>🏛️ Department</p>
              <div>
                <p>{classDetails?.department?.name}</p>
                <p>{classDetails?.department?.description}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="subject">
          <p>📚 Subject</p>
          <div>
            <Badge variant="outline">
              Code: <span>{classDetails?.subject?.code}</span>
            </Badge>
            <p>{classDetails?.subject?.name}</p>
            <p>{classDetails?.subject?.description}</p>
          </div>
        </div>

        <Separator />

        <div className="join">
          <h2>🎓 Join Class</h2>
          <ol>
            <li>Ask your teacher for the invite code.</li>
            <li>Click on &quot;Join Class&quot; button.</li>
            <li>Paste the code and click &quot;Join&quot;</li>
          </ol>
        </div>

        <Button size="lg" className="w-full">
          Join Class
        </Button>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Enrolled Students</CardTitle>
          {isTeacherOrAdmin && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          )}
        </CardHeader>
        <CardContent>
          {isTeacherOrAdmin && (
            <p className="text-xs text-muted-foreground mb-4">
              Mark attendance for {selectedDate} using the status picker next to
              each student.
            </p>
          )}
          <DataTable table={studentsTable} paginationVariant="simple" />
        </CardContent>
      </Card>

      {isTeacherOrAdmin && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Attendance summary</CardTitle>
              <span className="text-sm text-muted-foreground">
                {selectedDate}
              </span>
            </CardHeader>
            <CardContent>
              {summaryData ? (
                <AttendanceSummaryChart
                  byStatus={summaryData.byStatus}
                  total={summaryData.total}
                />
              ) : (
                <div className="flex h-56 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
                  Loading…
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Monthly attendance</CardTitle>
              <input
                type="month"
                value={chartMonth}
                onChange={(e) => setChartMonth(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </CardHeader>
            <CardContent>
              {monthlyData ? (
                <MonthlyAttendanceChart days={monthlyData.days ?? []} />
              ) : (
                <div className="flex h-72 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
                  Loading…
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </ShowView>
  );
};

export default ClassesShow;
