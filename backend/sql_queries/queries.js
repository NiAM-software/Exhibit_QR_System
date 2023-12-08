const queries = [
    // `Create table category(
    //     category_id    INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
    //     category_name  VARCHAR(64) NOT NULL,
    //     active_ind	   varchar(4),
    //     CONSTRAINT unique_constraint UNIQUE (category_name)
    // );`,
    
    `Insert  IGNORE into category(category_name,active_ind)
    select distinct category as category_name,'Y' as active_ind from exhibits_dummy where category is not null;`,
    
    
    // `Create table location_type(
    //     id    INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
    //     location_type  VARCHAR(64) NOT NULL,
    //     active_ind	   varchar(4),
    //     CONSTRAINT unique_constraint UNIQUE (location_type)
    // );`,
    
    `Insert IGNORE into location_type(
    location_type,
    active_ind)
    select distinct location_type,'Y' as active_ind from exhibits_dummy
    where location_type is not null;`,
    
    // `Create table room(
    //     room_id    INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
    //     room_name  VARCHAR(64) NOT NULL,
    //     active_ind	   varchar(4),
    //     CONSTRAINT unique_constraint UNIQUE (room_name)
    // );`,
    
    `Insert IGNORE into room(
    room_name,
    active_ind)
    select distinct room as room_name,'Y' as active_ind 
    from exhibits_dummy
    where room is not null;`,
    
    // `Create table exhibits(
    //     exhibit_id    INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
    //     title         VARCHAR(255) NOT NULL,
    //     category_id   INT,
    //     subcategory   VARCHAR(64),
    //     room_id 	  INT,
    //     loctype_id 	  INT,
    //     location   VARCHAR(255),
    //     asset_number INT CHECK (asset_number>-1),
    //     manufacturer VARCHAR(255),
    //     era            TEXT,
    //     exhibit_desc   TEXT,
    //     active_ind	varchar(4),
    //     CONSTRAINT unique_constraint UNIQUE (asset_number),
    //     CONSTRAINT alternate_constraint UNIQUE (title,asset_number),
    //     FOREIGN KEY (category_id) REFERENCES category (category_id),
    //     FOREIGN KEY (room_id) REFERENCES room (room_id),
    //     FOREIGN KEY (loctype_id) REFERENCES location_type (id)
    // );`,
    
    `INSERT IGNORE INTO exhibits
    (title,
    category_id,
    room_id,
    loctype_id,
    location,
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

    // `CREATE TABLE attachments (
    //     attachment_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    //     exhibit_id INT NOT NULL,
    //     file_name VARCHAR(255) NOT NULL,
    //     file_location VARCHAR(255) NOT NULL,
    //     file_size INT,
    //     file_type VARCHAR(255),
    //     CONSTRAINT unique_attachment_info UNIQUE (exhibit_id, file_name, file_location),
    //     FOREIGN KEY (exhibit_id) REFERENCES exhibits (exhibit_id)
    // );`,
    
    // `Create table related_exhibits (
    //     relation_id  INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
    //     exhibit_id    INT NOT NULL,
    //     related_exhibit_id INT NOT NULL,
    //     CONSTRAINT constraint_name UNIQUE (exhibit_id,related_exhibit_id),
    //     FOREIGN KEY (exhibit_id) REFERENCES exhibits (exhibit_id)
    //     );`,
];

export default queries;