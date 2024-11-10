#TODO Replace with FAST API

import sqlalchemy as db
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, update
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import MetaData, Table, select, text
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Tuple
from dotenv import load_dotenv
from flask import Flask, request, json, jsonify
import os
import jwt, secrets
from functools import wraps
from heimdall_tools.vault import get_vault_secrets

app = Flask(__name__)
# Generate a random secret key
secret_key = secrets.token_urlsafe(32)
app.config['SECRET_KEY'] = secret_key
db_connector = None

# Create the base class for declarative models
Base = declarative_base()


# Define the model
class HeimdallMqttTopics(Base):
    __tablename__ = 'heimdall_mqtt_topics'
    id = db.Column(db.Integer, primary_key=True)
    topic_name = db.Column(db.String(255))
    customer_name = db.Column(db.String(255))
    site_name = db.Column(db.String(255))
    building_name = db.Column(db.String(255))

class Customer(Base):
    __tablename__ = 'customers'
    customer_id = Column(Integer, primary_key=True, autoincrement=True)
    customer_name = Column(String(255))

class Site(Base):
    __tablename__ = 'sites'
    site_id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'))
    site_name = Column(String(255))
    buildings_count = Column(Integer)
    last_updated = Column(DateTime)
    customer = relationship('Customer')

class Building(Base):
    __tablename__ = 'buildings'
    building_id = Column(Integer, primary_key=True)
    site_id = Column(Integer, ForeignKey('sites.site_id'))
    building_name = Column(String(255))
    floor_count = Column(Integer)
    last_updated = Column(DateTime)
    site = relationship('Site')

class Floor(Base):
    __tablename__ = 'floors'
    floor_id = Column(Integer, primary_key=True)
    building_id = Column(Integer, ForeignKey('buildings.building_id'))
    floor_position = Column(Integer)
    sensor_count = Column(Integer)
    last_updated = Column(DateTime)
    building = relationship('Building')

class SensorType(Base):
    __tablename__ = 'sensor_type'
    type_id = Column(Integer, primary_key=True)
    type_name = Column(String(255))
    unit = Column(String(255))

class Sensor(Base):
    __tablename__ = 'sensors'
    sensor_id = Column(Integer, primary_key=True)
    sensor_name = Column(String(255))
    value = Column(Integer)
    floor_id = Column(Integer, ForeignKey('floors.floor_id'))
    type_name = Column(String(255), ForeignKey('sensor_type.type_name'))
    last_updated = Column(DateTime)
    floor = relationship('Floor')
    type = relationship('SensorType')


