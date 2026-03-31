import { useState, useCallback } from "react";
import { useCreate, useList } from "@refinedev/core";
import { useNavigate } from "react-router";

import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { ClassDetails, User } from "@/types";

type AttendanceStatus = "present" | "absent" | "late" | "excused";
type StudentAttendance = {
  studentId: string;
  name: string;
  status: AttendanceStatus;
};

const BulkAttendance = () => {
  const navigate = useNavigate();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [studentAttendance, setStudentAttendance] = useState<
    StudentAttendance[]
  >([]);

  const {
    mutate: bulkCreateAttendance,
    mutation: { isPending },
  } = useCreate();

  // Fetch all classes
  const { query: classesQuery } = useList<ClassDetails>({
    resource: "classes",
    pagination: {
      pageSize: 100,
    },
  });

  const classes = classesQuery.data?.data ?? [];
  const classesLoading = classesQuery.isLoading;

  // Fetch students for selected class
  const { query: enrollmentsQuery } = useList({
    resource: "enrollments",
    filters: [
      {
        field: "classId",
        operator: "eq" as const,
        value: selectedClassId ? Number(selectedClassId) : "",
      },
    ],
    pagination: {
      pageSize: 100,
    },
    queryOptions: {
      enabled: Boolean(selectedClassId),
    },
  });

  const enrollments = enrollmentsQuery.data?.data ?? [];
  const enrollmentsLoading = enrollmentsQuery.isLoading;

  // Initialize attendance when class is selected
  const handleClassSelect = useCallback(
    (classId: string) => {
      setSelectedClassId(classId);

      // Reset attendance records for new class
      if (enrollments && enrollments.length > 0) {
        const newRecords = enrollments.map((enrollment: any) => ({
          studentId: enrollment.studentId,
          name: enrollment.student?.name || "Unknown",
          status: "present" as AttendanceStatus,
        }));
        setStudentAttendance(newRecords);
      }
    },
    [enrollments]
  );

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentAttendance((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  };

  const handleSelectAll = (status: AttendanceStatus) => {
    setStudentAttendance((prev) =>
      prev.map((record) => ({
        ...record,
        status,
      }))
    );
  };

  const handleSubmit = async () => {
    if (!selectedClassId || !selectedDate) {
      toast.error("Please select a class and date");
      return;
    }

    if (studentAttendance.length === 0) {
      toast.error("No students found for this class");
      return;
    }

    try {
      const payload = studentAttendance.map((record) => ({
        classId: Number(selectedClassId),
        studentId: record.studentId,
        date: selectedDate,
        status: record.status,
      }));

      await bulkCreateAttendance({
        resource: "attendance",
        values: {
          records: payload,
        },
      });

      toast.success(
        `Attendance marked for ${studentAttendance.length} students`
      );
      navigate("/classes");
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Failed to mark attendance");
    }
  };

  const selectedClass = classes.find(
    (c: ClassDetails) => String(c.id) === selectedClassId
  );

  return (
    <CreateView className="class-view">
      <Breadcrumb />

      <h1 className="page-title">Bulk Mark Attendance</h1>
      <div className="intro-row">
        <p>Mark attendance for multiple students at once.</p>
      </div>

      <Separator />

      <div className="my-4 flex items-center">
        <Card className="w-full">
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
              Mark Attendance
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="mt-7">
            {/* Selection Section */}
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select Class <span className="text-red-600">*</span>
                  </label>
                  <Select
                    value={selectedClassId}
                    onValueChange={handleClassSelect}
                    disabled={classesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classItem: ClassDetails) => (
                        <SelectItem
                          key={classItem.id}
                          value={String(classItem.id)}
                        >
                          {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              {selectedClass && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm">
                    <strong>Class:</strong> {selectedClass.name}
                  </p>
                  <p className="text-sm">
                    <strong>Total Students:</strong> {studentAttendance.length}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {studentAttendance.length > 0 && (
              <div className="mb-6 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll("present")}
                >
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll("absent")}
                >
                  Mark All Absent
                </Button>
              </div>
            )}

            {/* Attendance Table */}
            {studentAttendance.length > 0 && (
              <div className="border rounded-lg overflow-hidden mb-6">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead className="w-12">
                        <Checkbox disabled />
                      </TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentAttendance.map((record, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell className="font-medium">
                          {record.name}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={record.status}
                            onValueChange={(status) =>
                              handleStatusChange(
                                record.studentId,
                                status as AttendanceStatus
                              )
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="excused">Excused</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-2">
              <Button
                type="button"
                size="lg"
                onClick={handleSubmit}
                disabled={isPending || studentAttendance.length === 0}
              >
                {isPending ? "Saving..." : "Mark Attendance"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/classes")}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CreateView>
  );
};

export default BulkAttendance;
