import React from 'react';
import { GameService } from '../services/GameService';

interface Props {
  gameService: GameService;
}

export class PostGamePage extends React.Component<Props> {
  private readonly gameService: GameService;

  constructor(props: Props) {
    super(props);
    this.gameService = props.gameService;
  }

  render() {
    const myGuessHistory = this.gameService.getMyGuessHistory();
    const myBestGuess = this.gameService.getMyBestGuess();
    const myInfo = this.gameService.getMyInfo();
    const users = this.gameService.listUsers();

    const upperLeaderboard = this.gameService.listUsers().slice(0, 3);
    const lowerLeaderboard = this.gameService.listUsers().slice(3);

    return (
    <section className="final-results-page">
      <div className="final-results-hero">
        <p className="final-results-eyebrow">Final Results</p>
        <h2>게임이 종료되었습니다</h2>
        <p className="final-results-copy">
          최종 리더보드와 이번 게임에서 남긴 내 기록을 확인하세요.
        </p>
      </div>

      <div className="final-results-layout">
        <section className="final-summary-card" aria-label="내 최종 결과">
          <h3>내 결과</h3>
          {myBestGuess ? (
            <dl className="final-summary-grid">
              <div className="final-summary-item">
                <dt>최종 순위</dt>
                <dd>{myInfo ? `#${myInfo.rank}` : '집계 중'}</dd>
              </div>
              <div className="final-summary-item">
                <dt>최대 유사도</dt>
                <dd>{myBestGuess.similarity.toFixed(2)}</dd>
              </div>
              <div className="final-summary-item">
                <dt>최고 기록 단어</dt>
                <dd>{myBestGuess.label}</dd>
              </div>
              <div className="final-summary-item">
                <dt>총 추측 횟수</dt>
                <dd>{myGuessHistory.length}</dd>
              </div>
            </dl>
          ) : (
            <p className="final-summary-empty">이번 게임에 제출한 추측이 없습니다.</p>
          )}
        </section>

        <aside className="leaderboard-panel final-results-leaderboard-panel" aria-label="최종 리더보드">
          {users.length > 0 ? (
            <>
              <div className="leaderboard-card">
                <h3>최종 리더보드</h3>
                <ol className="leaderboard-list leaderboard-list-upper">
                  {upperLeaderboard.map((entry, index) => (
                    <li className="leaderboard-row leaderboard-row-upper" key={`${entry.name}-${index}`}>
                      <span className="leaderboard-rank">#{entry.rank}</span>
                      <span className={`leaderboard-name${index === 0 ? ' leaderboard-name-top' : ''}`}>
                        {entry.name}
                      </span>
                      <span className="leaderboard-score">{entry.bestSimilarity.toFixed(2)}</span>
                    </li>
                  ))}
                </ol>
              </div>
              {lowerLeaderboard.length > 0 && (
                <ol className="leaderboard-list leaderboard-list-lower" start={4}>
                  {lowerLeaderboard.map((entry, index) => (
                    <li className="leaderboard-row leaderboard-row-lower" key={`${entry.name}-${index + 3}`}>
                      <span className="leaderboard-rank">#{index + 4}</span>
                      <span className="leaderboard-name">{entry.name}</span>
                      <span className="leaderboard-score">{entry.bestSimilarity.toFixed(2)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          ) : (
            <div className="leaderboard-card">
              <h3>최종 리더보드</h3>
              <p className="leaderboard-empty">최종 순위 정보가 아직 없습니다.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
    );
  }
}
