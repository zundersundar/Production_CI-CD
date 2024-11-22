import os
import jwt
from functools import wraps
from datetime import datetime
from flask import request, jsonify, current_app
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData, Table, update, delete
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from sqlalchemy import func
from contextlib import contextmanager
from app.models import *
from app.schemas import *
from heimdall_tools.vault import get_vault_secrets

db_connector = None
load_dotenv()

class MYSQL_DB_CLIENT:
    def __init__(self) -> None:
        common_secrets, user_secrets= get_vault_secrets(
        os.getenv('VAULT_ADDR'),os.getenv('VAULT_USER_SECRETS_PATH'),
        os.getenv('VAULT_USERNAME'),os.getenv('VAULT_PASSWORD')
    )
        self.host = common_secrets.get('RDS_HOSTNAME')
        self.username = user_secrets.get('RDS_USERNAME')
        self.password = user_secrets.get('RDS_PASSWORD')
        self.db_name = common_secrets.get('RDS_DB_NAME')
        print(self.host)
        connection_string = f"mysql+pymysql://{self.username}:{self.password}@{self.host}/{self.db_name}"
        self.engine = create_engine(connection_string)
    
    @contextmanager
    def db_session(self):
        global db_connector
            
        Session = sessionmaker(bind=self.engine)
        session = Session()
        try:
            yield session
            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            print(f"SQLAlchemyError: {e}")
            db_connector = None
            raise
        except Exception as e:
            session.rollback()
            print(f"Generic Error: {e}")
            db_connector = None
            raise
        finally:
            session.close()

    # def db_connect(self):
    #     connection_string = f"mysql+pymysql://{self.username}:{self.password}@{self.host}/{self.db_name}"
    #     try:
    #         self.engine = create_engine(connection_string)
    #         #Base.metadata.create_all(self.engine)
    #         Session = sessionmaker(bind=self.engine)
    #         self.session = Session()
    #         if self.session is None:
    #             raise SQLAlchemyError("Failed to create session")
    #     except SQLAlchemyError as e:
    #         print(f"An error occurred: {e}")
    #     except Exception as e:
    #         print(f"A generic error occurred: {e}")


    def db_read_mqtt_topic_names(self):
        with self.db_session() as session:
            topics = session.query(HeimdallMqttTopics).all()

            if not topics:
                return []

            return [{
                "id": topic.id,
                "topic_name": topic.topic_name,
                "customer_name": topic.customer_name,
                "site_name": topic.site_name,
                "building_name": topic.building_name
            } for topic in topics]

    
    def db_read_customers(self):
        with self.db_session() as session:
            customers = (
                session.query(
                    Customer.customer_id,
                    Customer.customer_name,
                    Customer.email,
                    Customer.logo,
                    func.count(Site.site_id).label('sites_count')
                )
                .outerjoin(Site)
                .group_by(Customer.customer_id)
                .all()
            )

        return [{
            "customer_id": customer.customer_id,
            "customer_name": customer.customer_name,
            "email": customer.email,
            "logo": customer.logo,
            "sites_count": customer.sites_count
        } for customer in customers]

    def db_add_customer(self, customer_name, email, logo):
        with self.db_session() as session:
            new_customer = Customer(
                customer_name=customer_name,
                email=email,
                logo=logo
            )
            session.add(new_customer)
            session.commit()
            return new_customer.customer_id


    def db_update_customer(self, customer_id, customer_name=None, email=None, logo=None):
        with self.db_session() as session:
            customer = session.query(Customer).filter_by(customer_id=customer_id).first()
            if not customer:
                return 'not_found'

            if customer_name is not None:
                customer.customer_name = customer_name
            if email is not None:
                customer.email = email
            if logo is not None:
                customer.logo = logo

            session.commit()
            return 'Update successful'

    def db_delete_customer(self, customer_id):
        with self.db_session() as session:
            customer = session.query(Customer).filter_by(customer_id=customer_id).first()
            if not customer:
                return 'not_found'

            session.delete(customer)
            session.commit()
            return 'Customer deleted successfully'

        


        
    def db_read_sites_customer_id(self, customer_id):
        with self.db_session() as session:
            sites = (
                session.query(
                    Site.site_id,
                    Site.customer_id,
                    Site.site_name,
                    Site.site_location,
                    Site.last_updated,
                    func.count(Building.building_id).label('buildings_count')
                )
                .outerjoin(Building, Site.site_id == Building.site_id)
                .filter(Site.customer_id == customer_id)
                .group_by(Site.site_id)
                .all()
            )

        return [{
            "site_id": site.site_id,
            "customer_id": site.customer_id,
            "site_name": site.site_name,
            "site_location": site.site_location,
            "last_updated": site.last_updated,
            "buildings_count": site.buildings_count
        } for site in sites]




    def db_add_site(self, site_name, customer_id, site_location):
        with self.db_session() as session:
                new_site = Site(
                    site_name=site_name,
                    customer_id=customer_id,
                    site_location=site_location,
                    last_updated=datetime.utcnow()  
                )
                session.add(new_site)
                session.commit()
                return new_site.site_id

        

    def db_update_site(self, site_id, site_name=None, customer_id=None, site_location=None):
        with self.db_session() as session:
                site = session.query(Site).filter_by(site_id=site_id).first()
                if not site:
                    return 'not_found'
                if site_name is not None:
                    site.site_name = site_name
                if customer_id is not None:
                    site.customer_id = customer_id
                if site_location is not None:
                    site.site_location = site_location

                site.last_updated = datetime.utcnow()
                session.commit()
                return 'Update successful'

    def db_get_site_by_id(self, site_id):
        with self.db_session() as session:
            site = (
                session.query(
                    Site.customer_id,
                    Site.site_name,
                    Site.last_updated,
                    Site.site_location
                )
                .filter(Site.site_id == site_id)
                .first()
            )

        if site:
            return {
                "customer_id": site.customer_id,
                "site_name": site.site_name,
                "last_updated": site.last_updated,
                "site_location": site.site_location
                }
        return None

    def db_delete_site(self, site_id):
        with self.db_session() as session:
                site = session.query(Site).filter_by(site_id=site_id).first()
                if not site:
                    return 'not_found'

                session.delete(site)
                session.commit()
                return "Site deleted successfully"
        
    

    def db_read_buildings_site_id(self, site_id):
        with self.db_session() as session:
            buildings = (
                session.query(
                    Building.building_id,
                    Building.site_id,
                    Building.building_name,
                    Building.last_updated,
                    func.count(Floor.floor_id).label('floors_count')
                )
                .outerjoin(Floor, Building.building_id == Floor.building_id)
                .filter(Building.site_id == site_id)
                .group_by(Building.building_id)
                .all()
            )

        return [{
            "building_id": building.building_id,
            "site_id": building.site_id,
            "building_name": building.building_name,
            "last_updated": building.last_updated,
            "floors_count": building.floors_count
        } for building in buildings]



    def db_add_building(self, site_id, building_name):
        with self.db_session() as session:
            new_building = Building(
                site_id=site_id,
                building_name=building_name,
                last_updated=datetime.utcnow()
            )
            session.add(new_building)
            session.commit()
            return new_building.building_id
        
    def db_get_building_by_id(self, building_id):
        with self.db_session() as session:
            building = (
                session.query(
                    Building.site_id,
                    Building.building_name,
                    Building.last_updated
                )
                .filter(Building.building_id == building_id)
                .first()
            )

        if building:
            return {
                "site_id": building.site_id,
                "building_name": building.building_name,
                "last_updated": building.last_updated
            }
        return None

    def db_update_building(self, building_id, site_id=None, building_name=None):
        with self.db_session() as session:
            building = session.query(Building).filter_by(building_id=building_id).first()
            
            if not building:
                return 'Building not_found'
            
            if site_id is not None:
                building.site_id = site_id
            if building_name is not None:
                building.building_name = building_name
            building.last_updated = datetime.utcnow()
            
            session.commit()
            return 'Update successful'


    def db_delete_building(self, building_id):
        with self.db_session() as session:
            building = session.query(Building).filter_by(building_id=building_id).first()

            if building is None:
                return 'not_found'

            session.delete(building)
            session.commit()
            return 'Building deleted'

    
    def db_read_floors_building_id(self, building_id):
        with self.db_session() as session:
            floors = (
                session.query(
                    Floor.floor_id,
                    Floor.building_id,
                    Floor.floor_position,
                    Floor.floor_plan,
                    Floor.last_updated,
                    func.count(Sensor.sensor_id).label('sensors_count')  
                )
                .outerjoin(Sensor, Floor.floor_id == Sensor.floor_id)  
                .filter(Floor.building_id == building_id)
                .group_by(Floor.floor_id)
                .all()
            )

        return [{
            "floor_id": floor.floor_id,
            "building_id": floor.building_id,
            "floor_position": floor.floor_position,
            "sensors_count": floor.sensors_count, 
            "floor_plan": floor.floor_plan,
            "last_updated": floor.last_updated
        } for floor in floors]

    def db_add_floor(self, building_id, floor_position, floor_plan):
        with self.db_session() as session:
            new_floor = Floor(
                building_id=building_id,
                floor_position=floor_position,
                floor_plan=floor_plan,
                last_updated=datetime.utcnow()
            )
            session.add(new_floor)
            session.commit()
            return new_floor.floor_id

    def db_get_floor_by_id(self, floor_id):
        with self.db_session() as session:
            floor = (
                session.query(
                    Floor.building_id,
                    Floor.floor_position,
                    Floor.last_updated,
                    Floor.floor_plan
                )
                .filter(Floor.floor_id == floor_id)
                .first()
            )

        if floor:
            return {
                "building_id": floor.building_id,
                "floor_position": floor.floor_position,
                "last_updated": floor.last_updated,
                "floor_plan": floor.floor_plan
            }
        return None

    def db_update_floor(self, floor_id, building_id=None, floor_position=None, floor_plan=None):
        with self.db_session() as session:
            floor = session.query(Floor).filter_by(floor_id=floor_id).first()

            if not floor:
                return 'not_found'

            if building_id is not None:
                floor.building_id = building_id
            if floor_position is not None:
                floor.floor_position = floor_position
            if floor_plan is not None:
                floor.floor_plan = floor_plan

            floor.last_updated = datetime.utcnow()
            session.commit()
            return 'Update successful'


    def db_delete_floor(self, floor_id):
        with self.db_session() as session:
            floor = session.query(Floor).filter_by(floor_id=floor_id).first()

            if floor is None:
                return 'not_found'

            session.delete(floor)
            session.commit()
            return 'Floor deleted successfully' 


    def db_read_sensors_by_floor_id(self, floor_id):
        with self.db_session() as session:
            sensors = (
                session.query(
                    Sensor.sensor_id,
                    Sensor.sensor_name,
                    Sensor.value,
                    Sensor.source,
                    Sensor.x_coordinate,
                    Sensor.y_coordinate,
                    SensorType.type_name.label('sensor_type')
                )
                .join(SensorType, Sensor.type_name == SensorType.type_name)
                .filter(Sensor.floor_id == floor_id)
                .all()
            )

            total_sensor_count = session.query(func.count(Sensor.sensor_id)).filter(Sensor.floor_id == floor_id).scalar()
            floor_position = session.query(Floor.floor_position).filter(Floor.floor_id == floor_id).scalar()

        return [{
            "sensor_id": sensor.sensor_id,
            "sensor_name": sensor.sensor_name,
            "value": sensor.value,
            "source": sensor.source,
            "x_coordinate": sensor.x_coordinate,
            "y_coordinate": sensor.y_coordinate,
            "sensor_type": sensor.sensor_type
        } for sensor in sensors], total_sensor_count, floor_position



    def db_read_sensor_id_from_heimdall_memory(self, customer_name, site_name, building_name, floor_position, type_name, sensor_name):
        with self.db_session() as session:
            sensors = (
                session.query(Sensor.sensor_id)
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
                .first()
            )

        return sensors.sensor_id if sensors else None
      
    def db_read_sensor_id_and_value_from_heimdall_memory(self, customer_name, site_name, building_name, floor_position, type_name, sensor_name):
        with self.db_session() as session:
            sensor = (
                session.query(Sensor.sensor_id, Sensor.value)
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
                .first()  
            )

    
        if sensor:
            return {"sensor_id": sensor.sensor_id, "value": sensor.value}
        
        return None


    def db_add_multiple_sensors(self, sensors_data):
        with self.db_session() as session:
            sensor_ids = []

            for sensor_data in sensors_data:
                sensor_type = session.query(SensorType).filter_by(type_name=sensor_data['sensor_type']).first()
                if not sensor_type:
                    raise SQLAlchemyError(f"SensorType with name {sensor_data['sensor_type']} not found.")

                new_sensor = Sensor(
                    sensor_name=sensor_data['sensor_name'],
                    value=sensor_data['value'],
                    floor_id=sensor_data['floor_id'],
                    type_name=sensor_data['sensor_type'],
                    source=sensor_data['source'],
                    x_coordinate=sensor_data['x_coordinate'],
                    y_coordinate=sensor_data['y_coordinate'],
                    last_updated=datetime.utcnow()
                )

                session.add(new_sensor)
                session.flush()
                sensor_ids.append(new_sensor.sensor_id)

            session.commit()
            return sensor_ids

    def db_get_sensor_by_id(self, sensor_id):
        with self.db_session() as session:
            sensor = session.query(Sensor).filter_by(sensor_id=sensor_id).first()
        
            if not sensor:
                return None
        
            return {
                'sensor_id': sensor.sensor_id,
                'sensor_name': sensor.sensor_name,
                'value': sensor.value,
                'floor_id': sensor.floor_id,
                'type_name': sensor.type_name,
                'source': sensor.source,
                'x_coordinate': sensor.x_coordinate,
                'y_coordinate': sensor.y_coordinate,
                'last_updated': sensor.last_updated
            }
 

    def db_update_sensor(self, sensor_id, sensor_name=None, value=None, floor_id=None, type_name=None, source=None, x_coordinate=None, y_coordinate=None):
        with self.db_session() as session:
            sensor = session.query(Sensor).filter_by(sensor_id=sensor_id).first()

            if not sensor:
                return 'Sensor not found'

            if sensor_name is not None:
                sensor.sensor_name = sensor_name
            if value is not None:
                sensor.value = value
            if floor_id is not None:
                sensor.floor_id = floor_id
            if type_name is not None:
                sensor.type_name = type_name
            if source is not None:
                sensor.source = source
            if x_coordinate is not None:
                sensor.x_coordinate = x_coordinate
            if y_coordinate is not None:
                sensor.y_coordinate = y_coordinate

            sensor.last_updated = datetime.utcnow()
            session.commit()
            return 'Update successful'


    def db_read_alarm_types(self):
        with self.db_session() as session:
            alarm_types = (
                session.query(
                    AlarmType.id,
                    AlarmType.name,
                    AlarmType.severity
                )
                .all()
            )

        return [{
            "id": alarm_type.id,
            "name": alarm_type.name,
            "severity": alarm_type.severity
        } for alarm_type in alarm_types]




    def db_read_alarms_sensor_id(self, sensor_id):
        with self.db_session() as session:
            alarms = (
                session.query(
                    Alarms.id,
                    Alarms.building_id,
                    Alarms.sensor_id,
                    Alarms.name,
                    Alarms.upper_threshold,
                    Alarms.lower_threshold,
                    Alarms.floor_id,
                    Alarms.last_updated,
                    Alarms.status
                )
                .filter(Alarms.sensor_id == sensor_id)
                .all()
            )

        return [{
            "id": alarm.id,
            "building_id": alarm.building_id,
            "sensor_id": alarm.sensor_id,
            "name": alarm.name,
            "upper_threshold": alarm.upper_threshold,
            "lower_threshold": alarm.lower_threshold,
            "floor_id": alarm.floor_id,
            "last_updated": alarm.last_updated,
            "status": alarm.status
        } for alarm in alarms]



    def db_read_alarms_building_id(self, building_id):
        with self.db_session() as session:
            alarms = (
                session.query(
                    Alarms.id,
                    Alarms.building_id,
                    Alarms.sensor_id,
                    Alarms.name,
                    Alarms.upper_threshold,
                    Alarms.lower_threshold,
                    Alarms.floor_id,
                    Alarms.last_updated,
                    Alarms.status
                )
                .filter(Alarms.building_id == building_id)
                .all()
            )

        return [{
            "id": alarm.id,
            "building_id": alarm.building_id,
            "sensor_id": alarm.sensor_id,
            "name": alarm.name,
            "upper_threshold": alarm.upper_threshold,
            "lower_threshold": alarm.lower_threshold,
            "floor_id": alarm.floor_id,
            "last_updated": alarm.last_updated,
            "status": alarm.status
        } for alarm in alarms]


    def db_add_alarm(self, building_id, sensor_id, name, upper_threshold, lower_threshold, floor_id):
        with self.db_session() as session:
            new_alarm = Alarms( 
                building_id=building_id,
                sensor_id=sensor_id,
                name=name,
                upper_threshold=upper_threshold,
                lower_threshold=lower_threshold,
                floor_id=floor_id,
                last_updated=datetime.utcnow()
            )
            session.add(new_alarm)
            session.commit()
            return new_alarm.id  

    def db_get_alarm_by_id(self, id):
        with self.db_session() as session:
            alarm = (
                session.query(
                    Alarms.building_id,
                    Alarms.sensor_id,
                    Alarms.name,
                    Alarms.upper_threshold,
                    Alarms.lower_threshold,
                    Alarms.status,
                    Alarms.last_updated,
                    Alarms.floor_id
                )
                .filter(Alarms.id == id)
                .first()
            )

        if alarm:
            return {
                "building_id": alarm.building_id,
                "sensor_id": alarm.sensor_id,
                "name": alarm.name,
                "upper_treshold": alarm.upper_treshold,
                "lower_treshold": alarm.lower_treshold,
                "status": alarm.status,
                "last_updated": alarm.last_updated,
                "floor_id": alarm.floor_id
            }
        return None

    def db_update_alarm(self, id, building_id=None, sensor_id=None, name=None, upper_threshold=None, lower_threshold=None, floor_id=None):
        with self.db_session() as session:
            alarm = session.query(Alarms).filter_by(id=id).first()
        
            if not alarm:
                return 'not_found'
        
            if building_id is not None:
                alarm.building_id = building_id
            if sensor_id is not None:
                alarm.sensor_id = sensor_id
            if name is not None:
                alarm.name = name
            if upper_threshold is not None:
                alarm.upper_threshold = upper_threshold
            if lower_threshold is not None:
                alarm.lower_threshold = lower_threshold
            if floor_id is not None:
                alarm.floor_id = floor_id

            alarm.last_updated = datetime.utcnow()
        
            session.commit()
            return 'Update successful'

            


    def db_delete_alarm(self, id):
        with self.db_session() as session:
            alarm = session.query(Alarms).filter_by(id=id).first()
        
            if alarm is None:
                return 'not_found'
        
            session.delete(alarm)
            session.commit()
            return 'Alarm deleted'



    def db_clear_alarm_heimdall_memory(self, id):
        with self.db_session() as session:
            alarm = session.query(Alarms).filter_by(id=id).first()

            if not alarm:
                return 'Alarm not_found'

            alarm.status = False
            alarm.last_updated = datetime.utcnow()
            session.commit()

            return 'Clear successful'


    def db_set_alarm_heimdall_memory(self, id):
        with self.db_session() as session:
            alarm = session.query(Alarms).filter_by(id=id).first()
        
            if not alarm:
                return 'Alarm not found'

            alarm.status = True
            alarm.last_updated = datetime.utcnow()
            session.commit()

            return 'Alarm set successfully'


    def db_clear_building_alarms_heimdall_memory(self, building_id):
        with self.db_session() as session:
            alarms = session.query(Alarms).filter_by(building_id=building_id).all()

            if not alarms:
                return 'No alarms found for this building'

            for alarm in alarms:
                alarm.status = False
                alarm.last_updated = datetime.utcnow()

            session.commit()
            return 'Building alarms cleared successfully'


def get_db_connector() -> MYSQL_DB_CLIENT:
    global db_connector
    if db_connector is None:
        print("Connecting to MySQL Database. Looks like a new connection")
        db_connector = MYSQL_DB_CLIENT()
        #db_connector.db_connect()
    
    return db_connector

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(*args, **kwargs)

    return decorated
