import { expect, test } from "@playwright/test";

import { registerAndLogin } from "./helpers/auth";

test("登録した求人がダッシュボードへ反映される", async ({ page }, testInfo) => {
  await registerAndLogin(page, testInfo);

  // ダッシュボード確認用の求人を作成
  await page.goto("/jobs/new");

  await page.getByLabel("企業名").fill("E2Eダッシュボード株式会社");

  await page.getByLabel("職種").fill("データエンジニア");

  await page.getByLabel("ステータス").selectOption("interview");

  await page.getByLabel("内容").fill("二次面接");

  await page.getByLabel("日付").fill("2026-12-20");

  await page
    .getByRole("button", {
      name: "求人を登録",
    })
    .click();

  await expect(page).toHaveURL(/\/jobs(?:\?.*)?$/);

  // ダッシュボードへ移動
  await page.goto("/dashboard");

  await expect(
    page.getByRole("heading", {
      name: "ダッシュボード",
    }),
  ).toBeVisible();

  // サマリー
  const summary = page.getByRole("region", {
    name: "求人応募サマリー",
  });

  const totalCard = summary.locator("article").filter({
    hasText: "全求人",
  });

  await expect(
    totalCard.getByText("1", {
      exact: true,
    }),
  ).toBeVisible();

  const activeCard = summary.locator("article").filter({
    hasText: "アクティブ",
  });

  await expect(
    activeCard.getByText("1", {
      exact: true,
    }),
  ).toBeVisible();

  const interviewCard = summary.locator("article").filter({
    hasText: "面接",
  });

  await expect(
    interviewCard.getByText("1", {
      exact: true,
    }),
  ).toBeVisible();

  const offerCard = summary.locator("article").filter({
    hasText: "内定",
  });

  await expect(
    offerCard.getByText("0", {
      exact: true,
    }),
  ).toBeVisible();

  // ステータス集計
  const statusSection = page.locator("section").filter({
    has: page.getByRole("heading", {
      name: "応募ステータス",
    }),
  });

  const interviewStatus = statusSection
    .getByText("面接", {
      exact: true,
    })
    .locator("..");

  await expect(
    interviewStatus.getByText("1", {
      exact: true,
    }),
  ).toBeVisible();

  // 今後のアクション
  const upcomingSection = page.locator("section").filter({
    has: page.getByRole("heading", {
      name: "今後のアクション",
    }),
  });

  await expect(
    upcomingSection.getByText("E2Eダッシュボード株式会社", {
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    upcomingSection.getByText("データエンジニア", {
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    upcomingSection.getByText("二次面接", {
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    upcomingSection.getByText("2026/12/20", {
      exact: true,
    }),
  ).toBeVisible();
});
