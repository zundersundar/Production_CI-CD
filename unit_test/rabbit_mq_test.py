import sys

#sys.path.append('../datamgr/rabbitmq')
sys.path.append('../')

# from datamgr.mqtt_pub import CHDB_MQTT_PUB
# from datamgr import mqtt_pub
from datamgr import rabbitmq

# from rabbitmq import RABBITMQ_CLIENT
import pika
import time
import threading

host_name = "localhost"
#host_name = '127.0.0.1'
port = 5672
rabbitmq_queue = "test_queue"

def rabbit_mq_connect(client):
    client.create_channel()
    client.create_queue(rabbitmq_queue)

def rabbit_mq_publish(client, count):
    count = 0
    while True:
        count += 1
        test_message = f"publishing - {count} message"
        client.publish(test_message)
        time.sleep(3)

def consume_callback_test(channel, method, properties, body) -> None:
    print("Received message: ", body.decode())

def rabbit_mq_consume(client, count):
    client.consume(consume_callback_test)
    client.loop_forever()

def main() -> None:
    client_pub = rabbitmq.RABBITMQ_CLIENT(host_name, port)
    client_sub = rabbitmq.RABBITMQ_CLIENT(host_name, port)
    rabbit_mq_connect(client_pub)
    rabbit_mq_connect(client_sub)
    publisher = threading.Thread(target=rabbit_mq_publish, args=(client_pub,1))
    consumer = threading.Thread(target=rabbit_mq_consume, args=(client_sub,1))
    publisher.start()
    time.sleep(5)
    consumer.start()
    publisher.join()
    #consumer.join()

if __name__ == "__main__":
    main()
