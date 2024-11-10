#This code uses REDIS_HOST and REDIS_PORT as environment variables.
#This code also requires the environment variables, RDS_HOSTNAME, RDS_USERNAME, RDS_PASSWORD and RDS_DB_NAME, for connecting to the database.
from flask import Blueprint, jsonify, request, current_app, send_from_directory, abort
from app.models import *
from app import db
from app.utils import token_required, get_db_connector
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from werkzeug.utils import secure_filename
import os
from app.schemas import *
from app.decorators import response_validation,error_handling
from heimdall_tools.redis_client import get_redis_connection
import json
from heimdall_tools.vault import get_vault_secrets

common_secrets, user_secrets= get_vault_secrets(
        os.getenv('VAULT_ADDR'),os.getenv('VAULT_USER_SECRETS_PATH'),
        os.getenv('VAULT_USERNAME'),os.getenv('VAULT_PASSWORD')
    )
redis_client = get_redis_connection(
        host_name=common_secrets.get('REDIS_HOST'),
        port=int(common_secrets.get('REDIS_PORT')),
        db=0
    )

bp = Blueprint('routes', __name__)

@bp.route('/mqtt_topics', methods=['GET'])
@error_handling  
@response_validation(MqttTopicSchema(many=True))  
def read_mqtt_topics():
    cache_key = 'mqtt_topics'
    
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data)), 200

    conn = get_db_connector()
    topics = conn.db_read_mqtt_topic_names()

    if not topics:
        return {'message': 'No MQTT topics found'}, 404

    serialized_topics = MqttTopicSchema(many=True).dump(topics)

    redis_client.setex(cache_key, 3600, json.dumps(serialized_topics))
    return jsonify(serialized_topics), 200


@bp.route('/customers', methods=['GET'])
@error_handling  
@response_validation(CustomerSchema(many=True))  
def read_customers():
    cache_key = 'customers'  

    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data)), 200

    conn = get_db_connector()
    customers = conn.db_read_customers()

    if not customers:
        return {'message': 'No customers found'}, 404

    serialized_customers = CustomerSchema(many=True).dump(customers)

    redis_client.setex(cache_key, 3600, json.dumps(serialized_customers))
    return jsonify(serialized_customers), 200



ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif','.svg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/upload_logo', methods=['POST'])
def upload_logo():
    CUSTOMER_LOGO_UPLOAD_FOLDER = current_app.config['CUSTOMER_LOGO_UPLOAD_FOLDER']
    MAX_FILE_SIZE = 10 * 1024 * 1024  

    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if len(file.read()) > MAX_FILE_SIZE:
        return jsonify({'message': 'File is too large'}), 400
    file.seek(0)
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        unique_filename = f'{timestamp}_{filename}'
        file_path = os.path.join(CUSTOMER_LOGO_UPLOAD_FOLDER, unique_filename)
        os.makedirs(CUSTOMER_LOGO_UPLOAD_FOLDER, exist_ok=True)
        file.save(file_path)

        return jsonify({'file_name': f'{unique_filename}'}), 201

    return jsonify({'message': 'Invalid file type'}), 400


@bp.route('/delete_logo/<filename>', methods=['DELETE'])
def delete_logo(filename):
    CUSTOMER_LOGO_UPLOAD_FOLDER = current_app.config['CUSTOMER_LOGO_UPLOAD_FOLDER']

    if not filename:
        return jsonify({'message': 'File name not provided'}), 400

    file_path = os.path.join(CUSTOMER_LOGO_UPLOAD_FOLDER, filename)

    try:
        if os.path.exists(file_path):
            os.remove(file_path)

            return jsonify({'message': 'File deleted successfully'}), 200
        else:
            return jsonify({'message': 'File not found'}), 404
    except Exception as e:
        return jsonify({'message': f'Error occurred: {str(e)}'}), 500


@bp.route('/uploads/customer_logo/<filename>', methods=['GET'])
def get_uploaded_logo(filename):
    CUSTOMER_LOGO_UPLOAD_FOLDER = current_app.config['CUSTOMER_LOGO_UPLOAD_FOLDER']
    return send_from_directory(CUSTOMER_LOGO_UPLOAD_FOLDER, filename)


