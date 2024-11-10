import requests

mysql_ingestor_url = 'http://127.0.0.1:8000'
def test_read_sensor_id_and_sensor_value():
    read_sensor_id_value_endpoint = f"{mysql_ingestor_url}/read_sensor_id_and_value"
    response = requests.post(read_sensor_id_value_endpoint, json= {
            'customer_name': 'Bartlett',
            'site_name': 'Feedspan',
            'building_name': 'Lotstring',
            'floor_position': 2, 
            'sensor_type': 'Valve',
            'sensor_name': 'S1',
        }
    )
    # Check if the request was successful
    if response.status_code == 200:
    # Parse the JSON response
        data = response.json()

    # Extract sensor_id and sensor_value
    sensor_id = data['sensor_id']
    sensor_value = data['sensor_value']

    print(sensor_id, sensor_value)
    for row in response:
        print(row)

def test_update_sensor_value():
    update_sensor_value_endpoint = f"{mysql_ingestor_url}/update_sensor_value"
    response = requests.post(update_sensor_value_endpoint, json= {
            'sensor_id' : 211,
            'sensor_value' : 50
        }
    )
    print (f"In update Sensor API, Response: {response}")


def test_read_sensor_id():
    read_sensor_id_endpoint = f"{mysql_ingestor_url}/read_sensor_id"
    #sensor_id = requests.post(read_sensor_id_endpoint, json= test_data[0])
    response = requests.post(read_sensor_id_endpoint, json= {
            'customer_name': 'Bartlett',
            'site_name': 'Feedspan',
            'building_name': 'Lotstring',
            'floor_position': 2, 
            'sensor_type': 'Valve',
            'sensor_name': 'S1',
            'value': 26
        }
    )
    print (f"Sensor ID of the targeting Sensor: {response.text}")

def test_read_sensors(count):
    read_sensors_endpoint = f"{mysql_ingestor_url}/read_sensors"
    sensors = requests.post(read_sensors_endpoint, json = {'count' : 10})
    print(sensors)

def refresh_mqtt_topic_names_flag():
    mqtt_sub_url = 'http://127.0.0.1:3333'
    endpoint = f"{mqtt_sub_url}/refresh_heimdall_topic_names"
    print(endpoint)
    sensors = requests.post(endpoint)
    endpoint = f"{mqtt_sub_url}/get_heimdall_topic_names"
    print(endpoint)
    response = requests.post(endpoint)
    data = response.json
    print(response.text)
    print (data)
    print(data['value'])

def main():
    #test_read_sensor_id()
    #test_read_sensors(10)
    #test_read_sensor_id_and_sensor_value()
    #test_update_sensor_value()
    #test_read_sensor_id_and_sensor_value()
    refresh_mqtt_topic_names_flag()

if __name__ == "__main__":
    main()


