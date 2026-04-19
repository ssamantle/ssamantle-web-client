export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 20;
export const GUESS_MAX_LENGTH = 30;

const INVISIBLE_CHARACTERS_REGEX = /[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g;
const USERNAME_ALLOWED_REGEX = /^[A-Za-z0-9가-힣 _-]+$/;
const GUESS_ALLOWED_REGEX = /^[A-Za-z0-9가-힣]+$/;

const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "system",
  "root",
  "운영자",
  "관리자",
]);

export interface ValidationResult {
  isValid: boolean;
  value: string;
  error: string | null;
}

interface NormalizeOptions {
  collapseWhitespace?: boolean;
}

export function normalizeInput(raw: string, options: NormalizeOptions = {}): string {
  const normalized = raw
    .normalize("NFKC")
    .replace(INVISIBLE_CHARACTERS_REGEX, "")
    .trim();

  if (options.collapseWhitespace) {
    return normalized.replace(/\s+/g, " ");
  }

  return normalized;
}

export function validateUsername(raw: string): ValidationResult {
  const value = normalizeInput(raw, { collapseWhitespace: true });

  if (value.length < USERNAME_MIN_LENGTH) {
    return {
      isValid: false,
      value,
      error: `사용자명은 ${USERNAME_MIN_LENGTH}자 이상이어야 합니다.`,
    };
  }

  if (value.length > USERNAME_MAX_LENGTH) {
    return {
      isValid: false,
      value,
      error: `사용자명은 ${USERNAME_MAX_LENGTH}자 이하여야 합니다.`,
    };
  }

  if (!USERNAME_ALLOWED_REGEX.test(value)) {
    return {
      isValid: false,
      value,
      error: "사용자명은 한글, 영문, 숫자, 공백, -, _만 입력할 수 있습니다.",
    };
  }

  if (RESERVED_USERNAMES.has(value.toLowerCase())) {
    return {
      isValid: false,
      value,
      error: "사용할 수 없는 사용자명입니다.",
    };
  }

  return {
    isValid: true,
    value,
    error: null,
  };
}

export function validateGuessWord(raw: string): ValidationResult {
  const value = normalizeInput(raw);

  if (!value) {
    return {
      isValid: false,
      value,
      error: "추측할 단어를 입력해 주세요.",
    };
  }

  if (value.includes(" ")) {
    return {
      isValid: false,
      value,
      error: "단어에는 공백을 포함할 수 없습니다.",
    };
  }

  if (value.length > GUESS_MAX_LENGTH) {
    return {
      isValid: false,
      value,
      error: `단어는 ${GUESS_MAX_LENGTH}자 이하여야 합니다.`,
    };
  }

  if (!GUESS_ALLOWED_REGEX.test(value)) {
    return {
      isValid: false,
      value,
      error: "단어는 한글, 영문, 숫자만 입력할 수 있습니다.",
    };
  }

  return {
    isValid: true,
    value,
    error: null,
  };
}
