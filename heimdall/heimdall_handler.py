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
redis_server_ip = None
redis_conn = None
mysql_ingestor_url = None
influx_ingestor_url = None
heimdall_patrol_handler_queue = None


def update_heimdall_memory(sensor_data):
    mysql_update_sensor_value_endpoint = f"{mysql_ingestor_url}/multiple_sensors"
    result = None
    payload = [{
        "sensor_id": sensor_data["sensor_id"],
        "value": sensor_data["value"]
    }]
    
    try:
        result = requests.put(
            mysql_update_sensor_value_endpoint,
            json=payload,
            headers={"Content-Type": "application/json"}
        )           
    except Exception as e:
        print(f"TW_ERR: update_heimdall_memory - Generic error: {e}")

    return result

def update_heimdall_influx(sensor_data):
    result = None
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
            region = heimdall_patrol_handler_queue['region'],
            queue_url = heimdall_patrol_handler_queue['url'],
            message_body = sensor_data
        )
    except Exception as e:
        print(f"TW_ERR: Send to Patrol Queue, Generic error: {e}")
        


# TODO Redesign to handle data process more asynchronously
def heimdall_thread(sensor_data):
    global redis_server_ip, redis_conn
    write_to_heimdall_memory = False
   
    #TODO what is this logic for???? CHECK
    if isinstance(sensor_data, list):
        if sensor_data:  # ensure list is not empty
            sensor_data = sensor_data[0]  # use the first item in the list
        else:
            print("TW_ERR: Received an empty sensor data list.")
            return

    print(f"TW_INFO, Read message from queue, Sensor: {sensor_data}")

    customer_name, site_name, building_name = sensor_data["customer_name"], sensor_data["site_name"], sensor_data["building_name"] 
    floor_position = sensor_data["floor_position"]
    sensor_type = sensor_data["sensor_type"]
    sensor_name = sensor_data["sensor_name"]
    sensor_value = sensor_data["value"]
    sensor_id = sensor_data["sensor_id"]
    prev_sensor_value = sensor_data["prev_sensor_value"]

    print(f"TW_DBG, Customer Name: {customer_name}, Site: {site_name}, Building: {building_name}, floor: {floor_position}, Type: {sensor_type}, prev_sensor_value: {prev_sensor_value}, value: {sensor_value}, sensor_id: [{sensor_id}], Prev Sensor Value: [{prev_sensor_value}], Sensor new value: [{sensor_value}]")

    # Compare cache value with new value. Implement a logic to make decision to process further
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

    data = request.json
    heimdall_thread(sensor_data = data)
    print("TW_DBG, Waiting for task to return")
    return 'API call submitted', 200

def set_server_details():
    load_dotenv()
    global redis_server_ip, redis_conn, heimdall_patrol_handler_queue, mysql_ingestor_url, influx_ingestor_url
    common_secrets, user_secrets= get_vault_secrets(
        os.getenv('VAULT_ADDR'),os.getenv('VAULT_USER_SECRETS_PATH'),
        os.getenv('VAULT_USERNAME'),os.getenv('VAULT_PASSWORD')
    )

    redis_server_ip = common_secrets.get('REDIS_SERVER_IP')
    redis_conn = get_redis_connection(host_name = redis_server_ip)
    mysql_ingestor_url = user_secrets.get('MYSQL_INGESTOR_URL')
    influx_ingestor_url = user_secrets.get('INFLUXDB_INGESTOR_URL')
    heimdall_patrol_handler_queue = {
        'region' : user_secrets.get('HEIMDALL_PATROL_HANDLER_QUEUE_REGION'),
        'url' : user_secrets.get('HEIMDALL_PATROL_HANDLER_QUEUE_URL')
    }

    # DONOT SEND PRODUCTION IP in DATA. Retrieve Production from Environment variable in Lambda
    #if os.getenv('ENVIRONMENT') != "PRODUCTION":
    #    heimdall_handler_url = user_secrets.get('HEIMDALL_HANDLER_URL')

    print(f"TW_DBG, Set mysql_ingestor_url: {mysql_ingestor_url}, influx_ingestor_url: {influx_ingestor_url}, queue url: {heimdall_patrol_handler_queue['url']}")

def main():
    print("TW_DBG, Heimdall Handler App Started")
    set_server_details()
    app.run(host='0.0.0.0', port=7000)

if __name__ == "__main__":
    main()