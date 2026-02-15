import { useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { USER_ROLES } from "@/constants";

/**
 * Hook to check if the current user can create resources
 * Only teachers and admins can create departments, classes, subjects, enrollments, and faculty
 */
export const useCanCreate = () => {
  const { data: user } = useGetIdentity<User>();

  return user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.TEACHER;
};
