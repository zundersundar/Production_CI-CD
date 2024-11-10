# This modules handles the alarms in the system. 
# The module shall check the alarms configured by the user.
# Compare the current values and generate alarms if required. Recurring alarms should not be created

import os
from flask import Flask, request, json
from heimdall_tools.sns import post_to_sns_topic
from heimdall_tools.redis_client import get_redis_connection
from heimdall_tools.redis_client import set_with_expiry
from heimdall_tools.redis_client import get_from_cache
from dotenv import load_dotenv
from datetime import datetime
import asyncio, requests
from heimdall_tools.vault import get_vault_secrets

app = Flask(__name__)
patrol_notifications_sns = {
    "arn" : "arn:aws:sns:eu-west-1:009925156537:TW_Patrol_Notifications",
    "region" : "eu-west-1",
    "topic" : "TW_Patrol_Notifications"
}

mysql_ingestor_url = 'http://127.0.0.1:8000'



def send_notification_to_sns(alarms):
    result = post_to_sns_topic(
        region = patrol_notifications_sns['region'],                        
        arn = patrol_notifications_sns['arn'],
        topic = patrol_notifications_sns['topic'],
        key = "notification",
        value = alarms
    )

def check_for_alarms(alarms_config, sensor_data):
    send_notification = False
    sensor_value = sensor_data['value']
    read_alarm_types_endpoint = f"{mysql_ingestor_url}/read_alarm_types"
    try:
        response = requests.post (
            read_alarm_types_endpoint,
        )
    
        if response.status_code == 200:
            # Parse the JSON response
            data = response.json()
            
            # Initialize the alarm_priorities dictionary
            alarm_priorities = {}
            
            # Populate the dictionary with name and severity
            for alarm in data['result']:
                alarm_priorities[alarm['name']] = alarm['severity']
            
            # Print the resulting dictionary
            print(f"TW_DBG, Alarm Priorities: {alarm_priorities}")            

    except Exception as e:
        print(f"{str(e)} : Error occured in read_alarm_types Endpoint. Please Debug. Cannot Go Further")
        return
    
    # Sort alarms by priority
    sorted_alarms = sorted(alarms_config, key=lambda x: alarm_priorities[x['name']])

    # Iterate through alarms in order of priority
    for alarm in sorted_alarms:
        print(f"TW_DBG, Alarms configured in memory: Lower Thresold --> {alarm['lower_threshold']}, Upper Thresold --> {alarm['upper_threshold']}")

        if sensor_value < alarm['lower_threshold'] or sensor_value > alarm['upper_threshold']:
            # Check if this is a new Alarm
            if alarms_config['status'] == False:
                alarms_config['status'] = True
                send_notification = True
        
        # Send clear alarm notification if the value get back to normal value
        elif alarms_config['status'] == True:
                alarms_config['status'] = False
                send_notification = True
        
    return send_notification


def read_alarms_config(sensor_data):
    sensor_data['alarms_config'] = None
    read_alarms_config_sensor_id_endpoint = f"{mysql_ingestor_url}/read_alarms_sensor_id"
    print(f"TW_DBG, Reading Alarms config from memory,  \
                'sensor_id' : {sensor_data['sensor_id']}"\
            )
    try:
        response = requests.post (
            read_alarms_config_sensor_id_endpoint,
            json = {
                'sensor_id' : sensor_data['sensor_id'] 
            }
        )
        if response.status_code == 200:
            # Check if the request was successful, Parse the JSON response
            response_data = response.json()
            sensor_data['alarms_config'] = response_data
            return "Success"
        
    except Exception as e:
        print(f"{str(e)} : Error occured in read_alarms_sensor_id Endpoint. Please Debug. Cannot Go Further")
        return 
    
    return "Failed"


def patrol_task(sensor_data):
    global redis_server_ip, redis_conn
    
    print(f"TW_INFO, Read message from queue, Sensor: {sensor_data}")
    #sensor_data = json.loads(sensor_data)

    # Read Alarms Table
    result = read_alarms_config(sensor_data=sensor_data)
    if result is "Failed":
        print(f"TW_DBG, Error reading Alarm configs for this sensor: {sensor_data['sensor_id']}")
        return
    elif sensor_data['alarms_config'] is None:
        print(f"TW_DBG, There are no Alarm configs set for this sensor: {sensor_data['sensor_id']}")
        return

    alarms_config = sensor_data['alarms_config']
    notification = check_for_alarms(alarms_config, sensor_data)

    if notification == True:
        #update_alarms_heimdall_memory(alarms_config, sensor_data['sensor_id'])
        send_notification_to_sns(alarms_config)
    
    return


#This API will be called from ETL_HEIMDALL Lambda
@app.route('/initiate_patrol_handler', methods=['POST'])
def patrol_handler():
    print("ETL Process CALLED")
    data = request.json

    for record in data['Records']:
        body = json.loads(record['body'])
        #print(body)
        print("Creating Tasks for Streaming and Batching data separation")
        patrol_task(sensor_data = body)

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

    app.run(host='0.0.0.0', port=6999)

if __name__ == "__main__":
    main()



