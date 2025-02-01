export interface ItemKey {
    [key: string]: string;
}

export interface Response {
    statusCode: number;
}

export interface ErrorResponse extends Response {
    errorMessage?: string;
}

export interface DynamoItemReq {
    tableName: string,
    key: ItemKey
}

export interface DynamoItemRes extends Response {
    body?: Record<string, any>,
    errorMessage?: string
}

export interface RecordingEventRes extends Response {
    recordingKey: string;
}

export interface S3UriItemReq {
    bucket: string;
    prefix: string;
    objectKeyPartial: string;
}

export interface S3UriItemRes extends Response {
    body?: {
        uri: string;
        key: string;
    };
    errorMessage?: string
}


export interface S3TagItemReq {
    bucket: string;
    key: string;
    firstTagKey: string;
    firstTagValue: string;
    secondTagKey: string;
    secondTagValue: string;
}

export interface DatabaseConfiguration {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: {
        require: boolean;
        rejectUnauthorized: boolean;
    }
}

export interface UpdateTwoFieldsDatabase {
    tableName: string;
    field1: string;
    value1: any;
    field2: string;
    value2: any;
    condition: {
        column: string; // Column to match in the WHERE clause
        value: any; // Value to match for the condition
    };
};