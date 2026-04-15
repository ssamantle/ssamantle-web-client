import { Configuration, GamesV1Api } from "@ssamantle/sdk-typescript";

const config = new Configuration({
  basePath: "http://localhost:8000",
});

export const gamesApi = new GamesV1Api(config);
