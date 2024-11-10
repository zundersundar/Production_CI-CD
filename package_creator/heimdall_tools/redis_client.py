# redis_client.py - Shared module for initializing Redis connection pool

import redis

# Function to get Redis connection from the pool
def get_redis_connection(host_name, port=6379, db=0):
    # Initialize Redis connection pool (shared across services)
    redis_pool = redis.ConnectionPool(host=host_name, port=port, db=db)
    return redis.StrictRedis(connection_pool=redis_pool)

# Function to set a key with expiry in Redis
def set_with_expiry(redis_instance, key, value, expiry_time):
    """
    Set a key-value pair in Redis with an expiration time.
    
    :param redis_instance: Redis connection object
    :param key: Key to set in Redis
    :param value: Value to set for the key
    :param expiry_time: Expiry time in seconds
    """
    # Set the value with an expiration time (TTL)
    redis_instance.setex(name=key, time=expiry_time, value=value)

# Function to get a value from Redis
def get_from_cache(redis_instance, key):
    """
    Get a value from Redis cache by key.
    
    :param redis_instance: Redis connection object
    :param key: Key to retrieve from Redis
    :return: Value associated with the key or None if the key doesn't exist
    """
    return redis_instance.get(key)
