const drop_queries =[
    // `drop table if exists attachments;`,
    // `drop table if exists related_exhibits;`,
    // `drop table if exists exhibits;`,
    // `drop table if exists room;`,
    // `drop table if exists location_type;`,
    // `drop table if exists category;`,
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

];

export default drop_queries;