from flask import Flask
import config_env

from src.router.api import API

import logging
logging.basicConfig(format='%(asctime)s - %(message)s', datefmt='%d-%b-%y %H:%M:%S')
logging.getLogger().setLevel(logging.DEBUG)

app = Flask(__name__)
app.register_blueprint(API)

if __name__ == '__main__':
    logging.info("Running Server -- "+ "Host:" + config_env.HOST+ ":" + config_env.PORT)
    app.run(host=config_env.HOST, port=config_env.PORT, debug=config_env.DEBUG)
