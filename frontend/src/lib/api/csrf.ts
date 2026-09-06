export function getCsrfToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.substring("csrf_token=".length));
}
