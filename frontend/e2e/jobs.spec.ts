import { expect, test } from "@playwright/test";

import { registerAndLogin } from "./helpers/auth";

test("求人を作成して詳細を確認できる", async ({ page }, testInfo) => {
  await registerAndLogin(page, testInfo);

  await page.goto("/jobs/new");

  await page.getByLabel("企業名").fill("E2E株式会社");
  await page.getByLabel("職種").fill("Webエンジニア");
  await page.getByLabel("ステータス").selectOption("applied");
  await page.getByLabel("雇用形態").selectOption("full_time");
  await page.getByLabel("勤務地").fill("大阪府大阪市");
  await page.getByLabel("求人URL").fill("https://example.com/jobs/e2e");
  await page.getByLabel("最低給与").fill("3000000");
  await page.getByLabel("最高給与").fill("5000000");
  await page.getByLabel("内容").fill("一次面接");
  await page.getByLabel("日付").fill("2026-12-01");
  await page.getByLabel("メモ").fill("Playwright E2Eテスト用求人");

  await page
    .getByRole("button", {
      name: "求人を登録",
    })
    .click();

  await expect(page).toHaveURL(/\/jobs(?:\?.*)?$/);

  await expect(page.getByText("E2E株式会社")).toBeVisible();
  await expect(page.getByText("Webエンジニア")).toBeVisible();

  await page
    .getByRole("link", {
      name: "Webエンジニア",
    })
    .click();

  await expect(page).toHaveURL(/\/jobs\/[^/]+$/);

  await expect(page.getByText("E2E株式会社")).toBeVisible();
  await expect(page.getByText("Webエンジニア")).toBeVisible();
  await expect(page.getByText("応募済み")).toBeVisible();
  await expect(page.getByText("正社員")).toBeVisible();
  await expect(page.getByText("大阪府大阪市")).toBeVisible();

  await expect(page.getByText("3,000,000円 〜 5,000,000円")).toBeVisible();

  await expect(
    page.getByRole("link", {
      name: "https://example.com/jobs/e2e",
    }),
  ).toBeVisible();

  await expect(page.getByText("一次面接")).toBeVisible();
  await expect(page.getByText("2026/12/01")).toBeVisible();

  await expect(page.getByText("Playwright E2Eテスト用求人")).toBeVisible();

  // 求人編集画面へ移動
  await page
    .getByRole("link", {
      name: "編集",
    })
    .click();

  await expect(page).toHaveURL(/\/jobs\/[^/]+\/edit$/);

  // 既存データがフォームへ反映されていることを確認
  await expect(page.getByLabel("企業名")).toHaveValue("E2E株式会社");
  await expect(page.getByLabel("職種")).toHaveValue("Webエンジニア");
  await expect(page.getByLabel("ステータス")).toHaveValue("applied");
  await expect(page.getByLabel("雇用形態")).toHaveValue("full_time");
  await expect(page.getByLabel("勤務地")).toHaveValue("大阪府大阪市");
  await expect(page.getByLabel("最低給与")).toHaveValue("3000000");
  await expect(page.getByLabel("最高給与")).toHaveValue("5000000");
  await expect(page.getByLabel("内容")).toHaveValue("一次面接");
  await expect(page.getByLabel("日付")).toHaveValue("2026-12-01");

  await expect(page.getByLabel("メモ")).toHaveValue(
    "Playwright E2Eテスト用求人",
  );

  // 求人情報を編集
  await page.getByLabel("企業名").fill("E2E株式会社 更新後");
  await page.getByLabel("職種").fill("フロントエンドエンジニア");

  await page.getByLabel("ステータス").selectOption("interview");

  await page.getByLabel("勤務地").fill("大阪府大阪市北区");

  await page.getByLabel("最低給与").fill("3500000");

  await page.getByLabel("最高給与").fill("5500000");

  await page.getByLabel("内容").fill("最終面接");

  await page.getByLabel("日付").fill("2026-12-15");

  await page.getByLabel("メモ").fill("E2E編集後のメモ");

  // 更新
  await page
    .getByRole("button", {
      name: "変更を保存",
    })
    .click();

  // 詳細画面へ戻ることを確認
  await expect(page).toHaveURL(/\/jobs\/[^/]+$/);

  // 更新後の内容を確認
  await expect(page.getByText("E2E株式会社 更新後")).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: "フロントエンドエンジニア",
    }),
  ).toBeVisible();

  await expect(
    page.getByText("面接", {
      exact: true,
    }),
  ).toBeVisible();

  await expect(page.getByText("大阪府大阪市北区")).toBeVisible();

  await expect(page.getByText("3,500,000円 〜 5,500,000円")).toBeVisible();

  await expect(
    page.getByText("最終面接", {
      exact: true,
    }),
  ).toBeVisible();

  await expect(page.getByText("2026/12/15")).toBeVisible();

  await expect(page.getByText("E2E編集後のメモ")).toBeVisible();

  // 求人を削除
  await page
    .getByRole("button", {
      name: "削除",
    })
    .click();

  // 確認ダイアログを確認
  const dialog = page.getByRole("dialog", {
    name: "求人を削除しますか？",
  });

  await expect(dialog).toBeVisible();

  await expect(
    dialog.getByText("「E2E株式会社 更新後」の求人情報を削除します。"),
  ).toBeVisible();

  // 削除を確定
  await dialog
    .getByRole("button", {
      name: "削除する",
    })
    .click();

  // 一覧へ戻る
  await expect(page).toHaveURL(/\/jobs(?:\?.*)?$/);

  // 削除した求人が一覧から消えていることを確認
  await expect(page.getByText("E2E株式会社 更新後")).not.toBeVisible();

  await expect(page.getByText("フロントエンドエンジニア")).not.toBeVisible();
});
