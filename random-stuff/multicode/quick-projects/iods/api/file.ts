import { VercelRequest, VercelResponse } from "@vercel/node";

import { applyCORS } from "../lib/cors.js";
import { getUpload } from "../lib/github.js";

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

    const filename = req.query.name;

    if (
        typeof filename !== "string" ||
        filename.length === 0
    ) {
        return res.status(400).json({
            error: "Missing filename."
        });
    }

    try {

        const upload =
            await getUpload(filename);

        if (!upload) {
            return res.status(404).json({
                error: "File not found."
            });
        }

        return res.json(upload);

    } catch {

        return res.status(500).json({
            error: "Failed to load upload."
        });

    }
}