@bp.route('/customer', methods=['POST'])
@error_handling
@response_validation(CustomerSchema())
def add_customer():
    data = request.json
    conn = get_db_connector()

    customer_schema = CustomerSchema()
    validated_data = customer_schema.load(data)

    new_customer_id = conn.db_add_customer(
        customer_name=validated_data['customer_name'],
        email=validated_data['email'],
        logo=validated_data['logo']
    )
    cache_key = 'customers'
    redis_client.delete(cache_key)

    return {"new_customer_id": new_customer_id}, 201


@bp.route('/customer/<int:customer_id>', methods=['PUT'])
@error_handling
@response_validation(CustomerSchema(partial=True))
def update_customer(customer_id):
    data = request.json
    conn = get_db_connector()

    customer_schema = CustomerSchema(partial=True)
    validated_data = customer_schema.load(data, partial=True)

    status = conn.db_update_customer(
        customer_id=customer_id,
        customer_name=validated_data.get('customer_name'),
        email=validated_data.get('email'),
        logo=validated_data.get('logo')
    )

    if status == 'not_found':
        return {'message': 'Customer not found'}, 404

    cache_key = 'customers'
    redis_client.delete(cache_key)

    return {'status': status}, 200


@bp.route('/customer/<int:customer_id>', methods=['DELETE'])
@error_handling
def delete_customer(customer_id):
    conn = get_db_connector()

    status = conn.db_delete_customer(customer_id)

    if status == 'not_found':
        return {'message': 'Customer not found'}, 404

    cache_key = 'customers'
    redis_client.delete(cache_key)

    return {'status': status}, 200


@bp.route('/sites_by_customer_id/<int:customer_id>', methods=['GET'])
@error_handling
@response_validation(SiteSchema(many=True))
def read_sites_customer_id(customer_id):
    cache_key = f'sites_by_customer_id_{customer_id}' 

    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data)), 200

    conn = get_db_connector()
    sites = conn.db_read_sites_customer_id(customer_id)

    if not sites:
        return jsonify({'message': 'No sites found for the given customer'}), 404

    serialized_sites = SiteSchema(many=True).dump(sites)

    redis_client.setex(cache_key, 3600, json.dumps(serialized_sites))  
    return jsonify(serialized_sites), 200


@bp.route('/site', methods=['POST'])
@error_handling
@response_validation(SiteSchema())
def add_site():
    data = request.json
    conn = get_db_connector()

    site_schema = SiteSchema()
    validated_data = site_schema.load(data)

    new_site_id = conn.db_add_site(
        site_name=validated_data['site_name'],
        customer_id=validated_data['customer_id'],
        site_location=validated_data['site_location']
    )

    cache_key_sites = f'sites_by_customer_id_{validated_data["customer_id"]}'
    redis_client.delete(cache_key_sites)

    cache_key_customers = 'customers'
    redis_client.delete(cache_key_customers)

    return {"site_id": new_site_id}, 201


@bp.route('/site/<int:site_id>', methods=['PUT'])
@error_handling
@response_validation(SiteSchema())
def update_site(site_id):
    data = request.json
    conn = get_db_connector()

    site_schema = SiteSchema(partial=True)
    validated_data = site_schema.load(data, partial=True)

    existing_site = conn.db_get_site_by_id(site_id)
    if not existing_site:
        return {'message': 'Site not found'}, 404

    status = conn.db_update_site(
        site_id=site_id,
        site_name=validated_data.get('site_name'),
        customer_id=validated_data.get('customer_id'),
        site_location=validated_data.get('site_location')
    )

    if status == 'not_found':
        return {'message': 'Site not found'}, 404

    customer_id = validated_data.get('customer_id') or existing_site['customer_id']
    cache_key_sites = f'sites_by_customer_id_{customer_id}'
    redis_client.delete(cache_key_sites)

    cache_key_customers = 'customers'
    redis_client.delete(cache_key_customers)

    return {'status': status}, 200


