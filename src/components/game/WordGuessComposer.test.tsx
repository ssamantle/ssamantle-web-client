import { render, screen } from "@testing-library/react";
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

test("blocks duplicate guesses restored from previous history", async () => {
  const onSubmitted = jest.fn().mockResolvedValue(undefined);
  const { container } = render(
    <WordGuessComposer
      username="tester"
      sessionId="session-1"
      phase={GamePhaseEnum.IN_GAME}
      submittedWords={["banana"]}
      onSubmitted={onSubmitted}
    />,
  );

  await userEvent.type(screen.getByRole("textbox"), "banana");
  await userEvent.click(container.querySelector('button[type="submit"]') as HTMLButtonElement);

  expect(mockedSubmitGuess).not.toHaveBeenCalled();
  expect(onSubmitted).not.toHaveBeenCalled();
  expect(screen.getByDisplayValue("banana")).toBeInTheDocument();
});

test("submits guesses that are not in restored history", async () => {
  const onSubmitted = jest.fn().mockResolvedValue(undefined);
  mockedSubmitGuess.mockResolvedValue({
    isAnswer: false,
    label: "orange",
    rank: 10,
    similarity: 12.34,
  });

  const { container } = render(
    <WordGuessComposer
      username="tester"
      sessionId="session-1"
      phase={GamePhaseEnum.IN_GAME}
      submittedWords={["banana"]}
      onSubmitted={onSubmitted}
    />,
  );

  await userEvent.type(screen.getByRole("textbox"), "orange");
  await userEvent.click(container.querySelector('button[type="submit"]') as HTMLButtonElement);

  expect(mockedSubmitGuess).toHaveBeenCalledWith("session-1", "tester", "orange");
  expect(onSubmitted).toHaveBeenCalledWith({
    isAnswer: false,
    label: "orange",
    rank: 10,
    similarity: 12.34,
  });
});
