import { AgentsetApiError } from "./errors";

export const parseRequestBody = async (req: Request) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await req.json();
  } catch (e) {
    console.error(e);
    throw new AgentsetApiError({
      code: "bad_request",
      message:
        "Invalid JSON format in request body. Please ensure the request body is a valid JSON object.",
    });
  }
};
