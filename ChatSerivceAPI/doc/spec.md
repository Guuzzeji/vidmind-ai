# Request Outline

> Note: should use context trpc to get userID and user infomation to make life easier

## /search
- Action: Post
- Generates a list video context that can be used to search for clips.

**Input design**
```json
{
    "searchFor": "image" || "imgtext" || "audiotext",
    "searchBy": "image" || "text",
    "videoID": "uuid string",
    "query": "text",
    "imgBase64": "text"
}
```

**Output design**

Audio Search
```json
{
    "videoID": "uuid string here",
    "audio" [
        {
            "clipId" : 0,
            "starttime": 0.00,
            "endtime" : 0.00,
            "rawText" : "text"
        }
    ]
}
```

Image Text Search
```json
{
    "videoID": "uuid string here",
    "frames" [
        {
            "clipId" : 0,
            "frameId" : 0,
            "starttime": 0.00,
            "endtime" : 0.00,
            "rawText" : "text"
        }
    ]
}
```

Image Search
```json
{
    "videoID": "uuid string here",
    "frames" [
        {
            "clipId" : 0,
            "frameId" : 0,
            "starttime": 0.00,
            "endtime" : 0.00,
            "imgurl" : "text"
        }
    ]
}
```

## /generate & chat
- Action: Post
- Generates one a single result base on the video context and chat logs.
- Can also generate base on not chat logs

**Input design**
```json
{
    "videoID": "uuid string",
    "type": "text" || "img",
    "chatHistory": [
        "text",
        "text"
        ... // Max 50 logs of all messages made with chat, excuding command messages
    ],
    "prompt": "text",
    "imgBase64": "text"
}
```

**Output design**
```json
{
    "videoID": "uuid string",
    "answer": "text",
    "moditfyPrompt" : "text"
    "context": {
        "frames": [
        {
            "clipId" : 0,
            "frameId" : 0,
            "starttime": 0.00,
            "endtime" : 0.00,
            "rawText" : "text"
        }],
        "audio": [
        {
            "clipId" : 0,
            "starttime": 0.00,
            "endtime" : 0.00,
            "rawText" : "text"
        }
    ]
    }
}
```