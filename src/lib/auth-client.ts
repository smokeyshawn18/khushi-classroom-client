import { createAuthClient } from "better-auth/react";
import { BACKEND_BASE_URL, USER_ROLES } from "../constants";

export const authClient = createAuthClient({
  baseURL: `${BACKEND_BASE_URL.replace(/\/$/, "")}/auth`,
  // Ensure BetterAuth requests send cookies on cross-origin calls
  fetchOptions: {
    credentials: "include",
  },
  user: {
    additionalFields: {
      role: {
        type: USER_ROLES,
        required: true,
        defaultValue: "student",
        input: true,
      },
      department: {
        type: "string",
        required: false,
        input: true,
      },
      imageCldPubId: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});
