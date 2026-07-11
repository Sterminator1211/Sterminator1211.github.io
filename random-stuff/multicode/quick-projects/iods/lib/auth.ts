import { IncomingMessage } from "http";

export function verifyAPIKey(
    req: IncomingMessage
): boolean {
    return true;
}
