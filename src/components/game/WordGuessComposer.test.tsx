import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WordGuessComposer } from "./WordGuessComposer";
import { submitGuess } from "../../services/gameService";
import { GamePhaseEnum } from "../../types/game";

jest.mock("../../services/gameService", () => ({
  submitGuess: jest.fn(),
}));

const mockedSubmitGuess = submitGuess as jest.MockedFunction<typeof submitGuess>;

beforeEach(() => {
  mockedSubmitGuess.mockReset();
});

test("clears input and keeps focus after successful submission", async () => {
  const onSubmitted = jest.fn().mockResolvedValue(undefined);
  mockedSubmitGuess.mockResolvedValue({
    isAnswer: false,
    label: "banana",
    rank: 12,
    similarity: 8.76,
    wordRank: 312,
  });
  const { container } = render(
    <WordGuessComposer
      username="tester"
      sessionId="session-1"
      phase={GamePhaseEnum.IN_GAME}
      onSubmitted={onSubmitted}
    />,
  );

  const input = screen.getByRole("textbox");
  await userEvent.type(input, "banana");
  await userEvent.click(container.querySelector('button[type="submit"]') as HTMLButtonElement);

  await waitFor(() => {
    expect(mockedSubmitGuess).toHaveBeenCalledWith("session-1", "tester", "banana");
    expect(onSubmitted).toHaveBeenCalledWith({
      isAnswer: false,
      label: "banana",
      rank: 12,
      similarity: 8.76,
      wordRank: 312,
    });
  });

  expect(input).toHaveValue("");
  await waitFor(() => {
    expect(input).toHaveFocus();
  });
});

test("clears input and keeps focus when validation fails", async () => {
  const onSubmitted = jest.fn().mockResolvedValue(undefined);

  const { container } = render(
    <WordGuessComposer
      username="tester"
      sessionId="session-1"
      phase={GamePhaseEnum.IN_GAME}
      onSubmitted={onSubmitted}
    />,
  );

  const input = screen.getByRole("textbox");
  await userEvent.type(input, "two words");
  await userEvent.click(container.querySelector('button[type="submit"]') as HTMLButtonElement);

  expect(mockedSubmitGuess).not.toHaveBeenCalled();
  expect(onSubmitted).not.toHaveBeenCalled();
  expect(screen.getByText("단어에는 공백을 포함할 수 없습니다.")).toBeInTheDocument();
  expect(input).toHaveValue("");
  expect(input).toHaveFocus();
});

test("clears input and keeps focus when server responds with an error", async () => {
  const onSubmitted = jest.fn().mockResolvedValue(undefined);
  mockedSubmitGuess.mockRejectedValue(new Error("단어 정보를 찾을 수 없습니다."));

  const { container } = render(
    <WordGuessComposer
      username="tester"
      sessionId="session-1"
      phase={GamePhaseEnum.IN_GAME}
      onSubmitted={onSubmitted}
    />,
  );

  const input = screen.getByRole("textbox");
  await userEvent.type(input, "orange");
  await userEvent.click(container.querySelector('button[type="submit"]') as HTMLButtonElement);

  await waitFor(() => {
    expect(mockedSubmitGuess).toHaveBeenCalledWith("session-1", "tester", "orange");
    expect(screen.getByText("단어 정보를 찾을 수 없습니다.")).toBeInTheDocument();
  });

  expect(onSubmitted).not.toHaveBeenCalled();
  expect(input).toHaveValue("");
  await waitFor(() => {
    expect(input).toHaveFocus();
  });
});