@bp.route('/site/<int:site_id>', methods=['DELETE'])
@error_handling
def delete_site(site_id):
    conn = get_db_connector()

    existing_site = conn.db_get_site_by_id(site_id)
    if not existing_site:
        return {'message': 'Site not found'}, 404

    status = conn.db_delete_site(site_id)

    if status == 'not_found':
        return {'message': 'Site not found'}, 404

    customer_id = existing_site['customer_id']
    cache_key_sites = f'sites_by_customer_id_{customer_id}'
    redis_client.delete(cache_key_sites)

    cache_key_customers = 'customers'
    redis_client.delete(cache_key_customers)

    return {'status': status}, 200



@bp.route('/buildings_by_site_id/<int:site_id>', methods=['GET'])
@error_handling
@response_validation(BuildingSchema(many=True))
def read_buildings_site_id(site_id):
    cache_key = f'buildings_by_site_id_{site_id}' 

    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data)), 200

    conn = get_db_connector()
    buildings = conn.db_read_buildings_site_id(site_id)

    if not buildings:
        return jsonify({'message': 'No buildings found for the given site ID'}), 404

    serialized_buildings = BuildingSchema(many=True).dump(buildings)

    redis_client.setex(cache_key, 3600, json.dumps(serialized_buildings))  
    return jsonify(serialized_buildings), 200


@bp.route('/building', methods=['POST'])
@error_handling
@response_validation(BuildingSchema())
def add_building():
    data = request.json
    conn = get_db_connector()

    building_schema = BuildingSchema()
    validated_data = building_schema.load(data)

    new_building_id = conn.db_add_building(
        site_id=validated_data['site_id'],
        building_name=validated_data['building_name']
    )

    cache_key_buildings = f'buildings_by_site_id_{validated_data["site_id"]}'
    redis_client.delete(cache_key_buildings)

    site = conn.db_get_site_by_id(validated_data['site_id'])
    if site:
        customer_id = site['customer_id']
        cache_key_sites = f'sites_by_customer_id_{customer_id}'
        redis_client.delete(cache_key_sites)

    return {"building_id": new_building_id}, 201



@bp.route('/building/<int:building_id>', methods=['PUT'])
@error_handling
@response_validation(BuildingSchema())
def update_building(building_id):
    data = request.json
    conn = get_db_connector()

    building_schema = BuildingSchema()
    validated_data = building_schema.load(data, partial=True)

    existing_building = conn.db_get_building_by_id(building_id)
    if not existing_building:
        return {'message': 'Building not found'}, 404

    status = conn.db_update_building(
        building_id=building_id,
        site_id=validated_data.get('site_id'),
        building_name=validated_data.get('building_name')
    )

    if status == 'not_found':
        return {'message': 'Building not found'}, 404

    site_id = validated_data.get('site_id') or existing_building['site_id']
    cache_key_buildings = f'buildings_by_site_id_{site_id}'
    redis_client.delete(cache_key_buildings)

    site = conn.db_get_site_by_id(site_id)
    if site:
        customer_id = site['customer_id']
        cache_key_sites = f'sites_by_customer_id_{customer_id}'
        redis_client.delete(cache_key_sites)

    return {'status': status}, 200



@bp.route('/building/<int:building_id>', methods=['DELETE'])
@error_handling
def delete_building(building_id):
    conn = get_db_connector()

    existing_building = conn.db_get_building_by_id(building_id)
    if not existing_building:
        return {'message': 'Building not found'}, 404

    status = conn.db_delete_building(building_id)

    if status == 'not_found':
        return {'message': 'Building not found'}, 404

    site_id = existing_building['site_id']
    cache_key_buildings = f'buildings_by_site_id_{site_id}'
    redis_client.delete(cache_key_buildings)

    site = conn.db_get_site_by_id(site_id)
    if site:
        customer_id = site['customer_id']
        cache_key_sites = f'sites_by_customer_id_{customer_id}'
        redis_client.delete(cache_key_sites)

    return {'status': status}, 200



@bp.route('/floors_by_building_id/<int:building_id>', methods=['GET'])
@error_handling
@response_validation(FloorSchema(many=True))
def read_floors_building_id(building_id):
    cache_key = f'floors_by_building_id_{building_id}'

    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data)), 200

    conn = get_db_connector()
    floors = conn.db_read_floors_building_id(building_id)

    if not floors:
        return jsonify({'message': 'No floors found for the given building'}), 404

    serialized_floors = FloorSchema(many=True).dump(floors)

    redis_client.setex(cache_key, 3600, json.dumps(serialized_floors))
    return jsonify(serialized_floors), 200

