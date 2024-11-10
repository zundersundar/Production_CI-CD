#This is Data management module. It should have all wrapper APIs to process data

#TODO Need to integrate with Data MGR module. Ideally there should be only one service to handle all data wrapper calls

import os
from flask import Flask, request, json
from heimdall_tools.sqs import write_to_sqs_queue
from heimdall_tools.redis_client import get_redis_connection
from heimdall_tools.redis_client import set_with_expiry
from heimdall_tools.redis_client import get_from_cache
from influxdb_client import Point
from dotenv import load_dotenv
import requests
from heimdall_tools.vault import get_vault_secrets


app = Flask(__name__)
mysql_ingestor_url = 'http://127.0.0.1:8000'
influx_ingestor_url = 'http://127.0.0.1:9000'

redis_server_ip = None
redis_conn = None

heimdall_patrol_queue = {
    'region' : 'eu-west-1',
    'url': 'https://sqs.eu-west-1.amazonaws.com/009925156537/heimdall_patrol_queue'
}


def update_heimdall_memory(sensor_data):
    mysql_update_sensor_value_endpoint = f"{mysql_ingestor_url}/update_sensor_value"
    try:
        result = requests.post (
            mysql_update_sensor_value_endpoint,
            json = {
                'sensor_id' : sensor_data['sensor_id'],
                'sensor_value' : sensor_data['value'],
                'last_updated' : sensor_data['last_updated']
            }
        )
    except Exception as e:
        print(f"TW_ERR: update_heimdall_memory Generic error: {e}")
        
    return result

def update_heimdall_influx(sensor_data):
    point_data = (
        Point("SensorData")
        .tag("customer_name", sensor_data['customer_name'])
        .tag("site_name", sensor_data['site_name'])
        .tag("building_name" , sensor_data['building_name'])
        .tag("floor_position" , sensor_data['floor_position'])
        .tag("sensor_type" , sensor_data['sensor_type'])
        .tag("sensor_name" , sensor_data['sensor_name'])
        .tag("sensor_id" , sensor_data['sensor_id'])
        .field("sensor_value" , sensor_data['value'])
    )
        
    # Serialize the Point object to a dictionary
    point_dict = {
        "measurement": point_data._name,
        "tags": point_data._tags,
        "fields": point_data._fields,
        "time": point_data._time,
    }        

    influx_write_sensor_value_endpoint = f"{influx_ingestor_url}/TW_write_heimdall_influx"
    try:
        result = requests.post(
            influx_write_sensor_value_endpoint, 
            json = point_dict
        )
    except Exception as e:
        print(f"TW_ERR: update heimdall influx, Generic error: {e}")
        
    return result

def send_to_patrol(sensor_data):
    print("Writing data to HEIMDALL PATROL Queue")
    try:
        result = write_to_sqs_queue (
            region = heimdall_patrol_queue['region'],
            queue_url = heimdall_patrol_queue['url'],
            message_body = sensor_data
        )
    except Exception as e:
        print(f"TW_ERR: Send to Patrol Queue, Generic error: {e}")
        


