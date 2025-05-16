import React, { useEffect, useContext } from 'react'
import '../App.css';
import { GoogleGenAI } from "@google/genai";
import { marked } from "marked";
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { PulseLoader } from 'react-spinners';
import UserContext from '../UserContext';
import { toast } from 'react-toastify';

const LearningPage = () => {
const api = import.meta.env.VITE_API_GOOGLE_GENAI
const ai = new GoogleGenAI({ apiKey: api });
const {toastMessage} = useContext(UserContext);
const [question, setQuestion] = useState(null);
const [chatQuestion, setChatQuestion] = useState(null);
const [topic, setTopic] = useState(null);
const [response, setResponse] = useState(null);
const [chatResponse, setChatResponse] = useState(null);
const [responseLoading, setResponseLoading] = useState(false);
const [chatResponseLoading, setChatResponseLoading] = useState(false);
const [topicsLoading, setTopicsLoading] = useState(false);
const [formattedResponse, setFormattedResponse] = useState(null);

const [suggestedTopics, setSuggestedTopics] = useState([]);


async function askQuestion(q) {
  if (q) {
    setResponseLoading(true);
    setChatResponse(null);
    setChatQuestion("");
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      temperature: 0.2,
      contents: "DO NOT ANSWER ANY QUESTIONS UNRELATED TO FINANCE. Question:" + q + " : provide a detailed answer (as if explained to a unknowledged person) based on the question, but not too long and directly answer the question. Provide a large title with different heading, categorize info under sections. Add a disclaimer at the end.",
    });
    console.log(response.text);
    setResponse(response.text);
    
    const markedFormat = formatMarkdown(response.text);
    setFormattedResponse(markedFormat);
    setResponseLoading(false);
  }
}

async function askChat(chatQuestion) {
  if (!chatQuestion) {
    toastMessage("Please enter a question", "warning");
    return;
  }

  setChatResponseLoading(true);

  try {
    const chatResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `DO NOT ANSWER ANY QUESTIONS UNRELATED TO FINANCE. Based on the following response: "${response}", answer the follow-up question: "${chatQuestion}". Provide a clear answer.`,
    });

    console.log("Chat Response:", chatResponse.text);
    setChatResponse(chatResponse.text); // Update the response with the chat response
    
  } catch (error) {
    console.error("Error in askChat:", error);
    toastMessage("Error fetching chat response", "error");
  } finally {
    setChatResponseLoading(false);
  }
}

async function fetchSuggestedTopics(topics) {
  setTopicsLoading(true);
  let q;
  if (topics) {
    q = "keywords: " + topics
  } else {q = "suggested finance"}
  
  console.log("Fetching suggested topics for:", q);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Generate a list of 10 " + q + " topics with titles and descriptions. The response should be in JSON format, with each topic containing a 'title' and a 'description'. Do not include any additional text outside the JSON object. name of JSON is finance_topics",
    });

    console.log("Raw API Response:", response.text);

    // Manually clean and format the response
    let cleanedResponse = response.text.trim(); // Remove leading/trailing whitespace

    // Find the start and end of the JSON object
    const jsonStartIndex = cleanedResponse.indexOf("{");
    const jsonEndIndex = cleanedResponse.lastIndexOf("}");

    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      cleanedResponse = cleanedResponse.slice(jsonStartIndex, jsonEndIndex + 1); // Extract the JSON object
    } else {
      throw new Error("Invalid JSON format in API response.");
    }
    
    // Parse the cleaned JSON
    console.log("Parsed Topics:", cleanedResponse);
    const topics = JSON.parse(cleanedResponse);


    setSuggestedTopics(topics.finance_topics); 

    // // Ensure topics is an array
    // if (Array.isArray(topics)) {
    //   setTopicsLoading(false);
    // } else if (topics.finance_topics && Array.isArray(topics.finance_topics)) {
      
    // } else {  
    //   throw new Error("Invalid JSON structure: Expected an array.");
    // }
    setTopicsLoading(false);
    
  } catch (error) {
    console.error("Error fetching or parsing suggested topics:", error);
    setTopicsLoading(false);
    // fetchSuggestedTopics();
  }
}

useEffect(() => {
  fetchSuggestedTopics();
}, []);

function formatMarkdown(markdownText) {
  const html = marked(markdownText, { gfm: true });
  return html;
}

function askSuggestedQuestion(q) {
  setQuestion(q);
  askQuestion(q);
}


