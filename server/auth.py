import datetime
from pymongo import database
import random

from auth_helpers import renew_token, check_password, get_hash_password

def auth(username: str, password: str, mongodb: database.Database):
    users = mongodb.get_collection('users').find_one({'email': username})
    if (not users):
        return {
            'status': 'error',
            'message': 'User not found'
        }
    if (not check_password(password, users['password'])):
        return {
            'status': 'error',
            'message': 'Wrong password'
        }
    new_token = renew_token(username, mongodb)
    return {
        'status': 'success',
        'message': 'Login success',
        'token': new_token
    }


def createAccount(username: str, password: str, first_name: str, last_name: str, mongodb: database.Database):
    users = mongodb.get_collection('users').find_one({'email': username})
    if (users):
        return {
            'status': 'error',
            'message': 'User already exists'
        }
    hashed_password = get_hash_password(password)
    mongodb.get_collection('users').insert_one({
        'email': username,
        'password': hashed_password,
        'first_name': first_name,
        'last_name': last_name,
        'groups': [],
        'answers': ['' for _ in range(6)],
    })
    new_token = renew_token(username, mongodb)
    return {
        'status': 'success',
        'message': 'Account created',
        'token': new_token
    }

def verifyToken(email: str, token: str, db: database.Database):
    users = db.get_collection('users').find_one({'email': email})
    if (not users):
        return {
            'status': 'error',
            'message': 'User not found'
        }
    if (users['hash'] != token):
        return {
            'status': 'error',
            'message': 'Wrong token'
        }
    if (users['hash_expires'] < datetime.datetime.now()):
        return {
            'status': 'error',
            'message': 'Token expired'
        }
    return {
        'status': 'success',
        'message': 'Token verified',
        'token': renew_token(email, db)
    }