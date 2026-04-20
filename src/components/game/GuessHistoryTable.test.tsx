import { render, screen, within } from "@testing-library/react";
import { GuessHistoryTable } from "./GuessHistoryTable";
import { getGuessResultKey } from "../../utils/guessHistory";
import type { GuessResult } from "../../types/game";

const items: GuessResult[] = [
  {
    label: "alpha",
    similarity: 88.12,
    rank: 15,
    wordRank: 25,
    isAnswer: false,
  },
  {
    label: "beta",
    similarity: 72.45,
    rank: 88,
    wordRank: 300,
    isAnswer: false,
  },
  {
    label: "gamma",
    similarity: 64.1,
    rank: 133,
    wordRank: 640,
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

test("shows word rank labels and fills the progress bar on a 1 to 1000 scale", () => {
  render(<GuessHistoryTable items={items} />);

  expect(screen.queryByText("제출 순위")).not.toBeInTheDocument();
  expect(screen.queryByText("정답")).not.toBeInTheDocument();
  expect(screen.getByText("단어 순위")).toBeInTheDocument();
  expect(screen.getByText("1위 = 100% / 1000위 = 0%")).toBeInTheDocument();
  expect(screen.getByText("25위")).toBeInTheDocument();

  const rows = screen.getAllByRole("row").slice(1);
  expect(within(rows[0]).getByText("98%")).toBeInTheDocument();
  expect(within(rows[1]).getByText("70%")).toBeInTheDocument();
  expect(within(rows[2]).getByText("36%")).toBeInTheDocument();
});

test("shows 1000위 이상 when word rank is outside 1 to 999", () => {
  render(
    <GuessHistoryTable
      items={[
        {
          label: "delta",
          similarity: 41.25,
          rank: 200,
          wordRank: 1300,
          isAnswer: false,
        },
      ]}
    />,
  );

  expect(screen.getByText("1000위 이상")).toBeInTheDocument();
});

test("applies opacity between 0.6 and 1.0 from similarity and word rank", () => {
  render(
    <GuessHistoryTable
      items={[
        {
          label: "max-emphasis",
          similarity: 100,
          rank: 1,
          wordRank: 1,
          isAnswer: false,
        },
        {
          label: "min-emphasis",
          similarity: 0,
          rank: 500,
          wordRank: 1000,
          isAnswer: false,
        },
      ]}
    />,
  );

  expect(screen.getByText("100.00").closest("td")).toHaveStyle({
    color: "rgba(12, 104, 135, 1)",
  });
  expect(screen.getByText("1위").closest("td")).toHaveStyle({
    color: "rgba(53, 84, 105, 1)",
  });

  expect(screen.getByText("0.00").closest("td")).toHaveStyle({
    color: "rgba(12, 104, 135, 0.6)",
  });
  expect(screen.getByText("1000위 이상").closest("td")).toHaveStyle({
    color: "rgba(53, 84, 105, 0.6)",
  });
});
