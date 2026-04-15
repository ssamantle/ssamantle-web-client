import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login page heading", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", {
      name: /게임에 입장하기 전에 사용자명을 입력해 주세요\./i,
    }),
  ).toBeInTheDocument();
});
