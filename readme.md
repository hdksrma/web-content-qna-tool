# Web Content Q&A Tool

A web-based tool that allows users to ingest content from URLs and ask questions based on that content.

## Features

- URL content ingestion
- Question answering based on ingested content
- Clean and responsive UI

## Technologies Used

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **NLP**: LangChain, OpenAI

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PORT=5000
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter one or more URLs (one per line) in the text area
2. Click "Ingest URLs" to process the content
3. Once ingestion is complete, enter a question in the input field
4. Click "Ask Question" to get an answer based on the ingested content

## Limitations

- The tool only answers questions based on the ingested content
- Some websites may block web scraping attempts
- Large websites may take longer to process

## Architecture

The application follows a client-server architecture:

- **Frontend**: A React application that provides the user interface
- **Backend**: An Express server that handles content scraping and Q&A functionality
- **Vector Database**: In-memory vector storage for efficient retrieval of relevant content

## How It Works

1. **Content Ingestion**:
   - The backend scrapes content from the provided URLs using Cheerio
   - The content is processed, cleaned, and split into chunks
   - Chunks are converted to vector embeddings and stored in memory

2. **Question Answering**:
   - When a question is asked, the backend uses similarity search to find relevant content chunks
   - A prompt is constructed with the relevant content and the question
   - The LLM generates an answer based only on the provided content

## Deployment

For quick deployment:

- **Backend**: Deploy to Render, Heroku, or any Node.js hosting service
- **Frontend**: Deploy to Vercel, Netlify, or any static site hosting service

Make sure to set the appropriate environment variables on your deployment platform.

## Future Improvements

- Add source citation for answers
- Support for authentication and user-specific content libraries
- Improved error handling and retry mechanisms for URL scraping
- Support for more content types (PDFs, docs, etc.)