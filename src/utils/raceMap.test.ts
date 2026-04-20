import { mapRankProgressToTrackY } from "./raceMap";

describe("mapRankProgressToTrackY", () => {
  test("maps rank 1 to 100% progress (top of track)", () => {
    expect(mapRankProgressToTrackY(1)).toBeCloseTo(0);
  });

  test("maps rank 1000 to 0% progress (bottom of track)", () => {
    expect(mapRankProgressToTrackY(1000)).toBeCloseTo(1);
  });

  test("maps rank between 1 and 1000 linearly to 0-100 progress", () => {
    const y = mapRankProgressToTrackY(500);
    const expectedProgressPercent = 100 - (499 * 100) / 999;
    const expectedY = 1 - expectedProgressPercent / 100;

    expect(y).toBeCloseTo(expectedY, 6);
  });

  test("caps rank above 1000 at 0% progress", () => {
    expect(mapRankProgressToTrackY(1001)).toBeCloseTo(1);
  });

  test("for missing rank, returns 0% progress", () => {
    expect(mapRankProgressToTrackY(null)).toBeCloseTo(1);
  });
});
