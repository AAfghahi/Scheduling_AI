import { makeAutoObservable, runInAction } from 'mobx';
import axios from 'axios';
import { runPixel } from '@/api';
import { Env } from '@semoss/sdk';

/**
 * Store that manages instances of the insights and handles application level querying
 */
export class RootStore {
    private _insightId: string;
    private _isInitialized: boolean;
    private _projectId: string | null = null;

    constructor() {
        this._insightId = 'new';
        this._isInitialized = false;
        // this._snackbarContent = {
        //     message: '',
        //     autoHideDuration: 0,
        //     key: Date.now(),
        //     severity: 'error',
        //     isOpen: false,
        // };

        // Make it observable
        makeAutoObservable(this);
    }

    async initialize(insightId?: string) {
        runInAction(() => {
            if (insightId || !this._isInitialized) {
                this._insightId = insightId;
            }
        });

        try {
            console.log('get user info');
        } catch (e) {
            console.log(e);
        }

        runInAction(() => {
            //
        });

        runInAction(() => {
            this._isInitialized = true;
        });
    }

    // *********************************************************
    // Getters
    // *********************************************************
    getIsInitialized(): boolean {
        return this._isInitialized;
    }

    getInsightId(): string {
        return this._insightId;
    }

    // New Getters for projectId and path
    getProjectId(): string | null {
        return this._projectId;
    }

    // *********************************************************
    // Actions
    // *********************************************************
    /**
     * Set the project ID
     * @param projectId - The project ID to set
     */
    public setProjectId(projectId: string | null) {
        runInAction(() => {
            this._projectId = projectId;
        });
    }
    /**
     * Run a pixel string
     *
     * @param pixel - pixel to execute
     * @param errorMessage - error message to populate on fail, true for 'Error processing request', false-y to display the response
     * @param successMessage - success message to populate on success, true for 'Success', false-y to do nothing
     */
    public async runPixel<O>(
        pixel: string,
        errorMessage?: string | boolean,
        successMessage?: string | boolean,
    ): Promise<O> {
        const response = await runPixel<O>(pixel, this._insightId);
        if (response.errors.length) {
            // window.alert(response.errors[0]?.message);
            // TODO: better error handling of specific response codes
            throw new Error(response.errors[0]?.message ?? pixel);
        } else if (successMessage) {
            window.alert('sucess message');
        }
        return response.pixelReturn[0].output;
    }

    /**
     * Upload multiple files to the server with insightId, projectId, and path.
     *
     * @param files - Array of File objects to upload.
     * @returns Promise resolving to an array of uploaded file paths or identifiers.
     */
    public async uploadFiles(files: File[]): Promise<string[]> {
        if (!files.length) {
            return [];
        }

        // Construct query parameters
        const params = new URLSearchParams();
        if (this._insightId) {
            params.append('insightId', this._insightId);
        }

        const queryString = params.toString() ? `?${params.toString()}` : '';

        const url = `${Env.MODULE}/api/uploadFile/baseUpload${queryString}`;
        const formData = new FormData();
        files.forEach((file) => formData.append('file', file));

        try {
            const response = await axios.post<{ fileLocation: string }[]>(
                url,
                formData,
                {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                    },
                },
            );

            // Extract file paths from the response
            const filePaths = response.data.map((file) => file.fileLocation);
            return filePaths;
        } catch (error) {
            window.alert(error);
            throw new Error('File upload failed');
        }
    }

    /**
     * Get the file URL for downloading or embedding
     * @param insightId - The insight ID
     * @param fileKey - The file key returned from GetMnFileEmbedLink or GetSocFileEmbedLink
     * @returns The URL to the file
     */
    public getFileUrl(insightId: string, fileKey: string): string {
        return `${Env.MODULE}/api/engine/downloadFile?insightId=${insightId}&fileKey=${encodeURIComponent(
            fileKey,
        )}`;
    }
}