@bp.route('/upload_floor_plan', methods=['POST'])
def upload_floor_plan():

    FLOOR_PLAN_UPLOAD_FOLDER = current_app.config['FLOOR_PLAN_UPLOAD_FOLDER']
    MAX_FILE_SIZE = 10 * 1024 * 1024  
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if len(file.read())>MAX_FILE_SIZE:
        return jsonify({'message': 'File is too large'}), 400
    
    file.seek(0)

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        unique_filename = f'{timestamp}_{filename}'
        file_path = os.path.join(FLOOR_PLAN_UPLOAD_FOLDER, unique_filename)
        os.makedirs(FLOOR_PLAN_UPLOAD_FOLDER, exist_ok=True)
        file.save(file_path)

        return jsonify({'file_name': f'{unique_filename}'}), 201

    return jsonify({'message': 'Invalid file type'}), 400

@bp.route('/delete_floor_plan/<filename>', methods=['DELETE'])
def delete_floor_plan(filename):
    FLOOR_PLAN_UPLOAD_FOLDER = current_app.config['FLOOR_PLAN_UPLOAD_FOLDER']

    if not filename:
        return jsonify({'message': 'File name not provided'}), 400

    file_path = os.path.join(FLOOR_PLAN_UPLOAD_FOLDER, filename)

    try:
        if os.path.exists(file_path):
            os.remove(file_path)

            return jsonify({'message': 'File deleted successfully'}), 200
        else:
            return jsonify({'message': 'File not found'}), 404
    except Exception as e:
        return jsonify({'message': f'Error occurred: {str(e)}'}), 500

@bp.route('/uploads/floor_plan/<filename>', methods=['GET'])
def get_uploaded_floor_plan(filename):
    FLOOR_PLAN_UPLOAD_FOLDER = current_app.config['FLOOR_PLAN_UPLOAD_FOLDER']  
    return send_from_directory(FLOOR_PLAN_UPLOAD_FOLDER, filename)


@bp.route('/floor', methods=['POST'])
@error_handling
@response_validation(FloorSchema())
def add_floor():
    data = request.json
    conn = get_db_connector()

    floor_schema = FloorSchema()
    validated_data = floor_schema.load(data)

    new_floor_id = conn.db_add_floor(
        building_id=validated_data['building_id'],
        floor_position=validated_data['floor_position'],
        floor_plan=validated_data['floor_plan']
    )
    
    cache_key_floors = f'floors_by_building_id_{validated_data["building_id"]}'
    redis_client.delete(cache_key_floors)

    building = conn.db_get_building_by_id(validated_data['building_id'])
    if building:
        site_id = building['site_id']
        cache_key_buildings = f'buildings_by_site_id_{site_id}'
        redis_client.delete(cache_key_buildings)

    return {"floor_id": new_floor_id}, 201


@bp.route('/floor/<int:floor_id>', methods=['PUT'])
@error_handling
@response_validation(FloorSchema())
def update_floor(floor_id):
    data = request.json
    conn = get_db_connector()

    floor_schema = FloorSchema(partial=True)
    validated_data = floor_schema.load(data, partial=True)

    existing_floor = conn.db_get_floor_by_id(floor_id) 
    if not existing_floor:
        return {'message': 'Floor not found'}, 404

    status = conn.db_update_floor(
        floor_id=floor_id,
        building_id=validated_data.get('building_id'),
        floor_position=validated_data.get('floor_position'),
        floor_plan=validated_data.get('floor_plan')
    )

    if status == 'not_found':
        return {'message': 'Floor not found'}, 404

    building_id = validated_data.get('building_id') or existing_floor['building_id']
    cache_key_floors = f'floors_by_building_id_{building_id}'
    redis_client.delete(cache_key_floors)

    building = conn.db_get_building_by_id(building_id)
    if building:
        site_id = building['site_id']
        cache_key_buildings = f'buildings_by_site_id_{site_id}'
        redis_client.delete(cache_key_buildings)

    return {'status': status}, 200



