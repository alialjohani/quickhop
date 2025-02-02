import { ItemKey, Response } from "../../../Common/constants";

// OpenAI three roles
export enum Role {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system",
}

export interface Prompt {
    content: string,
    role: Role
};

export interface InitialMsgResponse extends Response {
    body?: Record<string, any>
}

export interface PrepareMessagesResponse extends Response {
    msgs?: Array<Prompt>
}

export interface OpenAiResponse extends Response {
    msg?: string | undefined,
    isConversationEnded: boolean
}