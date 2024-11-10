import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'you-will-never-guess')
    CUSTOMER_LOGO_UPLOAD_FOLDER = os.getenv('CUSTOMER_LOGO_UPLOAD_FOLDER', 'mysql_ingestor/assets/customer_logo')

    FLOOR_PLAN_UPLOAD_FOLDER = os.getenv('FLOOR_PLAN_UPLOAD_FOLDER', 'mysql_ingestor/assets/floor_plan')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))
   

