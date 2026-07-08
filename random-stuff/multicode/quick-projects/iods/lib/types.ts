export interface UploadData {
    timestamp?: string;
    [key: string]: unknown;
}


export interface UploadInfo {
    filename: string;
    path: string;
    url?: string;
}