"""""
@dataclass
class mysql:
    username: String
    password: String
    host: String
    database_name: String
    raise_on_warnings: Bool
"""""
class MYSQL_DB_CLIENT:
    def __init__(self) -> None:
        load_dotenv()
        common_secrets, user_secrets= get_vault_secrets(
            os.getenv('VAULT_ADDR'),os.getenv('VAULT_USER_SECRETS_PATH'),
            os.getenv('VAULT_USERNAME'),os.getenv('VAULT_PASSWORD')
        )
        self.host = common_secrets.get('RDS_HOSTNAME')
        self.username = user_secrets.get('RDS_USERNAME')
        self.password = user_secrets.get('RDS_PASSWORD')
        self.db_name = common_secrets.get('RDS_DB_NAME')
        print(self.host, self.username, self.password, self.db_name)
    
    def db_connect(self):
        connection_string = f"mysql+pymysql://{self.username}:{self.password}@{self.host}/{self.db_name}"
        try:
            self.engine = db.create_engine(connection_string)
            global Base
            Base.metadata.create_all(self.engine)
            Session = sessionmaker(bind=self.engine)
            self.session = Session()
            if self.session is None:
                raise SQLAlchemyError("Failed to create session")
            print(f"Successfully connected to Database {self.db_name}")
            
        except SQLAlchemyError as e:
            print(f"An error occurred: {e}")
        except Exception as e:
            print(f"A generic error occurred: {e}")

    def db_read_mqtt_topic_names(self):
        # Define a metadata object
        metadata = MetaData()
        topic_names = Table('heimdall_mqtt_topics', metadata, 
                        autoload_with=self.engine)
        query = self.session.query(topic_names)
        print(f"Query: {query}")
        result = query.all()
        print(f"Result: {result}")
        return result

    def db_read_sensors(self, count):
        # Define a metadata object
        metadata = MetaData()
        Sensors = Table('sensors', metadata, 
                        autoload_with=self.engine)
        #TODO should use inbuilt methods rather than raw queries
        #query = Sensors.select()
        # raw_sql = f"select * from sensors limit {count}"
        #text_query = text(raw_sql)
        query = self.session.query(Sensors)
        query = query.limit(10)
        print(f"Query: {query}")
        result = query.all()
        print(f"Result: {result}")
        return result

    def db_read_sensor_id_from_heimdall_memory(self, customer_name, site_name, building_name, floor_position, type_name, sensor_name) -> int:
        query = (
            self.session.query(Sensor.sensor_id)
            .join(Floor, Sensor.floor_id == Floor.floor_id)
            .join(Building, Floor.building_id == Building.building_id)
            .join(Site, Building.site_id == Site.site_id)
            .join(Customer, Site.customer_id == Customer.customer_id)
            .join(SensorType, Sensor.type_name == SensorType.type_name)
            .filter(Customer.customer_name == customer_name)
            .filter(Site.site_name == site_name)
            .filter(Building.building_name == building_name)
            .filter(Floor.floor_position == floor_position)
            .filter(SensorType.type_name == type_name)
            .filter(Sensor.sensor_name == sensor_name)
        )
        print(f"Query : {query}")
        result = query.all()
        print(f"Result --> {result}")
        return result[0][0]

    def db_read_sensor_id_and_value_from_heimdall_memory(self, customer_name, site_name, building_name, floor_position, type_name, sensor_name) -> int:
        query = (
            self.session.query(Sensor.value, Sensor.sensor_id)
            .join(Floor, Sensor.floor_id == Floor.floor_id)
            .join(Building, Floor.building_id == Building.building_id)
            .join(Site, Building.site_id == Site.site_id)
            .join(Customer, Site.customer_id == Customer.customer_id)
            .join(SensorType, Sensor.type_name == SensorType.type_name)
            .filter(Customer.customer_name == customer_name)
            .filter(Site.site_name == site_name)
            .filter(Building.building_name == building_name)
            .filter(Floor.floor_position == floor_position)
            .filter(SensorType.type_name == type_name)
            .filter(Sensor.sensor_name == sensor_name)
        )
        print(f"Query : {query}")
        result = query.all()
        print(f"Result --> {result}")
        for row in result:
            print(f"row: {row}")
        
        return result

    def db_update_sensor_value_to_heimdall_memory(self, sensor_id, update_sensor_value) -> str:
        
        update_query = (
            update(Sensor)
            .where(Sensor.sensor_id == sensor_id)
            .values(value = update_sensor_value)
        )
        # Execute the update query
        result = self.session.execute(update_query)
        
        # Commit the changes
        self.session.commit()

        return "Success"


# Define the JWT token validation middleware
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(*args, **kwargs)

    return decorated

# Endpoint to read topics
@app.route('/read_mqtt_topic_names', methods=['POST'])
def read_mqtt_topic_names():
    try:
        conn = get_db_connector()
        topics = conn.db_read_mqtt_topic_names()
        print(f"Topics: {topics}")
        result = [
            {
                "id": topic.id,
                "topic_name": topic.topic_name,
                "customer_name": topic.customer_name,
                "site_name": topic.site_name,
                "building_name": topic.building_name
            } for topic in topics
        ]
        print(f"Result: {result}")
        return jsonify(result), 200
    
    except Exception as e:
        error_message = str(e)
        print(error_message)
        return jsonify({"error": error_message}), 500  # Return internal server error status code 500


@app.route('/read_sensors', methods = ['POST'])
def db_read_sensors():
    data = request.json
    conn = get_db_connector()
    if data['count'] is None:
        return jsonify({'message' : 'Invalid Arguments'}), 400
    
    count = data['count']
    result = conn.db_read_sensors(count=count)
    return jsonify({'Sensor details' : result}), 200


