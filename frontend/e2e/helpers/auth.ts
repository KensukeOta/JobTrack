import type { Page, TestInfo } from "@playwright/test";
import { expect } from "@playwright/test";

export type E2EUser = {
  name: string;
  email: string;
  password: string;
};

export function createE2EUser(testInfo: TestInfo): E2EUser {
  return {
    name: "E2E User",
    email:
      ["e2e", testInfo.project.name, testInfo.workerIndex, Date.now()].join(
        "-",
      ) + "@example.com",
    password: "Password123!",
  };
}

export async function registerAndLogin(
  page: Page,
  testInfo: TestInfo,
): Promise<E2EUser> {
  const user = createE2EUser(testInfo);

  await page.goto("/register");

  await page.getByLabel("名前").fill(user.name);
  await page.getByLabel("メールアドレス").fill(user.email);
  await page.getByLabel("パスワード").fill(user.password);

  await page
    .getByRole("button", {
      name: "アカウントを作成",
    })
    .click();

  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("メールアドレス").fill(user.email);
  await page.getByLabel("パスワード").fill(user.password);

  await page
    .getByRole("button", {
      name: "ログイン",
    })
    .click();

  await expect(page).toHaveURL(/\/dashboard$/);

  return user;
}
