# Request Outline

> Note: should use context trpc to get userID and user infomation to make life easier

## /generate
- Action: Query
- Generates one a single result base on the video context. Without any history or context regarding chat logs

**Input design**
```json
{
    "videoID": "uuid string here",
    "prompt": "prompt goes here"
}
```

**Output design**
```json
{
    "videoID": "uuid string here",
    "answer": "answer goes here",
    "contextFromVideo" [
        {
            "clipID" : 0,
            "citeNum" : 0
        }
    ]
}
```

## /searchForContext
- Action: Query
- Generates a list video context that can be used to search for clips.

**Input design**
```json
{
    "videoID": "uuid string here",
    "prompt": "prompt goes here"
}
```

**Output design**
```json
{
    "videoID": "uuid string here",
    "contextFromVideo" [
        {
            "clipID" : 0,
            "citeNum" : 0
        }
    ]
}
```

## /chat
- Action: Query
- Generates one a single result base on the video context and chat logs.

**Input design**
```json
{
    "videoID": "uuid string here",
    "chatHistory": [
        ""
        ... // Max 50 logs of all messages made with chat, excuding command messages
    ],
    "prompt": "prompt goes here"
}
```

**Output design**
```json
{
    "videoID": "uuid string here",
    "answer": "answer goes here",
    "contextFromVideo" [
        {
            "clipID" : 0,
            "citeNum" : 0
        }
    ]
}
```