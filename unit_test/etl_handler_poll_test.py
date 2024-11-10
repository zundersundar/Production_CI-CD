# This is a unit test to valida etl_handler process. 
# A http request shall be called on a regular interval

import requests
import time

def poll_etl_handler():
    print('Initiating ETL HANDLER')
    region = 'eu-west-1'
    url = 'https://sqs.eu-west-1.amazonaws.com/009925156537/mqtt_events'
    while True:
        response = requests.post(url= 'http://52.55.80.231:6000/initiate_etl', json= {'event': region}) 
        print(response)
        time.sleep(20)

def main():
    poll_etl_handler()

if __name__ == "__main__":
    main()
