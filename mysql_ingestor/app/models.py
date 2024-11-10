from app import db
#import sqlalchemy as db

class HeimdallMqttTopics(db.Model):
    __tablename__ = 'heimdall_mqtt_topics'
    id = db.Column(db.Integer, primary_key=True)
    topic_name = db.Column(db.String(255))
    customer_name = db.Column(db.String(255))
    site_name = db.Column(db.String(255))
    building_name = db.Column(db.String(255))

class Customer(db.Model):
    __tablename__ = 'customers'
    customer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_name = db.Column(db.String(255))
    email = db.Column(db.String(255))
    logo = db.Column(db.String(255))
    sites = db.relationship('Site', backref='customer', cascade="all, delete")

class Site(db.Model):
    __tablename__ = 'sites'
    site_id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.customer_id'))
    site_name = db.Column(db.String(255))
    last_updated = db.Column(db.DateTime)
    site_location = db.Column(db.String(255))
    buildings = db.relationship('Building', backref='site', cascade="all, delete")

class Building(db.Model):
    __tablename__ = 'buildings'
    building_id = db.Column(db.Integer, primary_key=True)
    site_id = db.Column(db.Integer, db.ForeignKey('sites.site_id'))
    building_name = db.Column(db.String(255))
    last_updated = db.Column(db.DateTime)
    floors = db.relationship('Floor', backref='building', cascade="all, delete")

class Floor(db.Model):
    __tablename__ = 'floors'
    floor_id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey('buildings.building_id'))
    floor_position = db.Column(db.Integer)
    last_updated = db.Column(db.DateTime)
    floor_plan = db.Column(db.String(255))
    sensors = db.relationship('Sensor', backref='floor', cascade="all, delete")

class SensorType(db.Model):
    __tablename__ = 'sensor_type'
    type_id = db.Column(db.Integer, primary_key=True)
    type_name = db.Column(db.String(255))
    unit = db.Column(db.String(255))

class AlarmType(db.Model):
    __tablename__ = 'alarm_type'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), unique = True)
    severity = db.Column(db.String(255), unique = True)

class Sensor(db.Model):
    __tablename__ = 'sensors'
    sensor_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sensor_name = db.Column(db.String(255))
    value = db.Column(db.Integer)
    floor_id = db.Column(db.Integer, db.ForeignKey('floors.floor_id'))  
    type_name = db.Column(db.String(255), db.ForeignKey('sensor_type.type_name'))
    source = db.Column(db.String(255))
    x_coordinate = db.Column(db.Double)
    y_coordinate = db.Column(db.Double)
    last_updated = db.Column(db.DateTime)
    sensor_type = db.relationship('SensorType', backref='sensors')


class Alarms(db.Model):
    __tablename__ = 'alarms'
    id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey('buildings.building_id'))
    sensor_id = db.Column(db.Integer, db.ForeignKey('sensors.sensor_id'))
    name = db.Column(db.String(255), db.ForeignKey('alarm_type.name'))
    upper_threshold = db.Column(db.Float)
    lower_threshold = db.Column(db.Float)
    floor_id = db.Column(db.Integer, db.ForeignKey('floors.floor_id'))
    last_updated = db.Column(db.DateTime)
    status = db.Column(db.Boolean)