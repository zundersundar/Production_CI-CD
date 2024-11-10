from marshmallow import Schema, fields

class MqttTopicSchema(Schema):
    id = fields.Int()
    topic_name = fields.Str()
    customer_name = fields.Str()
    site_name = fields.Str()
    building_name = fields.Str()

class CustomerSchema(Schema):
    customer_id = fields.Int(dump_only=True)  
    customer_name = fields.Str(required=True)
    email = fields.Email(required=True)
    logo = fields.Str(required=True)
    sites_count = fields.Method("get_sites_count")

    def get_sites_count(self,obj):
        return obj.get('sites_count',0)

class SiteSchema(Schema):
    site_id = fields.Int(dump_only=True)  
    customer_id = fields.Int(required=True)  
    site_name = fields.Str(required=True)  
    site_location = fields.Str(required=True)  
    last_updated = fields.DateTime()  
    buildings_count = fields.Method("get_buildings_count")  

    def get_buildings_count(self, obj):
        return obj.get('buildings_count', 0)  

class BuildingSchema(Schema):
    building_id = fields.Int(dump_only=True)
    site_id = fields.Int(required=True)
    building_name = fields.Str(required=True)
    last_updated = fields.DateTime() 
    floors_count = fields.Method("get_floors_count")

    def get_floors_count(self, obj):
        return obj.get('floors_count', 0)

class FloorSchema(Schema):
    floor_id = fields.Int(dump_only=True)
    building_id = fields.Int(required=True)
    floor_position = fields.Int(required=True)
    last_updated = fields.DateTime()
    floor_plan = fields.Str(required=True)
    sensors_count = fields.Method("get_sensors_count")

    def get_sensors_count(self, obj):
        return obj.get('sensors_count', 0)

class SensorSchema(Schema):
    sensor_id = fields.Int(dump_only=True)
    floor_id = fields.Int(required=True)
    type_name = fields.Str()
    sensor_name = fields.Str(required=True)
    building_name = fields.Str()
    customer_name = fields.Str()
    site_name = fields.Str()
    sensor_type = fields.Str(required=True)
    value = fields.Float(required=True)
    source = fields.Str(required=True)
    x_coordinate = fields.Float(required=True)
    y_coordinate = fields.Float(required=True)
    last_updated = fields.DateTime()

class AlarmTypeSchema(Schema):
    id = fields.Int(required=True)
    name = fields.Str(required=True)
    severity = fields.Str(required=True)

class AlarmSchema(Schema):
    id = fields.Int(dump_only=True)  
    building_id = fields.Int(required=True)
    sensor_id = fields.Int(required=True)
    name = fields.Str(required=True)
    upper_threshold = fields.Float(required=True)
    lower_threshold = fields.Float(required=True)
    floor_id = fields.Int(required=True)
