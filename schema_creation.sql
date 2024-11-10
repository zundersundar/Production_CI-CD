USE heimdall_memory_db;

CREATE TABLE heimdall_mqtt_topics (
    id INT PRIMARY KEY,
    topic_name VARCHAR(255),
    customer_name VARCHAR(255),
    site_name VARCHAR(255),
    building_name VARCHAR(255)
);

create TABLE if not exists customers (
	customer_id INT(11) auto_increment primary key,
    customer_name varchar(255)
    );
    
create table if not exists sites (site_id INT(4) NOT NULL,
	customer_id INT,
    site_name VARCHAR(255),
    buildings_count INT(11),
    last_updated datetime,
    PRIMARY KEY(site_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

create table if not exists buildings (building_id INT(11) NOT NULL,
	site_id INT,
    building_name VARCHAR(255),
    floor_count INT(4),
    last_updated datetime,
    PRIMARY KEY(building_id),
    FOREIGN KEY (site_id) REFERENCES sites(site_id)
);

create table if not exists floors (floor_id INT(11) NOT NULL,
	building_id INT,
    floor_position INT(4),
    sensor_count INT(5),
    last_updated datetime,
    PRIMARY KEY(floor_id),
    FOREIGN KEY (building_id) REFERENCES buildings(building_id)
);

create table if not exists sensor_type (type_id INT(11) NOT NULL,
	type_name VARCHAR(255),
    unit VARCHAR (255),
    PRIMARY KEY(type_id)
);

create table if not exists sensors (sensor_id INT(11) NOT NULL,
    sensor_name VARCHAR(255),
	sensor_value INT,
    floor_id INT,
    type_name VARCHAR(255),
    last_updated datetime,
    PRIMARY KEY(sensor_id),
    FOREIGN KEY (floor_id) REFERENCES floors(floor_id),
    FOREIGN KEY (type_name) REFERENCES sensor_type(type_name)
    );

CREATE TABLE alarm_type (
    id INT NOT NULL,
    name VARCHAR(11),
    PRIMARY KEY (id),
    UNIQUE (name)
);

 CREATE TABLE alarms (
    id INT NOT NULL,
    sensor_id INT, 
    name VARCHAR(11), 
    upper_threshold FLOAT, 
    lower_threshold FLOAT,
    status bool Default False,
    PRIMARY KEY (id),
    FOREIGN KEY (name) REFERENCES alarm_type(name),
    FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id)
);
