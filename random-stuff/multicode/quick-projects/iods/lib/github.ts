import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
    auth: process.env.IODS_GH_TOKEN
});

const DATA_DIR =
    process.env.IODS_DATA_DIR ||
    "data";

const owner =
    process.env.IODS_GH_OWNER!;

const repo =
    process.env.IODS_GH_REPO!;

const branch =
    process.env.IODS_GH_BRANCH ||
    "main";


export async function getFile(
    path: string
) {

    try {

        const response =
            await octokit.repos.getContent({
                owner,
                repo,
                path,
                ref: branch
            });


        if (
            Array.isArray(response.data) ||
            response.data.type !== "file"
        ) {
            throw new Error(
                "Expected a file but received a directory or invalid object."
            );
        }


        const file =
            response.data as {
                type: "file";
                content: string;
            };


        return JSON.parse(
            Buffer.from(
                file.content,
                "base64"
            ).toString("utf8")
        );


    } catch (error: any) {

        console.error(
            "GitHub getFile error:",
            {
                message: error?.message,
                status: error?.status,
                response: error?.response?.data,
                path,
                owner,
                repo,
                branch
            }
        );


        if (error.status === 404) {
            return null;
        }


        throw error;

    }

}



export async function createFile(
    path: string,
    data: unknown,
    message: string
) {

    try {

        await octokit.repos.createOrUpdateFileContents({

            owner,
            repo,

            branch,

            path,

            message,

            content:
                Buffer
                    .from(
                        JSON.stringify(
                            data,
                            null,
                            2
                        )
                    )
                    .toString("base64")

        });


    } catch (error: any) {

        console.error(
            "GitHub createFile error:",
            {
                message: error?.message,
                status: error?.status,
                response: error?.response?.data,

                owner,
                repo,
                branch,
                path
            }
        );


        throw error;

    }

}



export async function listUploads() {

    try {

        const response =
            await octokit.repos.getContent({

                owner,
                repo,

                path: DATA_DIR,

                ref: branch

            });


        if (!Array.isArray(response.data)) {
            return [];
        }


        return response.data

            .filter(
                file =>
                    file.type === "file"
            )

            .sort(
                (a, b) =>
                    b.name.localeCompare(
                        a.name
                    )
            );


    } catch (error: any) {

        console.error(
            "GitHub listUploads error:",
            {
                message: error?.message,
                status: error?.status,
                response: error?.response?.data,

                owner,
                repo,
                branch,
                DATA_DIR
            }
        );


        throw error;

    }

}



export async function getUpload(
    filename: string
) {

    return getFile(
        `${DATA_DIR}/${filename}`
    );

}



export async function getLatestUpload() {

    const uploads =
        await listUploads();


    if (
        uploads.length === 0
    ) {
        return null;
    }


    return getUpload(
        uploads[0].name
    );

}
