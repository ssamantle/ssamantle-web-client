import { GameService, GameInfo, UserInfo, Guess, GameState } from "./GameService";
import { UserService, UserSession } from "./UserService";
import { MockGameService } from "./MockGameService";
import { MockUserService } from "./MockUserService";

export type {
  GameService,
  GameInfo,
  UserInfo,
  Guess,
  UserService,
  UserSession,
}

export {
  GameState,
  MockGameService,
  MockUserService,
};
