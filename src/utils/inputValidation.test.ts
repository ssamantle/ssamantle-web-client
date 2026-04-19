import {
  GUESS_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  normalizeInput,
  validateGuessWord,
  validateUsername,
} from "./inputValidation";

test("normalizeInput removes invisible characters and trims text", () => {
  expect(normalizeInput("  te\u200bst \uFEFF ")).toBe("test");
});

test("normalizeInput collapses whitespace when requested", () => {
  expect(normalizeInput("  a   b   c  ", { collapseWhitespace: true })).toBe("a b c");
});

test("validateUsername rejects too short username", () => {
  const result = validateUsername("a");

  expect(result.isValid).toBe(false);
  expect(result.error).toBe(`사용자명은 ${USERNAME_MIN_LENGTH}자 이상이어야 합니다.`);
});

test("validateUsername rejects too long username", () => {
  const result = validateUsername("a".repeat(USERNAME_MAX_LENGTH + 1));

  expect(result.isValid).toBe(false);
  expect(result.error).toBe(`사용자명은 ${USERNAME_MAX_LENGTH}자 이하여야 합니다.`);
});

test("validateUsername rejects reserved username", () => {
  const result = validateUsername("Admin");

  expect(result.isValid).toBe(false);
  expect(result.error).toBe("사용할 수 없는 사용자명입니다.");
});

test("validateUsername accepts normalized valid username", () => {
  const result = validateUsername("  김 싸피_1  ");

  expect(result.isValid).toBe(true);
  expect(result.value).toBe("김 싸피_1");
  expect(result.error).toBeNull();
});

test("validateGuessWord rejects empty input", () => {
  const result = validateGuessWord("   ");

  expect(result.isValid).toBe(false);
  expect(result.error).toBe("추측할 단어를 입력해 주세요.");
});

test("validateGuessWord rejects spaces", () => {
  const result = validateGuessWord("hello world");

  expect(result.isValid).toBe(false);
  expect(result.error).toBe("단어에는 공백을 포함할 수 없습니다.");
});

test("validateGuessWord rejects too long word", () => {
  const result = validateGuessWord("a".repeat(GUESS_MAX_LENGTH + 1));

  expect(result.isValid).toBe(false);
  expect(result.error).toBe(`단어는 ${GUESS_MAX_LENGTH}자 이하여야 합니다.`);
});

test("validateGuessWord rejects special characters", () => {
  const result = validateGuessWord("guess!");

  expect(result.isValid).toBe(false);
  expect(result.error).toBe("단어는 한글, 영문, 숫자만 입력할 수 있습니다.");
});

test("validateGuessWord accepts korean and english letters", () => {
  const result = validateGuessWord("단어guess123");

  expect(result.isValid).toBe(true);
  expect(result.value).toBe("단어guess123");
  expect(result.error).toBeNull();
});
