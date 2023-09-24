from flask import Flask, request
from flask_cors import CORS
from pymongo.mongo_client import MongoClient

from auth import auth, createAccount, verifyToken
from user_info import getInfo, answer, joinGroup, getGroups, createGroup
import dotenv
dotenv.load_dotenv()
dotEnvValues = dotenv.dotenv_values()

app = Flask(__name__)
cors = CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

uri = dotEnvValues.get('MONGO_URI')
# Create a new client and connect to the server
client = MongoClient(uri)
client = client.get_database('FriendNewsletter')

@app.route("/")
def hello_world():
  return "Hello, World!"

@app.route("/signin", methods=['POST'])
def signin():
  data = request.get_json()
  email = data.get('email')
  password = data.get('password')
  if (not email or not password):
    return {
      'status': 'error',
      'message': 'Email or password is empty'
    }
  info = auth(email, password, client)
  status = 200 if (info.get('status') == 'success') else 400
  return info, status

@app.route("/signup", methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    if (not email or not password or not first_name or not last_name):
        return ({
        'status': 'error',
        'message': 'Email, password, first name or last name is empty'
        }, 400)
    info = createAccount(email, password, first_name, last_name, client)
    status = 200 if (info.get('status') == 'success') else 400
    return info, status

@app.route("/verify", methods=['POST'])
def verify():
    data = request.get_json()
    email = data.get('email')
    token = data.get('token')
    if (not email or not token):
        return ({
        'status': 'error',
        'message': 'Email or token is empty'
        }, 400)
    info = verifyToken(email, token, client)
    status = 200 if (info.get('status') == 'success') else 400
    return info, status

@app.route("/user", methods=['POST'])
def user():
    data = request.get_json()
    email = data.get('email')
    token = data.get('token')
    if (not email or not token):
        return ({
        'status': 'error',
        'message': 'Email or token is empty'
        }, 400)
    info = getInfo(email, token, client)
    status = 200 if (info.get('status') == 'success') else 400
    return info, status

@app.route("/answer", methods=['POST'])
def answerUpdate():
    data = request.get_json()
    email = data.get('email')
    token = data.get('token')
    if (not email or not token):
        return ({
        'status': 'error',
        'message': 'Email or token is empty'
        }, 400)
    userAnswer = data.get('answer')
    questionIdx = data.get('question')
    if (not userAnswer or (not questionIdx) and questionIdx != 0):
        return ({
        'status': 'error',
        'message': 'Answer or question index is empty'
        }, 400)
    info = answer(email, token, questionIdx, userAnswer, client)
    status = 200 if (info.get('status') == 'success') else 400
    return info, status

@app.route("/getGroups", methods=['POST'])
def getUserGroups():
    data = request.get_json()
    email = data.get('email')
    token = data.get('token')
    if (not email or not token):
        return ({
        'status': 'error',
        'message': 'Email or token is empty'
        }, 400)
    info = getGroups(email, token, client)
    status = 200 if (info.get('status') == 'success') else 400
    return info, status

@app.route("/joinGroup", methods=['POST'])
def joinNewGroup():
    data = request.get_json()
    email = data.get('email')
    token = data.get('token')
    if (not email or not token):
        return ({
        'status': 'error',
        'message': 'Email or token is empty'
        }, 400)
    groupPassword = data.get('groupPassword')
    groupName = data.get('groupName')
    info = joinGroup(email, token, groupName, groupPassword, client)
    status = 200 if (info.get('status') == 'success') else 400
    return info, status

@app.route("/createGroup", methods=['POST'])
def createNewGroup():
    data = request.get_json()
    email = data.get('email')
    token = data.get('token')
    if (not email or not token):
        return ({
        'status': 'error',
        'message': 'Email or token is empty'
        }, 400)
    groupPassword = data.get('groupPassword')
    groupName = data.get('groupName')
    info = createGroup(email, token, groupName, groupPassword, client)
    status = 200 if (info.get('status') == 'success') else 400
    return info, status


if __name__ == "__main__":
  app.run(debug=True)