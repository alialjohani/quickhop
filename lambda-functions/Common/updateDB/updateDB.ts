import { DatabaseConfiguration, ErrorResponse, Response, UpdateTwoFieldsDatabase } from '../constants';
import handleException from '../handleException/handleException';
import { Client } from "pg";

export const updateDB = async (dbConfig: DatabaseConfiguration, row: UpdateTwoFieldsDatabase): Promise<Response | ErrorResponse> => {
    const client = new Client(dbConfig);

    try {
        let response: Response = {
            statusCode: 200
        };
        const { tableName, field1, value1, field2, value2, condition } = row;
        const query = `
            UPDATE "${tableName}"
            SET "${field1}" = $1, "${field2}" = $2
            WHERE "${condition.column}" = $3;
        `;
        const values = [value1, value2, condition.value];

        await client.connect(); // Establish connection
        const res = await client.query(query, values); // Execute the query
        if (res.rowCount === 0) {
            console.error(`updateDB(), res= ${JSON.stringify(res)}`);
            console.error(`updateDB(), row= ${JSON.stringify(row)}`);
            console.error(`updateDB(), query= ${JSON.stringify(query)}`);
            return handleException('Failed to update the specific field in DB', 'updateDB()');
        }
        return response;

    } catch (err) {
        console.error(`updateDB(), dbConfig= ${JSON.stringify(dbConfig)}`);
        console.error(`updateDB(), row= ${JSON.stringify(row)}`);
        return handleException(err, 'updateDB()')
    } finally {
        await client.end();
    }
}