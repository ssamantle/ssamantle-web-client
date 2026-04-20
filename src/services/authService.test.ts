import { authApi } from "../api/client";
import { validateSession } from "./authService";

jest.mock("../api/client", () => ({
  authApi: {
    validateTokenAuthValidateGet: jest.fn(),
  },
}));

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

beforeEach(() => {
  mockedAuthApi.validateTokenAuthValidateGet.mockReset();
});

test("validateSession returns boolean response body", async () => {
  mockedAuthApi.validateTokenAuthValidateGet.mockResolvedValue(false);

  await expect(validateSession("expired-session")).resolves.toBe(false);
});
