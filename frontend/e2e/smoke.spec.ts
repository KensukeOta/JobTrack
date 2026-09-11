import { expect, test } from "@playwright/test";

test("ログイン画面を表示できる", async ({ page }) => {
  await page.goto("/login");

  await expect(page).toHaveURL(/\/login/);
});
