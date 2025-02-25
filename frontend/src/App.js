import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = 'http://localhost:5000';

function App() {
  const [urls, setUrls] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIngested, setIsIngested] = useState(false);
  const [ingestedUrls, setIngestedUrls] = useState([]);

  const handleIngest = async () => {
    if (!urls.trim()) {
      setStatus('Please enter at least one URL');
      return;
    }
    
    setIsLoading(true);
    setStatus('Ingesting URLs...');
    
    try {
      // Split URLs by newline and filter out empty strings
      const urlList = urls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);
      
      // Validate URLs
      const validUrls = urlList.filter(url => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });
      
      if (validUrls.length === 0) {
        setStatus('No valid URLs provided');
        setIsLoading(false);
        return;
      }
      
      const response = await axios.post(`${BACKEND_URL}/api/ingest`, {
        urls: validUrls,
      });
      
      setStatus(`Success! Ingested ${validUrls.length} URLs`);
      setIsIngested(true);
      setIngestedUrls(validUrls);
    } catch (error) {
      setStatus(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!question.trim()) {
      setStatus('Please enter a question');
      return;
    }
    
    if (!isIngested) {
      setStatus('Please ingest URLs first');
      return;
    }
    
    setIsLoading(true);
    setStatus('Querying...');
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/query`, {
        question,
      });
      
      setAnswer(response.data.answer);
      setStatus('Query completed');
    } catch (error) {
      setStatus(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-center mb-6">Web Content Q&A Tool</h1>
            </div>
            
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="urls">
                    Enter URLs (one per line):
                  </label>
                  <textarea 
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    id="urls" 
                    rows="5"
                    value={urls}
                    onChange={(e) => setUrls(e.target.value)}
                    placeholder="https://example.com"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="text-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                    onClick={handleIngest}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Ingest URLs'}
                  </button>
                </div>
                
                {isIngested && (
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-2">Ask a Question</h2>
                    <div className="mb-4">
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="question"
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="What does this website talk about?"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="text-center">
                      <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                        onClick={handleQuery}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Ask Question'}
                      </button>
                    </div>
                  </div>
                )}
                
                {status && (
                  <div className="mt-4 p-2 bg-gray-100 rounded">
                    <p className="text-sm">{status}</p>
                  </div>
                )}
                
                {ingestedUrls.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold">Ingested URLs:</h3>
                    <ul className="list-disc pl-5 text-sm">
                      {ingestedUrls.map((url, index) => (
                        <li key={index} className="truncate">{url}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {answer && (
                  <div className="mt-8 p-4 bg-gray-100 rounded">
                    <h3 className="text-lg font-semibold mb-2">Answer:</h3>
                    <p>{answer}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;