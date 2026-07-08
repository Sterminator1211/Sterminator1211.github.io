import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;

const branch = process.env.GITHUB_BRANCH || "main";

export async function getFile(path: string) {
    try {
        const response = await octokit.repos.getContent({
            owner,
            repo,
            path,
            ref: branch
        });

        if (Array.isArray(response.data)) {
            throw new Error("Path is a directory");
        }

        if (!("content" in response.data)) {
            throw new Error("File content missing");
        }

        return {
            content: Buffer.from(
                response.data.content,
                "base64"
            ).toString("utf-8"),
            sha: response.data.sha
        };

    } catch (error: any) {
        if (error.status === 404) {
            return null;
        }

        throw error;
    }
}


export async function createFile(
    path: string,
    content: string,
    message: string
) {

    await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        branch,
        path,

        message,

        content: Buffer
            .from(content)
            .toString("base64")
    });

}


export async function listDirectory(path: string) {

    const response = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
    });


    if (!Array.isArray(response.data)) {
        throw new Error("Not a directory");
    }


    return response.data;
}


export async function getRawJSON(path: string) {

    const file = await getFile(path);

    if (!file) {
        return null;
    }

    return JSON.parse(file.content);
}
