import { AuthApi, Configuration, GamesV1Api } from "@ssamantle/sdk-typescript";

const config = new Configuration({
  basePath: `http://${window.location.hostname}:8000`,
});

export const gamesApi = new GamesV1Api(config);
export const authApi = new AuthApi(config);
