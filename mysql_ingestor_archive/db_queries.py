# TODO Implement Elastic Cache for RDS 
# TODO Implement RDS proxy
# TODO Secure credentials. Use IAM role based authentication


class DB_QUERIES:
    def __init__(self) -> None:
        pass

    def read_table (self, table_name, condition) -> str:
        query = f'''
                SELECT * from {table_name}
                where {condition}
                '''
        return query

    def insert_table(self, table_name, type_id, floor_id, sensor_name, sensor_value) -> str:
        query = f'''
                INSERT INTO {table_name} (type_id, floor_id, sensor_name, sensor_value, last_updated) 
                VALUES ({type_id}, {floor_id}, {sensor_name}, {sensor_value}, NOW())
                '''
        return query

    def update_table(self, table_name, type_id, floor_id, sensor_name, sensor_value) -> str:
        query = f'''
                UPDATE {table_name} 
                SET  sensor_value = {sensor_value} 
                WHERE sensor_name = {sensor_name} AND floor_id = {floor_id} AND type_id = {type_id}
                '''
        
