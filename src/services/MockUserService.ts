import { UserSession } from "./UserService";
import { AbstractUserService } from "./AbstractUserService";

export class MockUserService extends AbstractUserService {
  private readonly takenUsernames = new Set(["a", "b", "c", "d", "e"]);
  private readonly testToken = "mock-token";

  /** 사용자명으로 서버에서 사용자 정보와 세션 토큰을 발급받습니다. */
  protected async fetchSession(username: string): Promise<UserSession> {
    return {
      username: username,
      token: this.testToken,
    };
  }

  /** 세션 토큰이 서버에서 유효한지 검사합니다. */
  protected async validateToken(token: string): Promise<boolean> {
    return token === this.testToken;
  }

  /** 이미 사용중인 사용자 명인지 여부를 반환합니다. */
  protected async isTakenUsername(username: string): Promise<boolean> {
    const trimmed = username.trim();
    if (!trimmed) {
      throw new Error("USERNAME_UNAVAILABLE");
    }
    return this.takenUsernames.has(trimmed);
  }
}
