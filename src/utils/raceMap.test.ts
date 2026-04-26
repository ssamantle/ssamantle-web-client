import {
  WORD_RANK_VOCAB_SIZE,
  mapRankProgressToTrackY,
} from "./raceMap";

describe("mapRankProgressToTrackY", () => {
  test("maps rank against the configured word vocabulary size", () => {
    expect(mapRankProgressToTrackY(1)).toBeCloseTo(1 / WORD_RANK_VOCAB_SIZE);
    expect(mapRankProgressToTrackY(WORD_RANK_VOCAB_SIZE / 2)).toBeCloseTo(0.5);
    expect(mapRankProgressToTrackY(WORD_RANK_VOCAB_SIZE)).toBeCloseTo(1);
  });

  test("caps rank above vocabulary size at the bottom of the track", () => {
    expect(mapRankProgressToTrackY(WORD_RANK_VOCAB_SIZE + 1)).toBeCloseTo(1);
  });

  test("for missing rank, returns 0% progress", () => {
    expect(mapRankProgressToTrackY(null)).toBeCloseTo(1);
  });
});
