/**
 * Gets the password form Secret Manager
 */

import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({});

export const SecretManager = async (secret_name: string): Promise<string> => {
    try {
        const output = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
            }),
        );

        if (output && output.$metadata.httpStatusCode === 200 && output.SecretString) {
            return JSON.parse(output.SecretString)["password"];

        }
        return '';
    } catch (err) {
        console.error(`SecretManager(), err= ${JSON.stringify(err)}`);
        return ''
    }
}