export interface Model {
    database_name?: string;
    database_id?: string;
}

export interface LLMResponse {
    response?: string;
    [key: string]: unknown;
}