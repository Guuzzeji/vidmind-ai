-- From: https://medium.com/@johannes.ocean/setting-up-a-postgres-database-with-the-pgvector-extension-10ab7ff212cc
-- UUID FROM: https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-uuid/
-- Create the extension if not exists

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Metadata table
CREATE TABLE IF NOT EXISTS video_metadata (
    id uuid PRIMARY KEY,
    title TEXT,
    numberOfClips INT
);

-- Create S3 Store table
CREATE TABLE IF NOT EXISTS s3_files_audio (
    videoId uuid NOT NULL,
    clipId INT,
    s3AudioUrl TEXT,
    PRIMARY KEY(videoId, clipId),
    FOREIGN KEY(videoId) REFERENCES video_metadata(id)
);

CREATE TABLE IF NOT EXISTS s3_files_frame (
    videoId uuid NOT NULL,
    clipId INT,
    frameID INT,
    imgUrl TEXT,
    PRIMARY KEY(videoId, clipId, frameID),
    FOREIGN KEY(videoId) REFERENCES video_metadata(id)
);

-- Embed for frames / video
CREATE TABLE IF NOT EXISTS frame_embeds (
    videoId uuid NOT NULL,
    clipId INT,
    frameId INT,
    embedding vector,
    rawText TEXT,
    startTime FLOAT,
    endTime FLOAT,
    PRIMARY KEY(videoId, clipId, frameID),
    FOREIGN KEY(videoId) REFERENCES video_metadata(id),
    FOREIGN KEY(videoId, clipId, frameID) REFERENCES s3_files_frame(videoId, clipId, frameID)
);

-- Embed for audio
CREATE TABLE IF NOT EXISTS audio_embeds (
    videoId uuid NOT NULL,
    clipId INT,
    embedding vector,
    rawText TEXT,
    startTime FLOAT,
    endTime FLOAT,
    PRIMARY KEY(videoId, clipId),
    FOREIGN KEY(videoId) REFERENCES video_metadata(id),
    FOREIGN KEY(videoId, clipId) REFERENCES s3_files_audio(videoId, clipId)
);