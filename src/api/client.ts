import { AuthApi, Configuration, GamesV1Api } from "@ssamantle/sdk-typescript";

const missingApiBaseUrlError = "REACT_APP_API_BASE_URL is required";

function createMissingApiClient<T extends object>(): T {
  return new Proxy(
    {},
    {
      get() {
        return () => Promise.reject(new Error(missingApiBaseUrlError));
      },
    },
  ) as T;
}

function createApiClient<T extends object>(
  factory: (config: Configuration) => T,
): T {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  if (!apiBaseUrl) {
    return createMissingApiClient<T>();
  }

  return factory(
    new Configuration({
      basePath: apiBaseUrl,
    }),
  );
}

export const gamesApi = createApiClient((config) => new GamesV1Api(config));
export const authApi = createApiClient((config) => new AuthApi(config));
