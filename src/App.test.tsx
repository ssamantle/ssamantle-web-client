import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => {
  window.localStorage.clear();
});

test("renders login page heading", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", {
      name: /게임에 입장하기 전에 사용자명을 입력해 주세요\./i,
    }),
  ).toBeInTheDocument();
});

test("logs out to the login page when auth exists", async () => {
  window.localStorage.setItem(
    "ssamantle.auth",
    JSON.stringify({
      username: "tester",
      sessionId: "session-1",
    }),
  );

  render(<App />);

  await userEvent.click(screen.getByRole("button", { name: "로그아웃" }));

  expect(
    screen.getByRole("heading", {
      name: /게임에 입장하기 전에 사용자명을 입력해 주세요\./i,
    }),
  ).toBeInTheDocument();
  expect(window.localStorage.getItem("ssamantle.auth")).toBeNull();
});
