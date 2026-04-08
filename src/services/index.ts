import { UserService } from './UserService';
import { GameService } from './GameService';
import { MockUserService } from './MockUserService';
import { MockGameService } from './MockGameService';

export const userService: UserService = new MockUserService();
export const gameService: GameService = new MockGameService();
