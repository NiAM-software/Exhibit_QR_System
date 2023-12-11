const queries = [
    `Insert  IGNORE into category(category_name,active_ind)
    select distinct category as category_name,'Y' as active_ind from exhibits_dummy where category is not null;`,
    
    `Insert IGNORE into location_type(
    location_type,
    active_ind)
    select distinct location_type,'Y' as active_ind from exhibits_dummy
    where location_type is not null;`,
    
    `Insert IGNORE into room(
    room_name,
    active_ind)
    select distinct room as room_name,'Y' as active_ind 
    from exhibits_dummy
    where room is not null;`,
        
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
];

export default queries;