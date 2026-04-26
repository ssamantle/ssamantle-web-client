import { render, screen, within } from "@testing-library/react";
import { GuessHistoryTable } from "./GuessHistoryTable";
import type { GuessResult } from "../../types/game";
import { WORD_RANK_VOCAB_SIZE } from "../../utils/raceMap";

const formattedVocabSize = WORD_RANK_VOCAB_SIZE.toLocaleString();

function expectedProgressLabel(wordRank: number): string {
  return `${Math.round((1 - wordRank / WORD_RANK_VOCAB_SIZE) * 100)}%`;
}

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
      latestSubmittedGuessLabel="beta"
    />,
  );

  const rows = screen.getAllByRole("row").slice(1);
  expect(rows).toHaveLength(3);
  expect(within(rows[0]).getByText("beta")).toBeInTheDocument();
  expect(rows[0]).toHaveAttribute("data-highlighted", "true");
  expect(rows[0]).toHaveClass("bg-[#f4eadb]");
  expect(within(rows[1]).getByText("alpha")).toBeInTheDocument();
});

test("highlights existing row when a duplicate word is submitted", () => {
  render(
    <GuessHistoryTable
      items={items}
      latestSubmittedGuessLabel="alpha"
    />,
  );

  const rows = screen.getAllByRole("row").slice(1);
  expect(rows).toHaveLength(3);
  expect(within(rows[0]).getByText("alpha")).toBeInTheDocument();
  expect(rows[0]).toHaveAttribute("data-highlighted", "true");
});

test("shows word rank labels and fills the progress bar on the configured word scale", () => {
  render(<GuessHistoryTable items={items} />);

  expect(screen.queryByText("제출 순위")).not.toBeInTheDocument();
  expect(screen.queryByText("정답")).not.toBeInTheDocument();
  expect(screen.getByText("단어 순위")).toBeInTheDocument();
  expect(
    screen.getByText(`0위 = 100% / ${formattedVocabSize}위 = 0%`),
  ).toBeInTheDocument();
  expect(screen.getByText("25위")).toBeInTheDocument();

  const rows = screen.getAllByRole("row").slice(1);
  expect(within(rows[0]).getByText(expectedProgressLabel(25))).toBeInTheDocument();
  expect(within(rows[1]).getByText(expectedProgressLabel(300))).toBeInTheDocument();
  expect(within(rows[2]).getByText(expectedProgressLabel(640))).toBeInTheDocument();
});

test("shows vocabulary size threshold when word rank is outside the vocabulary size", () => {
  render(
    <GuessHistoryTable
      items={[
        {
          label: "delta",
          similarity: 41.25,
          rank: 200,
          wordRank: WORD_RANK_VOCAB_SIZE,
          isAnswer: false,
        },
      ]}
    />,
  );

  expect(screen.getByText(`${formattedVocabSize}위 이상`)).toBeInTheDocument();
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
          wordRank: WORD_RANK_VOCAB_SIZE,
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
  expect(screen.getByText(`${formattedVocabSize}위 이상`).closest("td")).toHaveStyle({
    color: "rgba(53, 84, 105, 0.6)",
  });
});
