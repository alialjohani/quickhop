import { Client } from "pg"; // For PostgreSQL
import dotenv from 'dotenv'
import { SecretManager } from "../../Common/SecretManager/SecretManager";
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || '', // e.g., 'your-database-endpoint.amazonaws.com'
    port: parseInt(process.env.DB_PORT || "5432", 10), // default PostgreSQL port
    user: process.env.DB_USER || '', // database username
    password: process.env.PASSWORD || '',
    database: process.env.DB_NAME || '', // database name
    ssl: {
        require: true,
        rejectUnauthorized: false,
    }
};

const DB_PASSWORD_ARN = process.env.DB_PASSWORD_ARN || '';

export const handler = async (): Promise<string> => {
    const client = new Client(dbConfig);
    try {
        const retPassword = await SecretManager(DB_PASSWORD_ARN);
        console.log(">> retPassword: ", retPassword)
        await client.connect();
        const res = await client.query("SELECT NOW()");
        console.log(">> res.rows: ", res.rows);
        return ">> OK"
    } catch (error) {
        console.error(">> ERROR: ", error)
        return ">> Error";
    } finally {
        await client.end();
    }


};