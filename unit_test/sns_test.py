import boto3

# Initialize the SNS client
sns_client = boto3.client('sns', region_name='eu-west-1')  # Replace 'your_region' with your AWS region

# Define the ARN (Amazon Resource Name) of the SNS topic
sns_topic_arn = 'arn:aws:sns:eu-west-1:009925156537:mqtt_listener'  # Replace placeholders with your actual values

# Define the message you want to publish
message = 'Hello from Python! This is a test message.'

# Publish the message to the SNS topic
response = sns_client.publish(
    TopicArn=sns_topic_arn,
    Message=message
)

# Print the response
print(response)
