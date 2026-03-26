import { GameService } from './GameService';
import { MockGameService } from './MockGameService';
// import { ApiGameService } from './ApiGameService'; // 서버 연결 시 이쪽으로 전환
import { User } from '../types';

export type { GameService };

const DEFAULT_USER: User = {
  id: 'local-user',
  username: 'local-user',
};

const DEFAULT_HOST = '';

/**
 * 앱 전역에서 사용하는 GameService 싱글턴.
 * 서버 연결 준비가 되면 MockGameService → ApiGameService 로 한 줄만 바꾸면 됩니다.
 */
export const gameService: GameService = new MockGameService(DEFAULT_USER, DEFAULT_HOST);
