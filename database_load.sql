-- drop table exhibits_dummy;
-- drop table if exists attachments;
-- drop table if exists related_exhibits;
-- drop table if exists exhibits;
-- drop table if exists room;
-- drop table if exists location;
-- drop table if exists location_type;
-- drop table if exists category;


-- Database creation for user authentication and table creation
create database authentication;
use authentication;

Create table users (
_id         INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
user_name VARCHAR(255) NOT NULL,
email           VARCHAR(255) NOT NULL UNIQUE,
password_hash    VARCHAR(60) NOT NULL,
create_ts     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
update_ts   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
token VARCHAR(255),
    expiration_time DATETIME
);

-- Database creation for museum inventory and tables

create database museum_inventory;
use museum_inventory;

Create table exhibits_dummy(
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
    );

LOAD DATA LOCAL INFILE "/Users/srivenkat/Documents/test/Exhibit_QR_System/processed_data/processed_exhibits.csv"
         INTO TABLE exhibits_dummy 
         FIELDS TERMINATED BY ',' 
         LINES TERMINATED BY '\\n' 
         (title, category, room, location_type, location, asset_number, manufacturer, era);
            
Create table category(
category_id    INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
category_name  VARCHAR(64) NOT NULL,
active_ind	   varchar(4),
CONSTRAINT unique_constraint UNIQUE (category_name)
);
            
Insert into category(category_name,active_ind)
select distinct category as category_name,'Y' as active_ind from exhibits_dummy where category is not null;            
            
Create table location_type(
id    INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
location_type  VARCHAR(64) NOT NULL,
active_ind	   varchar(4),
CONSTRAINT unique_constraint UNIQUE (location_type)
  );
            
Insert into location_type(location_type,active_ind)
select distinct location_type,'Y' as active_ind from exhibits_dummy
where location_type is not null;
            
Create table room(
	room_id    INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
	room_name  VARCHAR(64) NOT NULL,
	active_ind	   varchar(4),
	CONSTRAINT unique_constraint UNIQUE (room_name)
);
            
Insert into room(
room_name,
active_ind)
select distinct room as room_name,'Y' as active_ind 
from exhibits_dummy
where room is not null;

Create table exhibits(
exhibit_id    INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
title         VARCHAR(255) NOT NULL,
category_id   INT,
subcategory   VARCHAR(64),
room_id 	  INT,
loctype_id 	  INT,
location   VARCHAR(255),
asset_number INT CHECK (asset_number > -1),
manufacturer VARCHAR(255),
era            TEXT,
exhibit_desc   TEXT,
active_ind	varchar(4),
CONSTRAINT unique_constraint UNIQUE (asset_number),
CONSTRAINT alternate_constraint UNIQUE (title,asset_number),
FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE SET NULL,
FOREIGN KEY (room_id) REFERENCES room (room_id) ON DELETE SET NULL,
FOREIGN KEY (loctype_id) REFERENCES location_type (id) ON DELETE SET NULL
);
            
INSERT INTO exhibits
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
    left join room r on e.room=r.room_name;
    
CREATE TABLE attachments (
	attachment_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	exhibit_id INT NOT NULL,
	file_name VARCHAR(255) NOT NULL,
	file_location VARCHAR(255) NOT NULL,
	file_size INT,
	file_type VARCHAR(255),
	CONSTRAINT unique_attachment_info UNIQUE (exhibit_id, file_name, file_location),
	FOREIGN KEY (exhibit_id) REFERENCES exhibits (exhibit_id)
);
            
Create table related_exhibits (
	relation_id  INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
	exhibit_id    INT NOT NULL,
	related_exhibit_id INT NOT NULL,
	CONSTRAINT constraint_name UNIQUE (exhibit_id,related_exhibit_id),
	FOREIGN KEY (exhibit_id) REFERENCES exhibits (exhibit_id)
);

Insert into category(category_name,active_ind)
VALUES
('Extra Item type 1','Y'),
('Extra Item type 2','Y'),
('Extra Item type 3','Y'),
('Extra Item type 4','Y'),
('Extra Item type 5','Y'),
('Extra Item type 6','Y'),
('Extra Item type 7','Y'),
('Extra Item type 8','Y'),
('Extra Item type 9','Y'),
('Extra Item type 10','Y'),
('Extra Item type 11','Y'),
('Extra Item type 12','Y'),
('Extra Item type 13','Y'),
('Extra Item type 14','Y'),
('Extra Item type 15','Y');


INSERT INTO location_type (location_type, active_ind)
VALUES
('Extra Location type 1', 'Y'),
('Extra Location type 2', 'Y'),
('Extra Location type 3', 'Y'),
('Extra Location type 4', 'Y'),
('Extra Location type 5', 'Y'),
('Extra Location type 6', 'Y'),
('Extra Location type 7', 'Y'),
('Extra Location type 8', 'Y'),
('Extra Location type 9', 'Y'),
('Extra Location type 10', 'Y'),
('Extra Location type 11', 'Y'),
('Extra Location type 12', 'Y'),
('Extra Location type 13', 'Y'),
('Extra Location type 14', 'Y'),
('Extra Location type 15', 'Y'),
('Extra Location type 16', 'Y'),
('Extra Location type 17', 'Y'),
('Extra Location type 18', 'Y'),
('Extra Location type 19', 'Y'),
('Extra Location type 20', 'Y'),
('Extra Location type 21', 'Y'),
('Extra Location type 22', 'Y'),
('Extra Location type 23', 'Y'),
('Extra Location type 24', 'Y'),
('Extra Location type 25', 'Y'),
('Extra Location type 26', 'Y'),
('Extra Location type 27', 'Y'),
('Extra Location type 28', 'Y'),
('Extra Location type 29', 'Y'),
('Extra Location type 30', 'Y');


INSERT INTO room (room_name, active_ind)
VALUES
('Extra Room 1', 'Y'),
('Extra Room 2', 'Y'),
('Extra Room 3', 'Y'),
('Extra Room 4', 'Y'),
('Extra Room 5', 'Y'),
('Extra Room 6', 'Y'),
('Extra Room 7', 'Y'),
('Extra Room 8', 'Y'),
('Extra Room 9', 'Y'),
('Extra Room 10', 'Y');


INSERT IGNORE INTO room (room_name, active_ind)
VALUES
('Extra Room 1', 'Y'),
('Extra Room 2', 'Y'),
('Extra Room 3', 'Y'),
('Extra Room 4', 'Y'),
('Extra Room 5', 'Y');