@bp.route('/floor/<int:floor_id>', methods=['DELETE'])
@error_handling
def delete_floor(floor_id):
    conn = get_db_connector()

    existing_floor = conn.db_get_floor_by_id(floor_id)  
    if not existing_floor:
        return {'message': 'Floor not found'}, 404

    status = conn.db_delete_floor(floor_id)

    if status == 'not_found':
        return {'message': 'Floor not found'}, 404

    building_id = existing_floor['building_id']
    cache_key_floors = f'floors_by_building_id_{building_id}'
    redis_client.delete(cache_key_floors)

    cache_key_buildings = f'buildings_by_site_id_{building_id}'
    redis_client.delete(cache_key_buildings)

    return {'status': 'Floor deleted successfully'}, 200

  
@bp.route('/sensors_by_floor_id/<int:floor_id>', methods=['GET'])
@error_handling
@response_validation(SensorSchema(many=True))
def read_sensors_by_floor_id(floor_id):
    cache_key = f'sensors_by_floor_id_{floor_id}'

    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data)), 200

    conn = get_db_connector()
    sensors, total_sensor_count, floor_position = conn.db_read_sensors_by_floor_id(floor_id)

    if not sensors:
        return jsonify({'message': 'No sensors found for the provided floor ID'}), 404

    result = {
        "floor_id": floor_id,
        "floor_position": floor_position,
        "total_sensor_count": total_sensor_count,
        "sensors": sensors
    }

    redis_client.setex(cache_key, 3600, json.dumps(result))
    return jsonify(result),200


@bp.route('/sensor_id/<customer_name>/<site_name>/<building_name>/<floor_position>/<sensor_name>/<sensor_type>', methods=['GET'])
@error_handling
@response_validation(SensorSchema)
def read_sensor_id(customer_name, site_name, building_name, floor_position, sensor_name, sensor_type):

    cache_key = f'sensor_id:{customer_name}:{site_name}:{building_name}:{floor_position}:{sensor_name}:{sensor_type}'
    
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data)), 200

    conn = get_db_connector()
    sensor_id = conn.db_read_sensor_id_from_heimdall_memory(
        customer_name, site_name, building_name, floor_position, sensor_type, sensor_name
    )

    if sensor_id:
        serialized_sensor_data = SensorSchema().dump({"sensor_id": sensor_id})

        redis_client.setex(cache_key, 3600, json.dumps(serialized_sensor_data))  

        return jsonify(serialized_sensor_data), 200

    return jsonify({'message': 'Sensor ID not found'}), 404



@bp.route('/sensor_id_and_value/<customer_name>/<site_name>/<building_name>/<floor_position>/<sensor_name>/<sensor_type>', methods=['GET'])
@error_handling
@response_validation(SensorSchema)
def read_sensor_id_and_value(customer_name, site_name, building_name, floor_position, sensor_name, sensor_type):
    
    cache_key = f'sensor_id_and_value:{customer_name}:{site_name}:{building_name}:{floor_position}:{sensor_name}:{sensor_type}'
    
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data)), 200

    conn = get_db_connector()
    sensor_data = conn.db_read_sensor_id_and_value_from_heimdall_memory(
        customer_name, site_name, building_name, floor_position, sensor_type, sensor_name
    )

    if sensor_data:
        serialized_sensor_data = SensorSchema().dump(sensor_data)

        redis_client.setex(cache_key, 3600, json.dumps(serialized_sensor_data))  

        return jsonify(serialized_sensor_data), 200

    return jsonify({'message': 'Sensor not found'}), 404


@bp.route('/multiple_sensors', methods=['POST'])
@error_handling
@response_validation(SensorSchema(many=True))
def add_multiple_sensors():
    data = request.json
    conn = get_db_connector()

    validated_data = SensorSchema(many=True).load(data)

    sensor_ids = conn.db_add_multiple_sensors(validated_data)

    for sensor in validated_data:
        floor_id = sensor.get('floor_id')

        floor = conn.db_get_floor_by_id(floor_id)
        if floor:
            building_id = floor['building_id']
            cache_key_floors = f'floors_by_building_id_{building_id}'
            redis_client.delete(cache_key_floors)

        cache_key_sensors = f'sensors_by_floor_id_{floor_id}'
        redis_client.delete(cache_key_sensors)

    return {"sensor_ids": sensor_ids}, 201



