import { UserSession, UserService } from "./UserService";

export abstract class AbstractUserService implements UserService {
  private readonly STORAGE_KEY = "user_session";

  /** 사용자명으로 서버에서 사용자 정보와 세션 토큰을 발급받습니다. */
  protected abstract fetchSession(username: string): Promise<UserSession>;

  /** 세션 토큰이 서버에서 유효한지 검사합니다. */
  protected abstract validateToken(token: string): Promise<boolean>;

  /** 이미 사용중인 사용자 명인지 여부를 반환합니다. */
  protected abstract isTakenUsername(username: string): Promise<boolean>;

  protected async validateUsername(username: string): Promise<boolean> {
    const trimmed = username.trim();
    if (!trimmed) {
      throw new Error("USERNAME_UNAVAILABLE");
    }
    return true;
  }

  /** 사용자명의 사용 가능 여부를 반환합니다. */
  async isUsernameAvailable(username: string): Promise<boolean> {
    return (
      !(await this.validateUsername(username)) &&
      (await this.isTakenUsername(username))
    );
  }

  /** 현재 저장된 세션이 유효한지 검사합니다. 세션이 없거나 토큰이 유효하지 않으면 false를 반환합니다. */
  async isSessionValid(session: UserSession): Promise<boolean> {
    return this.validateToken(session.token);
  }

  /** 사용자명으로 로그인하고 세션 정보를 로컬 스토리지에 저장합니다. */
  async login(username: string): Promise<void> {
    const session = await this.fetchSession(username);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
  }

  /** 로그인된 사용자가 있을 경우 로컬 스토리지에서 세션 정보를 제거합니다. */
  async logout(): Promise<void> {
    if (this.getCurrentUser() === null) return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /** 로컬 스토리지에 저장된 사용자 세션 정보를 반환합니다. 없으면 null을 반환합니다. */
  async getCurrentUser(): Promise<UserSession | null> {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserSession;
    } catch {
      return null;
    }
  }
}
