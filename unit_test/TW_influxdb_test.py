import requests
from influxdb_client import Point

def write_influx_test(point):
    influxdb_ingestor_url = 'http://127.0.0.1:9000'
    write_endpoint = f"{influxdb_ingestor_url}/TW_write_heimdall_influx"
    response = requests.post(write_endpoint, json=point)
    print(response)

def main():
    # Create the Point object
    point = (
        Point("sensor_data")
        .tag("location", "room1")
        .tag("sensor_type", "temperature")
        .field("temperature", 23.5)
        .field("humidity", 60.2)
    )

    # Serialize the Point object to a dictionary
    point_dict = {
        "measurement": point._name,
        "tags": point._tags,
        "fields": point._fields,
        "time": point._time,
    }
#    point_dict = point.to_dict()
    print(point_dict)
    write_influx_test(point_dict)


if __name__ == "__main__":
    main()
