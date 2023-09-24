import datetime
import random
import bcrypt
from pymongo import database

def renew_token(email: str, mongodb: database.Database) -> int:
    hash = random.getrandbits(128)
    hash = str(hash)
    # save hash to database, with time limit of 72 hours from now
    mongodb.get_collection('users').update_one({'email': email}, {'$set': {'hash': hash, 'hash_expires': datetime.datetime.now() + datetime.timedelta(hours=72)}})
    return hash

def get_hash_password(password: str):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def check_password(password: str, hash_password: str):
    return bcrypt.checkpw(password.encode('utf-8'), hash_password)