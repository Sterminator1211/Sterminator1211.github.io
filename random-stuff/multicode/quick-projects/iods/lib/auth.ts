import { IncomingMessage } from "http";

export function verifyAPIKey(req: IncomingMessage): boolean {
    const key = req.headers["x-api-key"];

    if (!key || typeof key !== "string") {
        return false;
    }

    return key === process.env.API_KEY;
}
