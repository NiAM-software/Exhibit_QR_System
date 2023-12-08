import asyncHandler from '../middleware/asyncHandler.js';
import {iventoryDBConnection as db} from '../config/db.js';
// import {drop_queries} from '../sql_queries/queries.js';
import { queries} from '../sql_queries/queries.js';

const executeQueriesInTransaction = asyncHandler(async (req, res) => {
    let connection;
    try {
        // Start database connection
        connection = await db();
        // Start transaction
        await connection.beginTransaction();

        // List of your SQL queries
        const loadIntoDummyTable = [
            `Create table exhibits_dummy(
                title        VARCHAR(255) NOT NULL UNIQUE,
                category     VARCHAR(64),
                room 	          VARCHAR(64),
                location   VARCHAR(64),
                location_type VARCHAR(64),
                asset_number INT,
                manufacturer VARCHAR(255),
                era          TEXT,
                CONSTRAINT unique_constraint UNIQUE (asset_number),
                CONSTRAINT alternate_constraint UNIQUE (title,asset_number)
            );`,

            `
            LOAD DATA LOCAL INFILE ?
            INTO TABLE exhibits_dummy 
            FIELDS TERMINATED BY ',' 
            LINES TERMINATED BY '\\n' 
            (title, category, room, location_type, location, asset_number, manufacturer, era);
        `
        ];

        // Execute each query sequentially
        for (const query of loadIntoDummyTable) {
            await connection.execute(query);
        }

        for (const query of queries) {
            await connection.execute(query);
        }
        
        // Commit transaction
        await connection.commit();
        res.status(201).json({ message: 'All queries executed successfully in transaction' });

    } catch (error) {
        // Rollback transaction in case of error
        if (connection) {
            await connection.rollback();
        }
        console.error('Transaction failed:', error);
        res.status(500).json({ message: 'Transaction failed', error: error.message });
    } finally {
        // Close the connection
        if (connection) {
            await connection.end();
        }
    }
});

export{executeQueriesInTransaction};
