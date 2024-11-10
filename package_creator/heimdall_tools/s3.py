import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

# Initialize a session using Amazon S3
s3 = boto3.client('s3')

def upload_data_to_s3(bucket_name, data, object_name):
    """
    Upload data to an S3 bucket
    :param bucket_name: Bucket to upload to
    :param data: Data to upload (str or bytes)
    :param object_name: S3 object name
    :return: True if data was uploaded, else False
    """
    try:
        s3.put_object(Bucket=bucket_name, Key=object_name, Body=data)
        print(f"Data uploaded to {bucket_name}/{object_name}")
        return True
    except NoCredentialsError:
        print("Credentials not available")
        return False
    except PartialCredentialsError:
        print("Incomplete credentials provided")
        return False

def read_data_from_s3(bucket_name, object_name):
    """
    Download data from an S3 bucket and delete the object afterwards
    :param bucket_name: Bucket to download from
    :param object_name: S3 object name
    :return: Data (str) if downloaded, else None
    """
    try:
        response = s3.get_object(Bucket=bucket_name, Key=object_name)
        data = response['Body'].read().decode('utf-8')
        print(f"Data downloaded from {bucket_name}/{object_name}")
        
        # Delete the object after downloading
        s3.delete_object(Bucket=bucket_name, Key=object_name)
        print(f"Object {object_name} deleted from {bucket_name}")
        
        return data
    except NoCredentialsError:
        print("Credentials not available")
        return None
    except PartialCredentialsError:
        print("Incomplete credentials provided")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# # Example usage
# if __name__ == "__main__":
#     # Replace these variables with your bucket name, data, and object names
#     bucket = 'your-bucket-name'
#     data_to_upload = 'This is the data to upload'
#     s3_object_name = 'your/object/name/on/s3'
    
#     # Upload data to S3
#     upload_data_to_s3(bucket, data_to_upload, s3_object_name)
    
#     # Download data from S3 and delete it
#     downloaded_data = download_and_delete_data_from_s3(bucket, s3_object_name)
#     if downloaded_data is not None:
#         print(f"Downloaded data: {downloaded_data}")
