import { VercelRequest, VercelResponse } from "@vercel/node";

import { applyCORS } from "../lib/cors.js";
import { getLatestUpload } from "../lib/github.js";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {

    applyCORS(res);

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const latest =
            await getLatestUpload();

        if (!latest) {
            return res.status(404).json({
                error: "No uploads."
            });
        }

        res.json(latest);

    } catch {

        res.status(500).json({
            error: "Failed."
        });

    }

}
