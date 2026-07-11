import { VercelRequest, VercelResponse } from "@vercel/node";

import { verifyAPIKey } from "../lib/auth.js";
import { applyCORS } from "../lib/cors.js";
import { createFilename } from "../lib/filenames.js";
import { validateJSON } from "../lib/validation.js";
import { createFile } from "../lib/github.js";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {

    applyCORS(res);

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    if (!verifyAPIKey(req)) {
        return res.status(401).json({
            error: "Invalid API key"
        });
    }

    try {

        const body = req.body;

        if (!validateJSON(body)) {
            return res.status(400).json({
                error: "Invalid JSON data"
            });
        }

        const uploadData = {
            timestamp: new Date().toISOString(),
            ...body
        };

        const filename = createFilename();

        const path = `data/${filename}`;

        await createFile(
            path,
            uploadData,
            `Upload ${filename}`
        );

        return res.status(200).json({
            success: true,
            filename,
            path
        });

    } catch (error: any) {

        console.error(error);

        return res.status(500).json({
            error: "Upload failed",
            message: error?.message,
            status: error?.status,
            github: error?.response?.data
        });

    }

}
