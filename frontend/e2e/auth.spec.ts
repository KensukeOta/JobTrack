import { expect, test } from "@playwright/test";

function createUser(projectName: string, workerIndex: number) {
  return {
    name: "E2E User",
    email: `e2e-${projectName}-${workerIndex}-${Date.now()}@example.com`,
    password: "Password123!",
  };
}

test("新規ユーザーを登録できる", async ({ page }, testInfo) => {
  const user = createUser(testInfo.project.name, testInfo.workerIndex);

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
});

test("登録したユーザーでログインできる", async ({ page }, testInfo) => {
  const user = createUser(testInfo.project.name, testInfo.workerIndex);

  // ユーザー登録
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

  // ログイン
  await page.getByLabel("メールアドレス").fill(user.email);
  await page.getByLabel("パスワード").fill(user.password);

  await page
    .getByRole("button", {
      name: "ログイン",
    })
    .click();

  await expect(page).toHaveURL(/\/dashboard$/);
});

test("ログイン後にログアウトできる", async ({ page }, testInfo) => {
  const user = createUser(testInfo.project.name, testInfo.workerIndex);

  // 登録
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

  // ログイン
  await page.getByLabel("メールアドレス").fill(user.email);
  await page.getByLabel("パスワード").fill(user.password);

  await page
    .getByRole("button", {
      name: "ログイン",
    })
    .click();

  await expect(page).toHaveURL(/\/dashboard$/);

  // ログアウト
  await page
    .getByRole("button", {
      name: "ログアウト",
    })
    .click();

  await expect(page).toHaveURL(/\/login$/);
});

test("未認証では保護されたページへアクセスできない", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/jobs");

  await expect(page).toHaveURL(/\/login$/);
});
