import { Search, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import {
  useDelete as useDeleteMutation,
  useGetIdentity,
  useList,
} from "@refinedev/core";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { useCanCreate } from "@/hooks/use-can-create";
import type { User } from "@/types";

type AttendanceRecord = {
  id: number;
  studentId: string;
  classId: number;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  student?: {
    name: string;
    email: string;
  };
  class?: {
    name: string;
  };
};

const AttendanceList = () => {
  const { data: currentUser } = useGetIdentity<User>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const canCreate = useCanCreate();
  const isStudent = currentUser?.role === "student";
  const { mutate: deleteAttendance } = useDeleteMutation();

  // Fetch all classes for filter dropdown
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
        id: "studentName",
        accessorKey: "student.name",
        size: 200,
        header: () => <p className="column-title">Student</p>,
        cell: ({ getValue }) => (
          <span className="text-foreground">{getValue<string>()}</span>
        ),
        filterFn: "includesString",
      },
      {
        id: "studentEmail",
        accessorKey: "student.email",
        size: 240,
        header: () => <p className="column-title">Email</p>,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground text-sm">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: "className",
        accessorKey: "class.name",
        size: 200,
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
      {
        id: "actions",
        size: 140,
        header: () => <p className="column-title">Actions</p>,
        cell: ({ row }) => (
          <div className="flex gap-2">
            {!isStudent && canCreate && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  deleteAttendance({
                    resource: "attendance",
                    id: row.original.id,
                  });
                }}
              >
                Delete
              </Button>
            )}
          </div>
        ),
      },
    ],
    [canCreate, deleteAttendance, isStudent]
  );

  const searchFilters = searchQuery
    ? [
        {
          field: "student.name",
          operator: "contains" as const,
          value: searchQuery,
        },
      ]
    : [];

  const statusFilters =
    selectedStatus === "all"
      ? []
      : [
          {
            field: "status",
            operator: "eq" as const,
            value: selectedStatus,
          },
        ];

  // Students can only see their own attendance
  const studentFilters = isStudent
    ? [
        {
          field: "studentId",
          operator: "eq" as const,
          value: currentUser?.id ?? "",
        },
      ]
    : [];

  // Class filter for both students and teachers/admins
  const classFilters =
    selectedClass === "all"
      ? []
      : [
          {
            field: "classId",
            operator: "eq" as const,
            value: Number(selectedClass),
          },
        ];

  const attendanceTable = useTable<AttendanceRecord>({
    columns: attendanceColumns,
    refineCoreProps: {
      resource: "attendance",
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      filters: {
        permanent: [
          ...studentFilters,
          ...classFilters,
          ...searchFilters,
          ...statusFilters,
        ],
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

  const handleExportCSV = () => {
    // TODO: Implement CSV export functionality
    console.log("Exporting attendance records to CSV...");
  };

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Attendance Records</h1>

      <div className="intro-row">
        <p>
          {isStudent
            ? "View your attendance records."
            : "View and manage all attendance records."}
        </p>

        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder={
                isStudent
                  ? "Search by class name..."
                  : "Search by student name..."
              }
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
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

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>

            {!isStudent && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="flex items-center gap-2"
              >
                <Download className="size-4" />
                Export
              </Button>
            )}
          </div>
        </div>
      </div>

      <DataTable table={attendanceTable} />
    </ListView>
  );
};

export default AttendanceList;
