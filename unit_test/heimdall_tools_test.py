# This is an AWS SQS module. The processed messages will be sent to SNS topic by other services.
# SQS queue subscribe to this SNS topic to queue the messages for further processing.
# In the architecture, an HTTP endpoint shall read data from SQS for further processing in most of the cases.

import json
import time
from datetime import datetime
import boto3
import redis
import os
from dotenv import load_dotenv
from heimdall_tools.sqs import read_from_sqs_queue
from heimdall_tools.sqs import write_to_sqs_queue
from heimdall_tools.redis_client import get_redis_connection
from heimdall_tools.redis_client import set_with_expiry
from heimdall_tools.redis_client import get_from_cache
from heimdall_tools.sns import post_to_sns_topic
from heimdall_tools.s3 import upload_data_to_s3, read_data_from_s3
from heimdall_tools.s3 import upload_data_to_s3, read_data_from_s3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from heimdall_tools.vault import get_vault_secrets


def mysql_client_test():
    load_dotenv()
    common_secrets, user_secrets= get_vault_secrets(
        os.getenv('VAULT_ADDR'),os.getenv('VAULT_USER_SECRETS_PATH'),
        os.getenv('VAULT_USERNAME'),os.getenv('VAULT_PASSWORD')
    )
    host = common_secrets.get('RDS_HOSTNAME')
    username = user_secrets.get('RDS_USERNAME')
    password = user_secrets.get('RDS_PASSWORD')
    db_name = common_secrets.get('RDS_DB_NAME')

    print(host, username, password, db_name)  # Ensure these are the expected values

    connector = MYSQL_DB_CLIENT(
        username=username,
        password=password,
        hostname=host,
        database_name=db_name,
        raise_on_warnings=True
    )
    connector.db_connect()
    response = connector.db_read_sensor_id_from_heimdall_memory(
        customer_name="Bartlett",
        site_name="Feedspan",
        building_name="Lotstring",
        floor_position=1,
        type_id=1,
        sensor_name="S3"
    )
    print(f"Sensor ID Returning from mysql package {response[0]}")

def sqs_queue_read_test():
    region = 'eu-west-1'
    url = 'https://sqs.eu-west-1.amazonaws.com/009925156537/mqtt_etl_handler_queue'
    response = read_from_sqs_queue(region=region, queue_url=url)
    print("Response from SQS:", response)  # Debug print

    if 'Messages' in response:
        # Process each message
        for message in response['Messages']:
            # Get message body
            body = message['Body']
            print("Received message:", body)
    else:
        print("No messages received")

def sqs_queue_write_test():
    region = 'eu-west-1'
    url = 'https://sqs.eu-west-1.amazonaws.com/009925156537/mqtt_etl_handler_queue'
    current_time = datetime.now()
    time_str = current_time.strftime("%Y-%m-%d %H:%M:%S")
    message_data =   {   'sensor_id': 'sensor002',
        'timestamp': time_str,
        'value': 25.5
    }
    response = write_to_sqs_queue(region, queue_url = url, message_body = message_data)
    print(response)


import redis

def redis_client_test():
    # Establish connection
    conn = get_redis_connection('dev.towerwatch.io')
    print(conn)

    # Set a key with an expiry time of 5 seconds
    set_with_expiry(conn, 'AppName', 'Heimdall', expiry_time=5)

    # Get the value immediately to ensure it's set
    value = get_from_cache(conn, 'AppName').decode('utf-8')
    print(value)

    # Assert that the value is set correctly
    assert value == 'Heimdall', "Value in Redis is not set correctly"
    
    # Wait for 6 seconds to let the key expire
    time.sleep(6)
    
    #get the value again after expiry
    expired_value = get_from_cache(conn, 'AppName')
    
    # Assert that the value is now expired (should return None)
    assert expired_value is None, "Value should have expired but it didn't"
    print("Value has expired as expected.")
    
    
def test_post_to_sns_topic():
    region = 'us-east-1'
    arn = 'arn:aws:sns:us-east-1:009925156537:test-topic'
    topic = 'test-topic'
    key = 'TestKey'
    value = 'TestValue'

    # Call the function
    response = post_to_sns_topic(region, arn, topic, key, value)

    # Print the response for debugging
    print("Response from SNS:", response)

    # Check assertions
    assert response['ResponseMetadata']['HTTPStatusCode'] == 200
    print("Message ID:", response['MessageId'])

BUCKET_NAME = 'angelclockhash'
OBJECT_NAME = 'test.txt'
DATA_TO_UPLOAD = 'This is a test upload.'

s3 = boto3.client('s3')

def test_upload_data_to_s3():
    try:
        response = upload_data_to_s3(BUCKET_NAME, DATA_TO_UPLOAD, OBJECT_NAME)
        assert response['ResponseMetadata']['HTTPStatusCode'] == 200
        print(f"Data uploaded to {BUCKET_NAME}/{OBJECT_NAME}")
    except NoCredentialsError:
        print("Credentials not available")
    except PartialCredentialsError:
        print("Incomplete credentials provided")
    except Exception as e:
        print(f"An error occurred: {e}")

def test_read_data_from_s3():
    try:
        # Upload data first
        upload_data_to_s3(BUCKET_NAME, DATA_TO_UPLOAD, OBJECT_NAME)
        
        # Read data from S3
        data = read_data_from_s3(BUCKET_NAME, OBJECT_NAME)
        assert data == DATA_TO_UPLOAD
        print(f"Data downloaded from {BUCKET_NAME}/{OBJECT_NAME}")
        
        # Delete the object after reading
        s3.delete_object(Bucket=BUCKET_NAME, Key=OBJECT_NAME)
        print(f"Object {OBJECT_NAME} deleted from {BUCKET_NAME}")
    except NoCredentialsError:
        print("Credentials not available")
    except PartialCredentialsError:
        print("Incomplete credentials provided")
    except Exception as e:
        print(f"An error occurred: {e}")



def main():
    # sqs_queue_write_test()
    # mysql_client_test()
    redis_client_test()
    # time.sleep(3)
    # test_post_to_sns_topic()
    # sqs_queue_read_test()
    # test_upload_data_to_s3()
    # test_read_data_from_s3()


if __name__ == "__main__":
    main()