@bp.route('/sensor/<int:sensor_id>', methods=['PUT'])
@error_handling
@response_validation(SensorSchema())
def update_sensor(sensor_id):
    data = request.json
    conn = get_db_connector()

    sensor_schema = SensorSchema(partial=True)
    validated_data = sensor_schema.load(data, partial=True)

    existing_sensor = conn.db_get_sensor_by_id(sensor_id)
    if not existing_sensor:
        return {'message': 'Sensor not found'}, 404

    status = conn.db_update_sensor(
        sensor_id=sensor_id,
        sensor_name=validated_data.get('sensor_name'),
        value=validated_data.get('value'),
        floor_id=validated_data.get('floor_id'),
        type_name=validated_data.get('type_name'),
        source=validated_data.get('source'),
        x_coordinate=validated_data.get('x_coordinate'),
        y_coordinate=validated_data.get('y_coordinate')
    )

    if status == 'not_found':
        return {'message': 'Sensor not found'}, 404

    floor_id = validated_data.get('floor_id') or existing_sensor['floor_id']

    cache_key_sensors = f'sensors_by_floor_id_{floor_id}'
    redis_client.delete(cache_key_sensors)

    floor = conn.db_get_floor_by_id(floor_id)
    if floor:
        building_id = floor['building_id']
        cache_key_floors = f'floors_by_building_id_{building_id}'
        redis_client.delete(cache_key_floors)

    return {'status': status}, 200



@bp.route('/alarm_types', methods=['GET'])
@error_handling
@response_validation(AlarmTypeSchema(many=True))
def read_alarm_types():
    cache_key = 'alarm_types'
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data)), 200
    
    conn = get_db_connector()
    alarm_types = conn.db_read_alarm_types()

    if not alarm_types:
        return {'message': 'No alarm types found'}, 404
    
    serialized_alarm_types = AlarmTypeSchema(many=True).dump(alarm_types)
    
    redis_client.setex(cache_key, 3600, json.dumps(serialized_alarm_types))
    return jsonify(serialized_alarm_types), 200



@bp.route('/alarms_by_sensor_id/<int:sensor_id>', methods=['GET'])
@error_handling
@response_validation(AlarmSchema(many=True))
def read_alarms_by_sensor_id(sensor_id):
    cache_key = f'alarms_by_sensor_id_{sensor_id}'

    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data)), 200

    conn = get_db_connector()
    alarms = conn.db_read_alarms_sensor_id(sensor_id)

    if not alarms:
        return jsonify({'message': 'No alarms found for the given sensor ID'}), 404

    serialized_alarms = AlarmSchema(many=True).dump(alarms)

    redis_client.setex(cache_key, 3600, json.dumps(serialized_alarms))
    return jsonify(serialized_alarms), 200


@bp.route('/alarms_by_building_id/<int:building_id>', methods=['GET'])
@error_handling
@response_validation(AlarmSchema(many=True))
def read_alarms_by_building_id(building_id):
    cache_key = f'alarms_by_building_id_{building_id}'

    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data)), 200

    conn = get_db_connector()
    alarms = conn.db_read_alarms_building_id(building_id)

    if not alarms:
        return jsonify({'message': 'No alarms found for the given building ID'}), 404

    serialized_alarms = AlarmSchema(many=True).dump(alarms)

    redis_client.setex(cache_key, 3600, json.dumps(serialized_alarms))
    return jsonify(serialized_alarms), 200


@bp.route('/alarm', methods=['POST'])
@error_handling
@response_validation(AlarmSchema())
def add_alarm():
    data = request.json
    conn = get_db_connector()

    alarm_schema = AlarmSchema()
    validated_data = alarm_schema.load(data)

    new_alarm_id = conn.db_add_alarm(
        building_id=validated_data['building_id'],
        sensor_id=validated_data['sensor_id'],
        name=validated_data['name'],
        upper_threshold=validated_data['upper_threshold'],
        lower_threshold=validated_data['lower_threshold'],
        floor_id=validated_data['floor_id']
    )

    redis_client.delete(f'alarms_by_building_id_{validated_data["building_id"]}')
    redis_client.delete(f'alarms_by_sensor_id_{validated_data["sensor_id"]}')

    return {"alarm_id": new_alarm_id}, 201


