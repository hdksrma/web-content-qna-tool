const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { OpenAI } = require('langchain/llms/openai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory storage for scraped content
const urlContentMap = new Map();
let vectorStore = null;

// Initialize OpenAI models
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  modelName: 'gpt-3.5-turbo',
});

// Function to scrape content from a URL
async function scrapeUrl(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Remove script tags, style tags, and non-content elements
    $('script, style, nav, footer, header').remove();
    
    // Extract text content
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    return text;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    throw new Error(`Failed to scrape ${url}: ${error.message}`);
  }
}

// Endpoint to scrape and store URLs
app.post('/api/ingest', async (req, res) => {
  const { urls } = req.body;
  
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of URLs' });
  }
  
  try {
    // Clear previous data
    urlContentMap.clear();
    
    // Scrape each URL
    const scrapingPromises = urls.map(async (url) => {
      const content = await scrapeUrl(url);
      urlContentMap.set(url, content);
      return { url, contentLength: content.length };
    });
    
    const results = await Promise.all(scrapingPromises);
    
    // Combine all content for vectorization
    const allContent = Array.from(urlContentMap.values()).join(' ');
    
    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const docs = await textSplitter.createDocuments([allContent]);
    
    // Create vector store from documents
    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    
    res.json({
      message: 'URLs ingested successfully',
      results,
    });
  } catch (error) {
    console.error('Ingestion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to answer questions
app.post('/api/query', async (req, res) => {
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Please provide a question' });
  }
  
  if (!vectorStore) {
    return res.status(400).json({ error: 'No content has been ingested. Please ingest URLs first.' });
  }
  
  try {
    // Retrieve relevant documents
    const relevantDocs = await vectorStore.similaritySearch(question, 5);
    
    // Combine relevant text chunks
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
    
    // Construct prompt
    const prompt = `
      You are a helpful assistant that answers questions based ONLY on the provided information.
      If the information needed to answer the question is not contained in the provided context, 
      respond with "I don't have enough information to answer this question based on the ingested content."
      Do not use prior knowledge.
      
      Context information:
      ${context}
      
      Question: ${question}
      
      Answer:
    `;
    
    // Get answer from OpenAI
    const response = await model.call(prompt);
    
    res.json({
      answer: response.trim(),
      sourceCount: relevantDocs.length,
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});