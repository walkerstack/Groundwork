import { AgentsetApiError } from "./errors";

export const parseRequestBody = async (req: Request) => {
  try {
    const body = await req.json();
    return body;
  } catch (e) {
    console.error(e);
    throw new AgentsetApiError({
      code: "bad_request",
      message:
        "Invalid JSON format in request body. Please ensure the request body is a valid JSON object.",
    });
  }
};
