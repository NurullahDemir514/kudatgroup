declare module 'cloudinary' {
    import { UploadApiResponse } from 'cloudinary';

    export const v2: {
        config: (config: {
            cloud_name: string;
            api_key: string;
            api_secret: string;
        }) => void;
        uploader: {
            upload: (
                file: string,
                options?: {
                    folder?: string;
                    resource_type?: string;
                    use_filename?: boolean;
                    unique_filename?: boolean;
                    overwrite?: boolean;
                    transformation?: Array<{
                        width?: number;
                        height?: number;
                        crop?: string;
                        quality?: string | number;
                        format?: string;
                    }>;
                }
            ) => Promise<{
                public_id: string;
                version: number;
                signature: string;
                width: number;
                height: number;
                format: string;
                resource_type: string;
                created_at: string;
                bytes: number;
                type: string;
                url: string;
                secure_url: string;
            }>;
        };
    };
} 