@bp.route('/alarm/<int:id>', methods=['PUT'])
@error_handling
@response_validation(AlarmSchema(partial=True))
def update_alarm(id):
    data = request.json
    conn = get_db_connector()

    alarm_schema = AlarmSchema(partial=True)
    validated_data = alarm_schema.load(data)

    existing_alarm = conn.db_get_alarm_by_id(id)
    if not existing_alarm:
        return {'message': 'Alarm not found'}, 404

    status = conn.db_update_alarm(
        id=id,
        name=validated_data.get('name'),
        building_id=validated_data.get('building_id'),
        sensor_id=validated_data.get('sensor_id'),
        upper_threshold=validated_data.get('upper_threshold'),
        lower_threshold=validated_data.get('lower_threshold'),
        floor_id=validated_data.get('floor_id')
    )

    if status == 'not_found':
        return {'message': 'Alarm not found'}, 404

    building_id = validated_data.get('building_id') or existing_alarm['building_id']
    sensor_id = validated_data.get('sensor_id') or existing_alarm['sensor_id']

    redis_client.delete(f'alarms_by_building_id_{building_id}')
    redis_client.delete(f'alarms_by_sensor_id_{sensor_id}')

    return {'status': status}, 200


@bp.route('/alarm/<int:id>', methods=['DELETE'])
@error_handling
def delete_alarm(id):
    conn = get_db_connector()

    existing_alarm = conn.db_get_alarm_by_id(id)
    if not existing_alarm:
        return {'message': 'Alarm not found'}, 404

    status = conn.db_delete_alarm(id)

    if status == 'not_found':
        return {'message': 'Alarm not found'}, 404

    redis_client.delete(f'alarms_by_building_id_{existing_alarm["building_id"]}')
    redis_client.delete(f'alarms_by_sensor_id_{existing_alarm["sensor_id"]}')

    return {'status': status}, 200


@bp.route('/clear_alarm', methods=['POST'])
@error_handling
@response_validation(AlarmSchema())
def clear_alarm():
    data = request.json
    conn = get_db_connector()

    alarm_id = data['id']
    status = conn.db_clear_alarm_heimdall_memory(alarm_id)

    if status == 'Alarm not_found':
        return {'message': 'Alarm not found'}, 404
    redis_client.delete('alarms')  
    return {'status': status}, 200


@bp.route('/set_alarm', methods=['POST'])
@error_handling
@response_validation(AlarmSchema())
def set_alarm():
    data = request.json
    conn = get_db_connector()

    alarm_id = data['id']
    status = conn.db_set_alarm_heimdall_memory(alarm_id)

    if status == 'Alarm not found':
        return {'message': 'Alarm not found'}, 404
    redis_client.delete('alarms') 
    return {'status': status}, 200


@bp.route('/clear_building_alarms', methods=['POST'])
@error_handling
@response_validation(AlarmSchema())
def clear_building_alarms():
    data = request.json
    conn = get_db_connector()

    building_id = data.get('building_id')
    if not building_id:
        return {'message': 'Missing building_id'}, 400

    status = conn.db_clear_building_alarms_heimdall_memory(building_id)

    if status == 'No alarms found for this building':
        return {'message': 'No alarms found for this building'}, 404
    redis_client.delete('alarms') 
    return {'status': status}, 200

@bp.route('/login', methods=['POST'])
def login():
    auth = request.json
    if not auth or not auth.get('user_name') or not auth.get('password'):
        return jsonify({'message': 'Bad Request'}), 400
    
    # TODO: Validate username and password
    validation = True

    if validation:
        token = jwt.encode({'username': auth['user_name']}, app.config['SECRET_KEY'])
        return jsonify({'access_token': token}), 200

    return jsonify({'message': 'Invalid Credentials'}), 401