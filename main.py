
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello, World!'

import os

api_key = os.getenv('API_KEY')
if not api_key:
    raise ValueError('API_KEY environment variable is not set')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
