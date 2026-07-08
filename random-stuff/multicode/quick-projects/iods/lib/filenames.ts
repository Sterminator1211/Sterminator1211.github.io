import { randomUUID } from "crypto";


export function createFilename(): string {

    const timestamp =
        new Date()
            .toISOString()
            .replace(/[:.]/g, "-");


    const id =
        randomUUID()
            .split("-")[0];


    return `${timestamp}-${id}.json`;
}
