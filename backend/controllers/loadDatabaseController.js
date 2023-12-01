import asyncHandler from '../middleware/asyncHandler.js';
import {iventoryDBConnection as db} from '../config/db.js'

const executeQueriesInTransaction = asyncHandler(async (req, res) => {
    let connection;
    try {
        // Start database connection
        connection = await db();
        // Start transaction
        await connection.beginTransaction();

        // List of your SQL queries
        const queries = [
            `drop table if exists attachments;`,
            `drop table if exists related_exhibits;`,
            `drop table if exists exhibits;`,
            `drop table if exists room;`,
            `drop table if exists location_type;`,
            `drop table if exists category;`,
            `drop table if exists exhibits_dummy;`,
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
        `,

            `Create table category(
                category_id    INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
                category_name  VARCHAR(64) NOT NULL,
                active_ind	   varchar(4),
                CONSTRAINT unique_constraint UNIQUE (category_name)
            );`,
            
            `Insert into category(category_name,active_ind)
            select distinct category as category_name,'Y' as active_ind from exhibits_dummy where category is not null;`,
            
            
            `Create table location_type(
                id    INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
                location_type  VARCHAR(64) NOT NULL,
                active_ind	   varchar(4),
                CONSTRAINT unique_constraint UNIQUE (location_type)
            );`,
            
            `Insert into location_type(
            location_type,
            active_ind)
            select distinct location_type,'Y' as active_ind from exhibits_dummy
            where location_type is not null;`,
            
            `Create table room(
                room_id    INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
                room_name  VARCHAR(64) NOT NULL,
                active_ind	   varchar(4),
                CONSTRAINT unique_constraint UNIQUE (room_name)
            );`,
            
            `Insert into room(
            room_name,
            active_ind)
            select distinct room as room_name,'Y' as active_ind 
            from exhibits_dummy
            where room is not null;`,
            
            `Create table exhibits(
                exhibit_id    INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
                title         VARCHAR(255) NOT NULL,
                category_id   INT,
                subcategory   VARCHAR(64),
                room_id 	  INT,
                loctype_id 	  INT,
                location   VARCHAR(255),,
                asset_number INT CHECK (asset_number > 0),
                manufacturer VARCHAR(255),
                era            TEXT,
                exhibit_desc   TEXT,
                active_ind	varchar(4),
                CONSTRAINT unique_constraint UNIQUE (asset_number),
                CONSTRAINT alternate_constraint UNIQUE (title,asset_number),
                FOREIGN KEY (category_id) REFERENCES category (category_id),
                FOREIGN KEY (room_id) REFERENCES room (room_id),
                FOREIGN KEY (loctype_id) REFERENCES location_type (id)
            );`,
            
            `INSERT INTO exhibits
            (title,
            category_id,
            room_id,
            loctype_id,
            location_id,
            asset_number,
            manufacturer,
            era,
            active_ind)
            select
            e.title as title,
            c.category_id as category_id,
            r.room_id as room_id,
            lt.id as loctype_id,
            e.location,
            e.asset_number as asset_number,
            e.manufacturer as manufacturer,
            e.era as era,
            'Y' as active_ind
            FROM exhibits_dummy e
            left join category c on e.category=c.category_name
            left join location_type lt on e.location_type=lt.location_type
            left join room r on e.room=r.room_name;`,

            `CREATE TABLE attachments (
                attachment_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                exhibit_id INT NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_location VARCHAR(255) NOT NULL,
                file_size INT,
                file_type VARCHAR(255),
                CONSTRAINT unique_attachment_info UNIQUE (exhibit_id, file_name, file_location),
                FOREIGN KEY (exhibit_id) REFERENCES exhibits (exhibit_id)
            );`,
            
            `Create table related_exhibits (
                relation_id  INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
                exhibit_id    INT NOT NULL,
                related_exhibit_id INT NOT NULL,
                CONSTRAINT constraint_name UNIQUE (exhibit_id,related_exhibit_id),
                FOREIGN KEY (exhibit_id) REFERENCES exhibits (exhibit_id)
                );`,
        ];

        // Execute each query sequentially
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
