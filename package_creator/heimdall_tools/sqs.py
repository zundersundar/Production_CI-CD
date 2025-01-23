# This is an AWS SQS module. The processed messages will be sent to SQS topic by MQTT services.
# Lambda function shall subscribe to SQS queue to read the messages for further processing.
# In the architecture, an HTTP endpoint shall be hooked to lambda function for further processing in most of the cases.

import json
import boto3

def read_from_sqs_queue(region, queue_url, max_number_messages=10, timeout_secs=20, delete_on_read=True):
    sqs_client = boto3.client('sqs', region_name=region)
    response = sqs_client.receive_message(
        QueueUrl=queue_url,
        MaxNumberOfMessages = max_number_messages,  # Maximum number of messages to retrieve
        WaitTimeSeconds=timeout_secs,
    )
    
    if delete_on_read and 'Messages' in response:
        for message in response['Messages']:
            sqs_client.delete_message(
                QueueUrl=queue_url,
                ReceiptHandle=message['ReceiptHandle']
            )
    
    return response


def write_to_sqs_queue(region, queue_url, message_body, message_attributes=None):
    """
    Write messages to an AWS SQS queue.

    Parameters:
    - region: The AWS region where the SQS queue is located.
    - queue_url: The URL of the SQS queue.
    - message_body: The body of the message to be sent to the SQS queue.
    - message_attributes: Optional dictionary of message attributes to send with the message.

    Returns:
    - response: The response from the SQS send_message API call.
    """

    sqs_client = boto3.client('sqs', region_name=region)

    # Construct the message attributes if provided
    if message_attributes is None:
        message_attributes = {}

    # Send the message to the queue
    response = sqs_client.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps(message_body),
        MessageAttributes=message_attributes
    )

    return response