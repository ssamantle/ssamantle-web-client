import { render, screen, within } from "@testing-library/react";
import { GuessHistoryTable } from "./GuessHistoryTable";
import { getGuessResultKey } from "../../utils/guessHistory";
import type { GuessResult } from "../../types/game";

const items: GuessResult[] = [
  {
    label: "alpha",
    similarity: 88.12,
    rank: 15,
    isAnswer: false,
  },
  {
    label: "beta",
    similarity: 72.45,
    rank: 88,
    isAnswer: false,
  },
  {
    label: "gamma",
    similarity: 64.1,
    rank: 133,
    isAnswer: false,
  },
];

test("highlights the latest submitted guess and moves it to the top", () => {
  render(
    <GuessHistoryTable
      items={items}
      latestSubmittedGuessKey={getGuessResultKey(items[1])}
    />,
  );

  const rows = screen.getAllByRole("row").slice(1);
  expect(rows).toHaveLength(3);
  expect(within(rows[0]).getByText("beta")).toBeInTheDocument();
  expect(rows[0]).toHaveAttribute("data-highlighted", "true");
  expect(rows[0]).toHaveClass("bg-[#f4eadb]");
  expect(within(rows[1]).getByText("alpha")).toBeInTheDocument();
});
