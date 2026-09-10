import { render, screen } from "@testing-library/react";

import { SummaryCard } from "./summary-card";

describe("SummaryCard", () => {
  it("ラベルと値を表示する", () => {
    render(<SummaryCard label="全求人" value={12} />);

    expect(screen.getByText("全求人")).toBeInTheDocument();

    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("descriptionが指定された場合は説明を表示する", () => {
    render(
      <SummaryCard label="アクティブ" value={7} description="進行中の求人" />,
    );

    expect(screen.getByText("進行中の求人")).toBeInTheDocument();
  });
});
