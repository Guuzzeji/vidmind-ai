# code taken from: https://stackoverflow.com/questions/9896644/getting-ffprobe-information-with-python

import json
import subprocess
from typing import NamedTuple


class FFProbeResult(NamedTuple):
    return_code: int
    json: dict
    error: str


def ffprobe(file_path: str) -> FFProbeResult:
    command_array = ["ffprobe",
                     "-v", "quiet",
                     "-print_format", "json",
                     "-show_format",
                     "-show_streams",
                     file_path]

    result = subprocess.run(command_array,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            universal_newlines=True)

    # print(json.loads(result.stdout))

    return FFProbeResult(return_code=result.returncode,
                         json=json.loads(result.stdout),
                         error=result.stderr)
