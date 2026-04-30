import { useShow, useList } from "@refinedev/core";
import { useParams, Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShowView,
  ShowViewHeader,
} from "@/components/refine-ui/views/show-view";
import type { User } from "@/types";

const StudentShow = () => {
  const { id } = useParams();
  const studentId = id ?? "";

  const { query } = useShow<User>({
    resource: "users",
  });

  const user = query.data?.data;

  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "teacher",
      },
      {
        field: "student",
        operator: "eq",
        value: studentId,
      },
    ],
    pagination: { pageSize: 100, mode: "server" },
    queryOptions: { enabled: Boolean(studentId) },
  });

  const teachers = teachersQuery.data?.data ?? [];

  return (
    <ShowView className="class-view space-y-6">
      <ShowViewHeader resource="users" title={user?.name ?? "Student"} />

      <Card>
        <CardHeader>
          <CardTitle>Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No teachers associated with this student.
            </p>
          ) : (
            <div className="grid gap-3">
              {teachers.map((t) => (
                <Link
                  to={`/faculty/show/${t.id}`}
                  key={t.id}
                  className="flex items-center gap-3 hover:underline"
                >
                  <Avatar>
                    {t.image && <AvatarImage src={t.image} alt={t.name} />}
                    <AvatarFallback>
                      {t.name
                        ? t.name
                            .split(" ")
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join("")
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.email}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ShowView>
  );
};

export default StudentShow;
