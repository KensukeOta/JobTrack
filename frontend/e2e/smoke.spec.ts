import { expect, test } from "@playwright/test";

test("ログイン画面を表示できる", async ({ page }) => {
  await page.goto("/login");

  await expect(page).toHaveURL(/\/login/);
});

test("存在しないURLでは404ページを表示できる", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");

  await expect(
    page.getByRole("heading", {
      name: "ページが見つかりません",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("link", {
      name: "トップページへ戻る",
    }),
  ).toHaveAttribute("href", "/");

  await expect(
    page.getByRole("link", {
      name: "ダッシュボードへ",
    }),
  ).toHaveAttribute("href", "/dashboard");
});
