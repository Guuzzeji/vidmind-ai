# AI Video Analyzer System

LLM (large language model) + VLM (visual language model) Video Analyzer System is a system I develop to see if it is possible to recreate a AI system that can fully understand hour long videos. It is base heavy off of these two research papers I found on Arxiv. This project is kind of point less since OpenAI new model GPT-4o will have video processing support and seems more faster then Google Gemini model when it comes to video processing and analysis.

**Papers:**

* MM-VID: Advancing Video Understanding with GPT-4V(ision) : https://arxiv.org/abs/2310.19773
* MM-REACT: Prompting ChatGPT for Multimodal Reasoning and Action: https://arxiv.org/abs/2303.11381
* Multimodal prompting with a 44-minute movie | Gemini 1.5 Pro Demo : https://youtu.be/wa0MT8OwHuk?si=ySvZBe81Zr3a4Q3z

The goal of this project was to see if I could recreate the ideas found in theses paper and also have a tool that allows me to quickly search through long form lecture videos to help aid in note taking and studying.

This project is primary powered use OpenAI GPT-4 model

>![NOTE]
>As of now this project is kind of out of date, since OpenAI just release the GPT-4o model, I'm currently working on getting that working can see this in the roadmap secetion.

The average cost to run this model is kind of expensive since we are doing a lot of calls to GPT-4, but there is currently a solutuon to limt that cost. The average cost for a hour long video is about $3 to $5. Additionaly the processing time for a long video is about 7 minutes on average.  

### Features & Screenshots

**Features that are currentlty impimemented:**

* Frontend UI that allows for uploading of videos & chatting between different videos, similar to ChatGPT interface
* Functionaly ChatAPI that access a vector database when creating responese from a video
* Video processing and embedding done by OpenAI
* Queuing done my Redis + Bull to handle multiply video processing jobs

**Screenshots of Interface:**

## Roadmap & Future Ideas

**Todo list of features:**

- [ ] Need to implement Batch API, which will allow for bigger video inputs and 50% cost cut This will make video processing time take lonerg more then the 7 minutes average, however, this will save on cost by 50% and allow for less rate limitng errors.
  - [ ] Expand out frame processing to be 150 video chinks instead of 50 video chunks
  - [ ] Use batching API for video processing
  - [ ] Use batching API for embedding job
  
- [ ] Use new GPT-4o model for video porcessing of frames from a video

- [ ] Cleanup ChatAPI to be more friendly to use and allow other to use the API for there own projects

**Todo list of experimental ideas:**

- [ ] Rewite prompts to see if we can gain improve GPT responese 
- [ ] Try using GPT-4 for ChatAPI
- [ ] Try converting system to use open source models 
- [ ] Abstract microserivces to call a custom AI serivce that allows the how system to not care which AI model is being used, allowing for more flexble with the use of open source and other AI models.
- [ ] Figure out a better development expereinece 

## How to Run Project

### Requirements

You must have docker install on your machine in order to run this project

### Steps to Run Project

1. Clone repo and change directior into it

```sh
git clone [this repo]
cd ai-video-analyzer-system
```

2. cd into `db` folder and create the following `.env` file

```txt
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_HOST_AUTH_METHOD=trust

MINIO_ROOT_USER=your_username

IMPORTANT: pwd should be at least 8 char long for minio to work properly
MINIO_ROOT_PASSWORD=your_password 
```

We will need to crete a .env and store the password to it so we can access through our other serivces that need the database stuff.

3. Now run the following command to have docker run the databases

```sh
docker-compose --env-file .env up 
```

This will run a Postgress Databse and Minio S3 bucket, along with Redis, for you.

4. Now we need to setup our S3 bucket to accept requests made to it

Open up your web browser and go to `localhost:9001` and use the same password and username you create in the `.env` file store in the `db` folder under MINIO. Now that you are long in there should only be one bucket called `video-files`, can on the setting icon and then go to create access key. Please save that key somewhere safe or just rememeber it since we will need it later.

If you need more help setting up minio go to https://min.io/docs/minio/container/index.html 

5. Now we can start running our micro-serivces. The first one we are going to run is the Butcher

change directories back to the root of the project and then cd into `Butcher` and create the following `.env` file:

```txt
S3_KEY=the_minio_key_from_before
S3_PWD=the_minio_pwd_from_before
```

Then run the following docker compose command:

```sh
docker-compose -f ./prod.docker-compose.yml --env-file .env up 
```

This will run the Butcher serivce on port 3030

6. Next one we are going to run is the Embedder

change directories back to the root of the project and then cd into `Embedder` and create the following `.env` file:

```txt
OPENAI_API_KEY=your_openai_key
DB_USER=username_used_when_creating_db
DB_PWD=pwd_used_when_creating_db
```

Then run the following docker compose command:

```sh
docker-compose -f ./prod.docker-compose.yml --env-file .env up 
```

This will run the Butcher Embedder on port 4040

7. Next one we are going to run is the ChatAPI

change directories back to the root of the project and then cd into `ChatAPI` and create the following `.env` file:

```txt
OPENAI_API_KEY=your_openai_key
DB_USER=username_used_when_creating_db
DB_PWD=pwd_used_when_creating_db
```

Then run the following docker compose command:

```sh
docker-compose -f ./prod.docker-compose.yml --env-file .env up 
```

This will run the ChatAPI serivce on port 5050

8. Next one we are going to run is the Frontend

change directories back to the root of the project and then cd into `Frontend`.

Then run the following docker compose command:

```sh
docker-compose -f ./prod.docker-compose.yml up 
```

This will run the Frontend serivce on port 8080

9. Next one we are going to run is the Nginx Proxy to connect everything together

change directories back to the root of the project and then cd into `proxy`.

Then run the following docker compose command:

```sh
docker-compose up 
```

This will run the proxy serivce on port 80

10. Now you are all setup! (I know it a lot, will try to fix this)

Now you can go into your web browser type in `localhost` and start playing around with the project

## Running in Development

Follow the same steps as in How to Run Project, but instead of doing `docker-compose -f prod.docker-compose.yml` do `docker-compose -f dev.docker-compose.yml` and make sure to add `--watch` at the end of command so docker watches for any file changes. Also make sure you delete and running docker image and compose groups before doing so, since the dev container use the same name as the production ones to help save on having to rewrite stuff.