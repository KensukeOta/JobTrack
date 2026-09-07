import type { RegisterRequest, User } from "@/types/auth";

import { apiRequest } from "./client";

export function register(data: RegisterRequest): Promise<User> {
  return apiRequest<User>("/api/v1/auth/register", {
    method: "POST",
    body: data,
  });
}
