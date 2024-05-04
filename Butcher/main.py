from src.router.api import app
import config
import os
import shutil

import logging

logging.basicConfig(format='%(asctime)s - %(message)s',
                    datefmt='%d-%b-%y %H:%M:%S')
logging.getLogger().setLevel(logging.DEBUG)

if __name__ == '__main__':
    logging.info("Running Server -- "
                 + "Host:" + config.HOST
                 + "Port:" + config.PORT)
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
