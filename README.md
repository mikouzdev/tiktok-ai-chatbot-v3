<img src="https://github.com/mikouzdev/tiktok-ai-chatbot-v3/blob/main/header.png" alt="Header Image" width="600" />

# TikTok AI Chatbot V3

A web application that integrates with TikTok live sessions, allowing viewers to interact with an AI chatbot during the live stream. The chatbot responds to comments using OpenAI's ChatGPT and Text-to-Speech API.

## Features

- Real-time interaction with an AI chatbot during a TikTok live session.
- Text-to-Speech capability for audible responses.
- Comment queue system that allows deleting of queued comments. (Route: `/moderation`)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/mikouzdev/tiktok-ai-chatbot-v3
cd .\tiktok-ai-chatbot-v3\
```

2. Install dependencies for the frontend and backend:

```bash
# Frontend
cd .\client\
npm install

# Backend
cd ..\server\
npm install
```

## Configuration

1. Rename `.env.template` to `.env` in the root directory.
2. Set up the required environment variables in the `.env` file.

The prompts and other ChatGPT parameters, can be found at `server/src/gptHandler.ts`.

## Usage

1. Start the React.js frontend:

```bash
cd client
npm start
```

2. Start the Node.js backend:

```bash
cd .\server\
tsc
node .\dist\server.js
```
