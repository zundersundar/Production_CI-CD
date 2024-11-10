import sys
sys.path.append('./')
import paho.mqtt.client as mqtt
import random
#from heimdall_tools.sns import post_to_sns_topic
from heimdall_tools.sqs import write_to_sqs_queue
from heimdall_tools.redis_client import get_redis_connection
from heimdall_tools.redis_client import set_with_expiry
from heimdall_tools.redis_client import get_from_cache
from flask import Flask, jsonify
from dotenv import load_dotenv
import requests, os
from heimdall_tools.vault import get_vault_secrets

app = Flask(__name__)
mqtt_topic_names = []
mysql_ingestor_url = 'http://127.0.0.1:8000'
#TODO Read it from DB 
mqtt_listener_sns = {
    "arn" : "arn:aws:sns:eu-west-1:009925156537:mqtt_listener",
    "region" : "eu-west-1",
    "topic" : "mqtt_listener"
    }

mqtt_etl_handler_queue = {
    'region' : 'eu-west-1',
    'url' : 'https://sqs.eu-west-1.amazonaws.com/009925156537/mqtt_etl_handler_queue'
}


class Topic:
    def __init__(self, customer_name, site_name, building_name, topic_name):
        self.customer_name = customer_name
        self.site_name = site_name
        self.building_name = building_name
        self.topic_name = topic_name


"""""
@dataclass
class mqtt:
    broker_ip: String
"""""
#TODO: Implement persistent session logic. 
class CHDB_MQTT_SUB:
    def __init__(self, broker, port_number):
        load_dotenv()
        common_secrets, user_secrets= get_vault_secrets(
            os.getenv('VAULT_ADDR'),os.getenv('VAULT_USER_SECRETS_PATH'),
            os.getenv('VAULT_USERNAME'),os.getenv('VAULT_PASSWORD')
        )
        self.client = None
        self.mqtt_broker = broker
        self.port_number = port_number
        self.redis_server_ip = common_secrets.get('REDIS_SERVER_IP')
        print(self.redis_server_ip)
        
    def connect_mqtt(self):
        def on_connect(client, userdata, flags, rc):
            if rc == 0:
                print("Connected to MQTT Broker!")
            else:
                print("Failed to connect, return code %d\n", rc)
        def on_log(client, userdata, level, buf):
            print("log: ",buf)

        self.client_id = f'subscribe-{random.randint(0, 100)}'
        self.client = mqtt.Client(self.client_id)
        self.client.on_connect = on_connect
        self.client.on_log = on_log
        self.client.connect(self.mqtt_broker, self.port_number)


    def on_log(client, userdata, level, buf):
        print("log: ",buf)
        

    #TODO Add a logic to add new topic names if a new customer is added. This api is getting called only during bootup atm
    def check_mqtt_topic_names(self) -> int:
        redis_conn = get_redis_connection(host_name = self.redis_server_ip)
        print(self.redis_server_ip)
        mqtt_topic_names_read_required = get_from_cache(redis_conn, "mqtt_topic_names_read_required")
        if mqtt_topic_names_read_required is not None:
            # Decode the byte string to a regular string
            value_str = mqtt_topic_names_read_required.decode()
            # Convert the string back to boolean
            mqtt_topic_names_read_required = value_str.lower() == 'true'

        if mqtt_topic_names_read_required is None or mqtt_topic_names_read_required is True:
            #mqtt_topic_names_read = 'http://127.0.0.1:8000/read_mqtt_topic_names'
            print(f"TW_DBG, MySQL Server IP : {mysql_ingestor_url}")
            mqtt_topic_names_read = f"{mysql_ingestor_url}/mqtt_topics"
            try:
                response = requests.get(mqtt_topic_names_read)
                response.raise_for_status()
                global mqtt_topic_names
                data = response.json()
                for topic in data:
                    # Later in the code, populate mqtt_topic_names
                    print("TW_DBG, Received the topic data")
                    print(topic["customer_name"], topic["site_name"], topic["building_name"], topic["topic_name"])
                    mqtt_topic_names.append(Topic(topic["customer_name"], topic["site_name"], topic["building_name"], topic["topic_name"]))
                set_with_expiry(redis_conn,"mqtt_topic_names_read_required", str(False), expiry_time=5)
                
            except Exception as e:
                error_message = str(e)
                print(error_message)
                return False
                
        return True

    
    def subscribe(self):
        def mqtt_read_topics(client, userdata, message) -> None:
            def send_to_mqtt_listener(value):
                print(f'Value:{value}')
                try:
                    response = write_to_sqs_queue(
                        region = mqtt_etl_handler_queue['region'],
                        queue_url = mqtt_etl_handler_queue['url'],
                        message_body = value
                    )
                    # response = post_to_sns_topic(region = mqtt_listener_sns['region'],
                    #                              arn = mqtt_listener_sns['arn'],
                    #                              topic = mqtt_listener_sns['topic'],
                    #                              key = key,
                    #                              value = value)
                except Exception as e:
                    print("Exception occured", e)
                    return None                

            print(f"received message: to topic {message.topic}")
            print(str(message.payload.decode("utf-8")))
            send_to_mqtt_listener(value = str(message.payload.decode("utf-8")))
            # ********** MQTT READ TOPICS FUNC END **********
        print(f"Configured topic names are {mqtt_topic_names}")
        for topic in mqtt_topic_names:
            print(topic.topic_name)
            self.client.subscribe(topic.topic_name)
        self.client.on_message = mqtt_read_topics
        self.client.on_log = self.on_log
        
        #time.sleep(5)
        print("Client Subscribed to topics")
        self.client.loop_forever()
 