# TODO Redesign to handle data process more asynchronously
def heimdall_thread(sensor_data):
    global redis_server_ip, redis_conn
    write_to_heimdall_memory = False
    
    print(f"TW_INFO, Read message from queue, Sensor: {sensor_data}")
    #sensor_data = json.loads(sensor_data)

    # customer_name, site_name, building_name = sensor_data["customer_name"], sensor_data["site_name"], sensor_data["building_name"] 
    # floor_position = sensor_data["floor_position"]
    # sensor_type = sensor_data["sensor_type"]
    # sensor_name = sensor_data["sensor_name"]
    # sensor_value = sensor_data["value"]

    # # Read last updated value from Redis
    # redis_sensor_value_key = f"{customer_name}/{site_name}/{building_name}/{floor_position}/{sensor_type}/{sensor_name}/sensor_value"
    # # redis_sensor_id_key = f"{customer_name}/{site_name}/{building_name}/{floor_position}/{sensor_type}/{sensor_name}/sensor_id"
    # prev_sensor_value = redis_conn.get(redis_sensor_value_key)
    # print(f"TW_DBG, Customer Name: {customer_name}, Site: {site_name}, Building: {building_name}, floor: {floor_position}, Type: {sensor_type}, prev_sensor_value: {prev_sensor_value}, value: {sensor_value}")
    # if prev_sensor_value is not None:
    #     prev_sensor_value = int(prev_sensor_value.decode())

    # sensor_id = redis_conn.get(redis_sensor_id_key)
    # if sensor_id is not None:
    #     sensor_id = int(sensor_id.decode())

    # # Read from DB if there is a cache miss
    # if prev_sensor_value is None or sensor_id is None:
    #     sensor_data['customer_name'] = customer_name
    #     sensor_data['site_name'] = site_name
    #     sensor_data['building_name'] = building_name,
    #     response = read_sensor_id_and_value(sensor_data)
    #     if response is not None:
    #         # Extract sensor_value
    #         prev_sensor_value = response['sensor_value']
    #         sensor_id = response['sensor_id']
    #         redis_conn.set(redis_sensor_id_key, sensor_id)
    #     else:
    #         #Looks like a new Sensor is added in the Site
    #         print("TW_DBG, Looks like a new sensor is added in the site. Adding to Heimdall Memory")
    #         #TODO We shouldn't add a sensor value to DB if the sensor configuration is not added by a technician in configuration page. 
    #         # This will cause discrepency in Floor plan metrics visualization and Dashboard
    #         return
        
    # sensor_data['sensor_id'] = sensor_id
    # print(f"TW_DBG, Redis Sensor value Key: [{redis_sensor_value_key}], sensor_id: [{sensor_id}], Prev Sensor Value: [{prev_sensor_value}], Sensor new value: [{sensor_value}]")

    # #THE BELOW CODE IS FOR VERIFYING. DELETE IT FOR PRODUCTION
    # if False:
    #     redis_sensor_value = redis_conn.get(redis_sensor_value_key)
    #     redis_sensor_id = redis_conn.get(redis_sensor_id_key)
    #     print(f"TW_DBG, Read back from Redis --> Sensor value Key:  Sensor Value: [{redis_sensor_value}], sensor ID: [{redis_sensor_id}]")

    # TODO compare cache value with new value. Implement a logic to make decision to process further
    sensor_value = sensor_data["value"]
    prev_sensor_value = sensor_data["prev_value"]
    if sensor_value != prev_sensor_value:
        print(f"TW_DBG Change in Sensor Value from {prev_sensor_value} to {sensor_value}")
        redis_sensor_value_key = f"{sensor_data['customer_name']}/{sensor_data['site_name']}/{sensor_data['building_name']}/{sensor_data['floor_position']}/{sensor_data['sensor_type']}/{sensor_data['sensor_name']}/sensor_value"
        try:
            set_with_expiry(redis_conn, redis_sensor_value_key, sensor_value, expiry_time=5)
            # Add Business Logics here
            write_to_heimdall_memory = True
        except Exception as e:
            print(f"TW_ERR: In Heimdall thread - Redis sensor value key, Generic error: {e}")
            
    write_to_heimdall_influx = True

    # Write to MySQL
    if write_to_heimdall_memory is True:
        print("TW_DBG, Writing to MySQL Heimdall Memory")
        result = update_heimdall_memory(sensor_data=sensor_data)

    # Write to Influx DB
    if write_to_heimdall_influx is True:
        print("TW_DBG, Writing to Influx Heimdall Memory")
        result = update_heimdall_influx(sensor_data=sensor_data)

    send_to_patrol(sensor_data)


#This API will be called from HTTP Endpoint hook subscribed to SNS topic
@app.route('/initiate_heimdall_handler', methods=['POST'])
def heimdall_handler():
    print("Heimdall Process CALLED")

    data = request.json
    heimdall_thread(sensor_data = data)
    print("Waiting for task to return")
    return 'API call submitted', 200

def main():
    load_dotenv()
    global redis_server_ip, redis_conn
    common_secrets, user_secrets= get_vault_secrets(
        os.getenv('VAULT_ADDR'),os.getenv('VAULT_USER_SECRETS_PATH'),
        os.getenv('VAULT_USERNAME'),os.getenv('VAULT_PASSWORD')
    )
    redis_server_ip = common_secrets.get('REDIS_SERVER_IP')
    print(f"Redis server ip : {redis_server_ip}")
    redis_conn = get_redis_connection(host_name = redis_server_ip)

    app.run(host='0.0.0.0', port=7000)

if __name__ == "__main__":
    main()

