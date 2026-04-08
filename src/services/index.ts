import { GameService } from './GameService';
import { MockGameService } from './MockGameService';
import { UserService } from './UserService';
import { MockUserService } from './MockUserService';

export const userService: UserService = new MockUserService();
export const gameService: GameService = new MockGameService();
