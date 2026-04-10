export interface UserSession {
  token: string;
  username: string;
}

export interface UserService {
  /** 사용자명의 사용 가능 여부를 반환합니다. */
  isUsernameAvailable(username: string): Promise<boolean>;

  /** 세션이 유효한지 검사합니다. 세션이 없거나 유효하지 않으면 false를 반환합니다. */
  isSessionValid(session: UserSession): Promise<boolean>;

  /** 사용자명으로 로그인하고 세션 정보를 저장합니다. */
  login(username: string): Promise<void>;

  /** 로그인된 사용자가 있을 경우 세션 정보를 제거합니다. */
  logout(): Promise<void>;

  /** 저장된 사용자 세션 정보를 반환합니다. 없으면 null을 반환합니다. */
  getCurrentUser(): UserSession | null;
}
