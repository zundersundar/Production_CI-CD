from functools import wraps
from flask import jsonify, Response
from marshmallow import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime


def response_validation(schema_class):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                result = func(*args, **kwargs)

                if isinstance(result, tuple):
                    response_data, status_code = result
                else:
                    response_data, status_code = result, 200

                if isinstance(response_data, Response):
                    response_data.status_code = status_code
                    return response_data

                schema_class.dump(response_data)

                return jsonify(response_data), status_code

            except ValidationError as err:
                return jsonify({"message": "Invalid response data", "errors": err.messages}), 400
            except Exception as e:
                print(f"Exception occurred: {e}")  
                return jsonify({"message": "An error occurred", "error": str(e)}), 500

        return wrapper
    return decorator


def error_handling(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValidationError as err:
            return jsonify({'message': 'Invalid Arguments', 'errors': err.messages}), 400
        except SQLAlchemyError as e:
            print(f"SQLAlchemyError: {e}")
            return jsonify({'message': 'Database error occurred'}), 500
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return jsonify({'message': 'An internal error occurred.'}), 500
    return wrapper
