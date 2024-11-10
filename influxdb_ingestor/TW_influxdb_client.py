import os
from flask import Flask, request
from dotenv import load_dotenv
from influxdb_client import InfluxDBClient, WriteOptions, Point
from flask import jsonify
from heimdall_tools.vault import get_vault_secrets

app = Flask(__name__)

influx_client = None

class INFLUXDB_CLIENT:
    def __init__(self) -> None:
        load_dotenv()
        common_secrets, user_secrets= get_vault_secrets(
            os.getenv('VAULT_ADDR'),os.getenv('VAULT_USER_SECRETS_PATH'),
            os.getenv('VAULT_USERNAME'),os.getenv('VAULT_PASSWORD')
        )
        host_url = common_secrets.get('INFLUXDB_SERVER_URL')
        api_token = common_secrets.get('INFLUXDB_API_TOKEN')
        self.org = common_secrets.get('INFLUXDB_ORG')
        self.bucket = common_secrets.get('INFLUXDB_BUCKET')
        print(f"TW_DBG, url: {host_url}, api_token: {api_token}, org: {self.org}, bucket: {self.bucket}")
        try:
            self.client = InfluxDBClient(url=host_url, token=api_token, org=self.org)
        
        except Exception as e:
            print(f"Error: {e}")          

        self.write_api = self.client.write_api(write_options=WriteOptions(batch_size=1))
    
    def write_influx(self, point):
        if self.write_api is None:
            print("Invalid write API Handle")
            return False
        try:
            self.write_api.write(bucket=self.bucket, org=self.org, record=point)
            print("Influx write success")
            return True

        except Exception as e:
            print(f"Error: {e}")
            return False

#Refer unit-tests for example
@app.route('/TW_write_heimdall_influx', methods = ['POST'])
def write_heimdall_influx():
    try:
        point_dict = request.get_json()
        # Deserialize the Point object
        point = Point(point_dict["measurement"])

        for key, value in point_dict.get("tags", {}).items():
            point.tag(key, value)
        
        for key, value in point_dict.get("fields", {}).items():
            point.field(key, value)

        print(f"Writing to Influx DB: {point}")
        
        result = influx_client.write_influx(point=point)
        if result is True:
            return jsonify({'status' : "Success"}), 200
        else:
            return jsonify({'status' : "Failed"}), 401
    except Exception as e:
        print(f"Error: {e}")          
        return jsonify({'status' : "Failed"}), 500

def main():
    global influx_client
    influx_client = INFLUXDB_CLIENT()
    app.run(host='0.0.0.0', port=9000)

if __name__ == "__main__":
    main()