@app.route('/read_sensor_id', methods = ['POST'])
#@token_required
def read_sensor_id():
    data = request.json
    conn = get_db_connector()

    customer_name = data['customer_name']
    site_name = data['site_name']
    building_name = data['building_name']    
    floor_position = data['floor_position']
    sensor_name = data['sensor_name']
    sensor_type = data ['sensor_type']
    print(f"customer name: {customer_name}, site_name: {site_name} floor_position: {floor_position}, sensor_name: {sensor_name}  sensor_type: {sensor_type}")
    if customer_name is None or site_name is None or building_name is None or floor_position is None or sensor_name is None or sensor_type is None:
        return jsonify ({'message' : "Invalid Arguments"}), 400
    
    sensor_id = conn.db_read_sensor_id_from_heimdall_memory(customer_name, site_name, building_name, floor_position, sensor_type, sensor_name)
    print(f"sensorID --> {sensor_id}")
    return jsonify({'sensor_id' : sensor_id}), 200

@app.route('/read_sensor_id_and_value', methods = ['POST'])
#@token_required
def read_sensor_id_and_value():
    data = request.json
    conn = get_db_connector()

    customer_name = data['customer_name']
    site_name = data['site_name']
    building_name = data['building_name']    
    floor_position = data['floor_position']
    sensor_name = data['sensor_name']
    sensor_type = data ['sensor_type']
    print(f"TW_DBG, customer name: {customer_name}, site_name: {site_name} floor_position: {floor_position}, sensor_name: {sensor_name}  sensor_type: {sensor_type}")
    if customer_name is None or site_name is None or building_name is None or floor_position is None or sensor_name is None or sensor_type is None:
        return jsonify ({'message' : "Invalid Arguments"}), 400
    
    sensor_value = conn.db_read_sensor_id_and_value_from_heimdall_memory(customer_name, site_name, building_name, floor_position, sensor_type, sensor_name)
    print(f"TW_DBG,sensor Value --> {sensor_value}")
    return jsonify(
        {
            'sensor_id' : sensor_value[0][1], 
            'sensor_value' : sensor_value[0][0]        
        }
    ), 200


@app.route('/update_sensor_value', methods = ['POST'])
#@token_required
def update_sensor_value():
    data = request.json
    conn = get_db_connector()

    # customer_name = data['customer_name']
    # site_name = data['site_name']
    # building_name = data['building_name']    
    # floor_position = data['floor_position']
    # sensor_name = data['sensor_name']
    # sensor_type = data ['sensor_type']
    # sensor_value = data['sensor_value']
    # print(f"customer name: {customer_name}, site_name: {site_name}, building_name: {building_name}, floor_position: {floor_position}, sensor_name: {sensor_name}  sensor_type: {sensor_type}")
    # if customer_name is None or site_name is None or building_name is None or floor_position is None or sensor_name is None or sensor_type is None or sensor_value is None:
    #     return jsonify ({'message' : "Invalid Arguments"}), 400
    
    sensor_id = data['sensor_id']
    sensor_value = data['sensor_value']
    if sensor_id is None or sensor_value is None:
        return jsonify ({'message' : "Invalid Arguments"}), 400
    
    status = conn.db_update_sensor_value_to_heimdall_memory(sensor_id, sensor_value)

    print(f"status --> {status}")

    return jsonify({'status' : status}), 200


@app.route('/login', methods = ['POST'])
def login():
    auth = request.json
    if not auth['user_name'] or not auth['password']:
        return jsonify({'message': "Bad Request"}), 400
    
    #TODO check username and password in the users table
    validation = True

    if validation:
        token = jwt.encode({'username' : auth['user_name']}, app.config('SECRET_KEY'))
        return jsonify({'acess_token' : token.decode('UTF-8')}), 200

    return jsonify({'message': "Invalid Credentials"}), 401

#Get db_connector to communicate with MySQL
def get_db_connector() -> MYSQL_DB_CLIENT:
    global db_connector
    return db_connector


def main():
  global db_connector
  db_connector = MYSQL_DB_CLIENT()
  db_connector.db_connect()
  if db_connector is None:
      print("Error Connecting to Database")
      return None
  else:
      print("Successfully connected to Database")

  app.run(host='0.0.0.0', port=8000)

if __name__ == "__main__":
    main()
