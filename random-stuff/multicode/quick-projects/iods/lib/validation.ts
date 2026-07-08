export function validateJSON(
    data: unknown
): boolean {

    if (
        typeof data !== "object" ||
        data === null
    ) {
        return false;
    }


    const size =
        JSON.stringify(data)
            .length;


    // 1 MB limit
    if (size > 1024 * 1024) {
        return false;
    }


    return true;
}
