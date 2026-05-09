# Letscode

A real-time collaborative coding platform built for developers to code together seamlessly.

## Overview

Letscode is a real-time code collaboration platform that enables multiple developers to work on the same code editor simultaneously. It combines live editing, secure authentication, collaborative sessions to create a smooth developer experience.

The platform is designed with a modern full-stack architecture using:

- **Frontend**: Next.js
- **Backend**: Express.js with TypeScrit
- **Database**: PostgreSQL
- **ORM**: Prisma ORM

## Project Structure

```bash
letscode/
├── client/                 # Next.js frontend
├── server/                 # Express backend
├── .env
├── docker-compose.yml
├── README.md
```

## Installation

### 1. Environment Variables

Create `.env` file by copying keys from `.env.example` in root, `client` and `server`. The `.env.example` file will have the details on how to get the values for the keys.

### 2. Clone the Repository

```bash
git clone https://github.com/Centinoughty/letscode.git # for https based cloning
```

or

```bash
git clone git@github.com:Centinoughty/letscode.git # for ssh based cloning
```

### 3. Install dependancies

#### a. Docker based (recommended)

This will create the image which are needed for running our application.

```bash
docker compose build
```

#### b. Native installation

Server

```bash
cd server
npm install
```

Client

```bash
cd client
npm install
```

You need to create a postgres DB natively using psql

#### c. Database Setup

Run prisma migrations

```bash
cd server
npx prisma migrate dev --name init
```

Generate prisma client

```bash
npx prisma generate
```

### 4. Running the application

#### a. Docker (recommended)

Start all services

```bash
docker compose up -d --build
```

Run in detached mode

```bash
docker compose up -d
```

To see the logs,

```bash
docker compose logs
```

Stop services

```bash
docker compose down
```

#### b. Native

Server

```bash
cd server
npm run dev
```

Client

```bash
npm run dev
```
