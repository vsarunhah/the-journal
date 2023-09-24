import datetime
from pymongo import database

from auth import verifyToken

def getInfo(email: str, token: str, client: database.Database):
    tokenVerification = verifyToken(email, token, client)
    if (tokenVerification.get('status') == 'error'):
        return {
            'status': 'error',
            'message': 'Wrong token'
        }
    token = tokenVerification.get('token')
    user = client.get_collection('users').find_one({'email': email}, {'_id': 0, 'password': 0, 'hash': 0, 'hash_expires': 0, 'groups': 0})
    date = f"{datetime.datetime.now().month:02d}" + "/" + str(datetime.datetime.now().year)
    questions = client.get_collection('questions').find_one({'date': date})
    return {
        'status': 'success',
        'message': 'User info',
        'token': token,
        'user': {
            'email': user['email'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'answers': user['answers'],
        },
        'questions': questions.get('questions'),
        'answers': user['answers']
    }

def answer(email: str, token: str, questionIdx: int, answer: str,  db: database.Database, picture = None):
    tokenVerification = verifyToken(email, token, db)
    if (tokenVerification.get('status') == 'error'):
        return {
            'status': 'error',
            'message': 'Wrong token'
        }
    ret = db.get_collection('users').update_one({'email': email}, {'$set': {f'answers.{questionIdx}': answer}})
    token = tokenVerification.get('token')
    if (not ret.acknowledged):
        return {
            'status': 'error',
            'message': 'Failed to update answer',
            'token': token
        }
    return {
        'status': 'success',
        'message': 'Answer updated',
        'token': token
    }

def getGroups(email: str, token: str, db: database.Database):
    tokenVerification = verifyToken(email, token, db)
    if (tokenVerification.get('status') == 'error'):
        return {
            'status': 'error',
            'message': 'Wrong token'
        }
    user_info = db.get_collection('users').find_one({'email': email}, {'groups': 1})
    if (not user_info):
        return {
            'status': 'error',
            'message': 'Failed to get user info',
            'token': tokenVerification.get('token'),
        }
    groups = db.get_collection('groups').find({'_id': {'$in': user_info['groups']}}, {'_id': 0})
    if (not groups):
        return {
            'status': 'error',
            'message': 'Failed to get groups',
            'token': tokenVerification.get('token'),
        }
    return {
        'status': 'success',
        'message': 'Groups',
        'groups': list(groups),
        'token': tokenVerification.get('token')
    }

def joinGroup(email: str, token: str, groupName: str, groupPassword: str, db: database.Database):
    tokenVerification = verifyToken(email, token, db)
    if (tokenVerification.get('status') == 'error'):
        return {
            'status': 'error',
            'message': 'Wrong token',
            'token': tokenVerification.get('token'),        
        }
    user_info = db.get_collection('users').find_one({'email': email}, {'groups': 1})
    if (not user_info):
        return {
            'status': 'error',
            'message': 'Failed to get user info',
            'token': tokenVerification.get('token'),
        }
    group_info = db.get_collection('groups').find_one({'password': groupPassword, 'name': groupName}, {'_id': 1})
    if (not group_info):
        return {
            'status': 'error',
            'message': 'Wrong password',
            'token': tokenVerification.get('token'),
        }
    if (db.get_collection('users')).find_one({'email': email, 'groups': group_info['_id']}):
        return {
            'status': 'error',
            'message': 'Already joined group',
            'token': tokenVerification.get('token'),
        }
    ret = db.get_collection('users').update_one({'email': email}, {'$push': {'groups': group_info['_id']}})
    if (not ret.acknowledged):
        return {
            'status': 'error',
            'message': 'Failed to join group',
            'token': tokenVerification.get('token'),
        }
    return {
        'status': 'success',
        'message': 'Joined group',
        'token': tokenVerification.get('token')
    }

def createGroup(email: str, token: str, groupName: str, groupPassword: str, db: database.Database):
    tokenVerification = verifyToken(email, token, db)
    if (tokenVerification.get('status') == 'error'):
        return {
            'status': 'error',
            'message': 'Wrong token'
        }
    groupExists = db.get_collection('groups').find_one({'name': groupName})
    if (groupExists):
        return {
            'status': 'error',
            'message': 'Group already exists',
            'token': tokenVerification.get('token'),
        }
    group_info = db.get_collection('groups').insert_one({'name': groupName, 'password': groupPassword})
    if (not group_info.acknowledged):
        return {
            'status': 'error',
            'message': 'Failed to create group',
            'token': tokenVerification.get('token'),
        }
    ret = db.get_collection('users').update_one({'email': email}, {'$push': {'groups': group_info.inserted_id}})
    if (not ret.acknowledged):
        return {
            'status': 'error',
            'message': 'Failed to join group',
            'token': tokenVerification.get('token'),
        }
    return {
        'status': 'success',
        'message': 'Created group',
        'token': tokenVerification.get('token')
    }