import { AuthApi, Configuration, GamesV1Api } from "@ssamantle/sdk-typescript";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("REACT_APP_API_BASE_URL is required");
}

const config = new Configuration({
  basePath: apiBaseUrl,
});

export const gamesApi = new GamesV1Api(config);
export const authApi = new AuthApi(config);