#This api shall be called in case a new topic is added to DB. For eg: a new customer site is added in the system
#@app.route('/refresh_heimdall_topic_names', methods=['POST'])
def refresh_heimdall_topic_names():
    load_dotenv()
    common_secrets, user_secrets= get_vault_secrets(
        os.getenv('VAULT_ADDR'),os.getenv('VAULT_USER_SECRETS_PATH'),
        os.getenv('VAULT_USERNAME'),os.getenv('VAULT_PASSWORD')
    )
    print("refresh_heimdall_topic_names API Called")
    redis_server_ip = common_secrets.get('REDIS_SERVER_IP')
    redis_conn = get_redis_connection(host_name = redis_server_ip)
    set_with_expiry(redis_conn,"mqtt_topic_names_read_required", str(True), expiry_time=5)
    #return jsonify({'status' : "sucess"}), 200

@app.route('/get_heimdall_topic_names', methods=['POST'])
def get_heimdall_topic_names():
    load_dotenv()
    common_secrets, user_secrets= get_vault_secrets(
        os.getenv('VAULT_ADDR'),os.getenv('VAULT_USER_SECRETS_PATH'),
        os.getenv('VAULT_USERNAME'),os.getenv('VAULT_PASSWORD')
    )
    print("API Called")
    redis_server_ip = common_secrets.get('REDIS_SERVER_IP')
    redis_conn = get_redis_connection(host_name = redis_server_ip)
    value = get_from_cache(redis_conn, "mqtt_topic_names_read_required")
    print(value)
    return jsonify({'Value' : value}), 200


def main():
    #TODO Use Dedicated HiveMQ Broker URi
    broker_uri = "broker.hivemq.com"
    broker_port = 1883

    # broker_uri = "221a3edfcfef4303bddeb9408c05a6cd.s1.eu.hivemq.cloud"
    # broker_port = 8883
    refresh_heimdall_topic_names()
    mqtt_client = CHDB_MQTT_SUB(
        broker= broker_uri, port_number=broker_port
        )

    print("MQTT SUB CLIENT Created")
    #mqtt_client.connect()
    mqtt_client.connect_mqtt()
    print("MQTT SUB CLIENT Connected")
    if False == mqtt_client.check_mqtt_topic_names():
        print("Something Gone Wrong. Please Debug")
        return 
    mqtt_client.subscribe()
    print("MQTT SUB CLIENT Subscribed")
    #app.run(host='0.0.0.0', port=3333)

if __name__ == "__main__":
    main()