return (
    <div className='flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white stagger-container'>
        <div className="flex flex-col items-center w-full h-100 p-10">
          <div className='text-5xl'>Learn About Finance</div>
          <div className='flex flex-row justify-around items-center '>
            <input
              className="border-2 border-gray-500 rounded-xl m-1 p-1 w-150 my-5 scale-on-hover"
              type="text"
              name="search"
              value={question}
              placeholder="Ask a Question"
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button className='bg-gray-600 rounded-3xl w-20 h-8 ml-3 scale-on-hover' onClick={() => askQuestion(question)}>Ask</button>
          </div>

          {(responseLoading || response) && (
            <div className='flex flex-row h-150 mb-10 fade-in'>
              <div className='flex-nowrap overflow-auto no-scrollbar bg-gray-700 rounded-l-2xl p-4 mb-10 w-full h-full min-w-50 max-w-200'>
              
                <>
                  {!responseLoading && response && (
                    <>
                      {/* <div
                      className="markdown-body prose prose-lg max-w-250"
                      dangerouslySetInnerHTML={{ __html: formattedResponse }}
                      /> */}
                      <div className="prose prose-lg prose-invert max-w-none stagger-container">
                        <ReactMarkdown>{response}</ReactMarkdown>
                      </div>
                    </>
                  )}
                  
                  <PulseLoader 
                    className='my-2 fade-in'
                    color="white"
                    loading={responseLoading}
                    size={15}
                  />
                </>
      
              </div>
              <div className='flex flex-col w-80 min-w-80 h-full bg-gray-700 rounded-r-2xl'>
                <div className='flex justify-center items-center h-20'>
                  <p className='text-xl'>Chat</p>
                </div>
                <div className='flex-nowrap overflow-auto no-scrollbar bg-gray-600 p-3 h-full'>
                  <>
                    {!chatResponseLoading && response && (
                      <div className='stagger-container'>
                        <ReactMarkdown>{chatResponse}</ReactMarkdown>
                      </div>
                    )}
                    <PulseLoader 
                      className='my-2 fade-in'
                      color="white"
                      loading={chatResponseLoading}
                      size={15}
                    />
                  </>

                </div>
                <div className='flex flex-row justify-center items-center h-30'>
                  <input
                    className="border-2 border-gray-500 rounded-xl m-1 p-1 w-auto my-5 h-10 scale-on-hover"
                    type="text"
                    name="search"
                    value={chatQuestion}
                    placeholder="Ask a Question"
                    onChange={(e) => setChatQuestion(e.target.value)}
                  />
                  <button className='bg-gray-600 rounded-3xl w-20 h-8 ml-1 scale-on-hover' onClick={() => askChat(chatQuestion)}>Ask</button>
                </div>
              </div>
            </div>
          )}

          <div className='text-3xl mb-5'>Suggested Topics</div>
          <div className='flex flex-col bg-gray-700 w-170 h-auto rounded-3xl mb-5 p-5 stagger-container'>
            <div className='flex flex-row items-center'>
              <input
                className="border-2 border-gray-500 rounded-xl m-1 p-1 w-150 my-5 scale-on-hover"
                type="text"
                name="search"
                value={topic}
                placeholder="Search for a Topic"
                onChange={(e) => setTopic(e.target.value)}
              />
              <button className='bg-gray-600 rounded-3xl w-20 h-8 ml-3 scale-on-hover' onClick={() => fetchSuggestedTopics(topic)}>Generate</button>
            </div>

            <PulseLoader 
              className='my-2 fade-in'
              color="white"
              loading={topicsLoading}
              size={15}
            />
            {!topicsLoading && suggestedTopics.length == 0 && (<button className='bg-gray-600 rounded-3xl w-40 h-8' onClick={() => fetchSuggestedTopics()}>Fetch Topics</button>)}
            {!topicsLoading && suggestedTopics.map((topic, index) => (
              <div>
                <div
                  key={index}
                  className='flex flex-col bg-gray-600 rounded-xl p-4 mb-2 scale-on-hover'
                  onClick={() => askSuggestedQuestion(topic.title + " : " + topic.description)}
                >
                  <div className='text-xl font-bold mb-2'>{topic.title}</div>
                  <div className='text-md'>{topic.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* <div className='text-3xl mb-5'>Suggested Topics</div>
          <div className='flex flex-col bg-gray-700  w-170 h-100 max-h-100 rounded-3xl mb-5 p-5'>
            <div className='text-3xl mb-2'>Title</div>
            <div className='flex flew-grow overflow-auto text-xl'>Description Description Description Description Description </div>
            <div className=''></div>
          </div> */}
        </div>
      </div>
  )
}

export default LearningPage