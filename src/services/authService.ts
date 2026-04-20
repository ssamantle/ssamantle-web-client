import { authApi } from "../api/client";

export async function validateSession(sessionId: string): Promise<boolean> {
  const response = await authApi.validateTokenAuthValidateGet(sessionId);

  if (typeof response === "boolean") {
    return response;
  }

  throw new Error("Unexpected session validation response");
}
