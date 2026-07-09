import { VercelRequest, VercelResponse } from "@vercel/node";

import { applyCORS } from "../lib/cors.js";
import { listUploads } from "../lib/github.js";

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

        const uploads =
            await listUploads();

        res.json(
            uploads.map(file => ({
                filename: file.name,
                path: file.path,
                size: file.size,
                sha: file.sha
            }))
        );

    } catch {

        res.status(500).json({
            error: "Failed to list uploads."
        });

    }

}
