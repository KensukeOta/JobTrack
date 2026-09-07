import type { LoginRequest, RegisterRequest, User } from "@/types/auth";

import { apiRequest } from "./client";

export function register(data: RegisterRequest): Promise<User> {
  return apiRequest<User>("/api/v1/auth/register", {
    method: "POST",
    body: data,
  });
}

export function login(data: LoginRequest): Promise<User> {
  return apiRequest<User>("/api/v1/auth/login", {
    method: "POST",
    body: data,
  });
}

export function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/api/v1/users/me");
}
