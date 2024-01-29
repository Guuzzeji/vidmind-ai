import os
import shutil
import config
from api import app

path_to_workdir = os.path.join(config.CURRENT_PATH, config.WORKING_DIR)
if os.path.exists(path_to_workdir):
    shutil.rmtree(path_to_workdir)

os.mkdir(path_to_workdir)

if __name__ == '__main__':
    app.run(host=config.HOST, port=config.PORT, debug=True)
