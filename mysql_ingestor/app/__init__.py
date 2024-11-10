from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()
import os
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from app.utils import MYSQL_DB_CLIENT
from app import routes
import os
db_client = MYSQL_DB_CLIENT()
#db_client.db_connect()

migrate = Migrate()
ma = Marshmallow()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db_client = MYSQL_DB_CLIENT()
    migrate = Migrate()
    ma = Marshmallow()

    # Initialize SQLAlchemy with the existing engine
    app.config['SQLALCHEMY_DATABASE_URI'] = db_client.engine.url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # Configuring SQLAlchemy with connection pooling
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_size': 10,  # Size of the pool to be maintained
        'max_overflow': 20,  # Number of overflow connections allowed
        'pool_timeout': 30,  # Timeout for getting a connection from the pool
        'pool_recycle': 1800  # Recycle connections after 1800 seconds (30 minutes)
    }

    app.config['CUSTOMER_LOGO_UPLOAD_FOLDER'] = os.path.join(app.root_path, '..', 'assets', 'customer_logo')    
    app.config['FLOOR_PLAN_UPLOAD_FOLDER'] = os.path.join(app.root_path, '..', 'assets', 'floor_plan')

    
    # Initialize CORS with open policy
    # TODO This enables CORS for all routes in the app. Make it more secure
    CORS(app)


    db.init_app(app)

    migrate.init_app(app, db)
    ma.init_app(app)

    app.register_blueprint(routes.bp)

    SWAGGER_URL = '/api-docs'  # URL where Swagger UI will be available
    API_URL = '/static/main.yaml'  
  

    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={  
            'app_name': "MySQL Ingestor API"
        }
    )

    # Register Swagger blueprint
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    return app