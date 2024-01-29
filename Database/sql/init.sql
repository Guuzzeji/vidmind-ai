-- From: https://medium.com/@johannes.ocean/setting-up-a-postgres-database-with-the-pgvector-extension-10ab7ff212cc
-- Create the database
-- CREATE DATABASE VIDEO_INFORMATION;
-- -- Connect to the database
-- \ c VIDEO_INFORMATION;
-- Create the extension if not exists
CREATE EXTENSION IF NOT EXISTS vector;
-- Create Metadata table
CREATE TABLE IF NOT EXISTS METADATA (
    id SERIAL PRIMARY KEY,
    title TEXT,
    numberOfClips INT
);
-- Create S3 Store table
CREATE TABLE IF NOT EXISTS S3_FILES (
    id SERIAL,
    s3AudioUrl TEXT,
    s3FramesUrl TEXT,
    clipId INT
);
-- Embed for frames / video
CREATE TABLE IF NOT EXISTS FRAME_EMBED (
    id SERIAL,
    embedding vector,
    rawText TEXT,
    clipId INT
);
-- Embed for audio
CREATE TABLE IF NOT EXISTS AUDIO_EMBED (
    id SERIAL,
    embedding vector,
    rawText TEXT,
    clipId INT
);