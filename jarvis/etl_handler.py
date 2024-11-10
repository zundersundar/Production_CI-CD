#This is Data management module. It should have all wrapper APIs to process data

#TODO Need to integrate with Data MGR module. Ideally there should be only one service to handle all data wrapper calls

import os, requests
from heimdall_tools.redis_client import get_redis_connection
from heimdall_tools.redis_client import set_with_expiry
from heimdall_tools.redis_client import get_from_cache
from dotenv import load_dotenv
from flask import Flask, request, json
from datetime import datetime
from heimdall_tools.sqs import write_to_sqs_queue
from heimdall_tools.vault import get_vault_secrets

app = Flask(__name__)
redis_server_ip = None
redis_conn = None
mysql_ingestor_url = 'http://127.0.0.1:8000'
etl_heimdall_handler_queue = {
    'region' : 'eu-west-1',
    'url': 'https://sqs.eu-west-1.amazonaws.com/009925156537/etl_heimdall_handler_queue'
}

def read_sensor_id_and_value(sensor_data):
    read_sensor_id_value_endpoint = f"{mysql_ingestor_url}/read_sensor_id_and_value"
    print(f"TW_DBG, Reading Sensor ID and Value from memory, 'customer_name' : {sensor_data['customer_name']}, \
                'site_name' : {sensor_data['site_name']}, \
                'building_name' : {sensor_data['building_name']},\
                'floor_position' : {sensor_data['floor_position']}, \
                'sensor_type' : {sensor_data['sensor_type']}, \
                'sensor_name' : {sensor_data['sensor_name']}"\
            )
    try:
        response = requests.post (
            read_sensor_id_value_endpoint,
            json = {
                'customer_name' : sensor_data['customer_name'], 
                'site_name' : sensor_data['site_name'], 
                'building_name' : sensor_data['building_name'],
                'floor_position' : sensor_data['floor_position'],
                'sensor_type' : sensor_data['sensor_type'],
                'sensor_name' : sensor_data['sensor_name'] 
            }
        )
        if response.status_code == 200:
            # Check if the request was successful, Parse the JSON response
            response_data = response.json()
            # Extract sensor_value
            return response_data
        elif response.status_code == 404:
            print("Sensor Not Found")
            return None

    except Exception as e:
        print(f"{str(e)} : Error occured in read_sensor_id_and_value Endpoint. Please Debug. Cannot Go Further")
    
    return -1

# TODO Redesign to handle data process more asynchronously
def etl_thread(sensor_data):
    global redis_server_ip, redis_conn
    #sensor_data = json.loads(sensor_data)
    print (sensor_data["customer_name"], sensor_data["site_name"], sensor_data["building_name"])

    # Format timestamp as needed
    current_time = datetime.now()
    current_time_str = current_time.strftime('%Y-%m-%d %H:%M:%S')    
    last_updated = current_time_str    

    customer_name, site_name, building_name = sensor_data["customer_name"], sensor_data["site_name"], sensor_data["building_name"] 
    floor_position = sensor_data["floor_position"]
    sensor_type = sensor_data["sensor_type"]
    sensor_name = sensor_data["sensor_name"]
    sensor_value = sensor_data["value"]
    sensor_data['last_updated'] = last_updated

    # Read last updated value from Redis
    redis_sensor_value_key = f"{customer_name}/{site_name}/{building_name}/{floor_position}/{sensor_type}/{sensor_name}/sensor_value"
    redis_sensor_id_key = f"{customer_name}/{site_name}/{building_name}/{floor_position}/{sensor_type}/{sensor_name}/sensor_id"
    prev_sensor_value = get_from_cache(redis_conn, redis_sensor_value_key)
    print(f"TW_DBG, Customer Name: {customer_name}, Site: {site_name}, Building: {building_name}, floor: {floor_position}, Type: {sensor_type}, prev_sensor_value: {prev_sensor_value}, value: {sensor_value}")
    if prev_sensor_value is not None:
        prev_sensor_value = int(prev_sensor_value.decode())

    sensor_id = get_from_cache(redis_conn, redis_sensor_id_key)
    if sensor_id is not None:
        sensor_id = int(sensor_id.decode())

    # Read from DB if there is a cache miss
    if prev_sensor_value is None or sensor_id is None:
        sensor_data['customer_name'] = customer_name
        sensor_data['site_name'] = site_name
        sensor_data['building_name'] = building_name,
        response = read_sensor_id_and_value(sensor_data)
        if response is not None:
            # Extract sensor_value
            prev_sensor_value = response['sensor_value']
            sensor_id = response['sensor_id']
            set_with_expiry(redis_conn, redis_sensor_id_key, sensor_id, expiry_time=5)
        elif response is None:
            #Looks like a new Sensor is added in the Site
            print("TW_DBG, Looks like a new sensor is added in the site. Adding to Heimdall Memory")
            #TODO We shouldn't add a sensor value to DB if the sensor configuration is not added by a technician in configuration page. 
            # This will cause discrepency in Floor plan metrics visualization and Dashboard
            return
        elif response == -1:
            print("TW_DBG, Exception while reading sensor_id_value")
            return
        
    sensor_data['sensor_id'] = sensor_id
    sensor_data['prev_value'] = prev_sensor_value
    print(f"TW_DBG, Redis Sensor value Key: [{redis_sensor_value_key}], sensor_id: [{sensor_id}], Prev Sensor Value: [{prev_sensor_value}], Sensor new value: [{sensor_value}]")

    #THE BELOW CODE IS FOR VERIFYING. DELETE IT FOR PRODUCTION
    if False:
        redis_sensor_value = get_from_cache(redis_conn, redis_sensor_value_key)
        redis_sensor_id = get_from_cache(redis_conn, redis_sensor_id_key)
        print(f"TW_DBG, Read back from Redis --> Sensor value Key:  Sensor Value: [{redis_sensor_value}], sensor ID: [{redis_sensor_id}]")

    #TODO Add more etl logic here
    # 1. Do sensor value validation. there will be an expected value range
    # 2. Validate unit of value
    # 3. Add ML data scaling if required
    print("Writing data to ETL HEIMDALL Queue")
    result = write_to_sqs_queue (
        region = etl_heimdall_handler_queue['region'],
        queue_url = etl_heimdall_handler_queue['url'],
        message_body = sensor_data
    )


#This API will be called from HTTP Endpoint hook subscribed to SNS topic
@app.route('/initiate_etl_handler', methods=['POST'])
def etl_process():
    print("ETL Process CALLED")

    data = request.json
    etl_thread(sensor_data = data)
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
    redis_conn = get_redis_connection(host_name = redis_server_ip)
    app.run(host='0.0.0.0', port=6000)

if __name__ == "__main__":
    main()

