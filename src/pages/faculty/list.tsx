import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useGetIdentity } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { useSearchParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import type { User } from "@/types";

const FacultyList = () => {
  const [searchParams, setSearchParams] = useSearchParams(); // ✅ CHANGED: destructure setSearchParams
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") ?? ""
  );
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher">(
    "student"
  );
  const { data: currentUser } = useGetIdentity<User>();
  const viewerRoleRaw =
    (currentUser as any)?.role ?? (currentUser as any)?.data?.role ?? "";
  const viewerRole = String(viewerRoleRaw).toLowerCase();
  const canToggleRole = viewerRole === "teacher" || viewerRole === "admin";
  const roleFilter = canToggleRole ? selectedRole : "student";

  // ✅ ADDED: Search handler (3 lines)
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    if (value) setSearchParams({ search: value }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  const facultyColumns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        size: 220,
        header: () => <p className="column-title">Name</p>,
        cell: ({ row, getValue }) => {
          const name = getValue<string>();
          const image = row.original.image;
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                {image && <AvatarImage src={image} alt={name} />}
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
              <span className="text-foreground">{name}</span>
            </div>
          );
        },
      },
      {
        id: "email",
        accessorKey: "email",
        size: 240,
        header: () => <p className="column-title">Email</p>,
        cell: ({ getValue }) => (
          <span className="text-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: "role",
        accessorKey: "role",
        size: 120,
        header: () => <p className="column-title">Role</p>,
        cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
      },
      {
        id: "details",
        size: 140,
        header: () => <p className="column-title">Details</p>,
        cell: ({ row }) => (
          <ShowButton
            resource="users"
            recordItemId={row.original.id}
            variant="outline"
            size="sm"
          >
            View
          </ShowButton>
        ),
      },
    ],
    []
  );

  const searchFilters = searchQuery // ✅ CHANGED: field name
    ? [{ field: "q", operator: "contains" as const, value: searchQuery }]
    : [];

  const facultyTable = useTable<User>({
    columns: facultyColumns,
    refineCoreProps: {
      resource: "users",
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      filters: {
        permanent: [
          {
            field: "role",
            operator: "eq",
            value: roleFilter,
          },
          ...searchFilters,
        ],
      },
      sorters: {
        initial: [
          {
            field: "id",
            order: "desc",
          },
        ],
      },
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Faculty</h1>

      <div className="intro-row">
        <p>Browse and manage students and teachers.</p>

        <div className="actions-row">
          {canToggleRole && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={selectedRole === "student" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRole("student")}
              >
                Students
              </Button>
              <Button
                type="button"
                variant={selectedRole === "teacher" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRole("teacher")}
              >
                Teachers
              </Button>
            </div>
          )}
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      <DataTable table={facultyTable} />
    </ListView>
  );
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return `${parts[0][0] ?? ""}${
    parts[parts.length - 1][0] ?? ""
  }`.toUpperCase();
};

export default FacultyList;
