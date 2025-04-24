import React, { useEffect } from 'react'
import { GoogleGenAI } from "@google/genai";
import { marked } from "marked";
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';


const LearningPage = () => {
const api = import.meta.env.VITE_API_GOOGLE_GENAI
const ai = new GoogleGenAI({ apiKey: api });
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
      contents: q + " : provide a detailed answer, but not too long and directly answer the question. Also provide a large title with different heading, categorize info under sections and draw a image using text. Provide main website links for more information. Add a disclaimer.",
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
    alert("Please enter a follow-up question.");
    return;
  }

  setChatResponseLoading(true);

  try {
    const chatResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Based on the following response: "${response}", answer the follow-up question: "${chatQuestion}". Provide a clear answer.`,
    });

    console.log("Chat Response:", chatResponse.text);
    setChatResponse(chatResponse.text); // Update the response with the chat response
    
  } catch (error) {
    console.error("Error in askChat:", error);
    alert("An error occurred while processing your chat question.");
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

    // Ensure topics is an array
    if (Array.isArray(topics)) {
      setTopicsLoading(false);
    } else if (topics.finance_topics && Array.isArray(topics.finance_topics)) {
      setSuggestedTopics(topics.finance_topics); 
    } else {  
      throw new Error("Invalid JSON structure: Expected an array.");
    }
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
    <div className='flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white'>
        <div className="flex flex-col items-center w-full h-100 p-10">
          <div className='text-5xl'>Learn About Finance</div>
          <div className='flex flex-row justify-around items-center '>
            <input
              className="border-2 border-gray-500 rounded-xl m-1 p-1 w-150 my-5"
              type="text"
              name="search"
              value={question}
              placeholder="Ask a Question"
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button className='bg-gray-600 rounded-3xl w-20 h-8 ml-3' onClick={() => askQuestion(question)}>Ask</button>
          </div>

          {(responseLoading || response) && (
            <div className='flex flex-row w-230 h-180 mb-10'>
              <div className='flex-nowrap overflow-auto no-scrollbar bg-gray-700 rounded-l-2xl p-4 mb-10 w-150 h-full'>
              
              {responseLoading ? (
                  <div className='text-2xl'>Loading...</div>
                ) : (
                  <>
                    {response && (
                      <>
                        {/* <div
                          className="markdown-body prose prose-lg max-w-250"
                          dangerouslySetInnerHTML={{ __html: formattedResponse }}
                        /> */}
                        <ReactMarkdown>{response}</ReactMarkdown>
                      </>
                    )}
                  </>
                )}
              </div>
              <div className='flex flex-col w-80 h-full bg-gray-700 rounded-r-2xl'>
                <div className='flex justify-center items-center h-20'>
                  <p className='text-xl'>Chat</p>
                </div>
                <div className='flex-nowrap overflow-auto no-scrollbar bg-gray-600 p-3 h-full'>
                  {chatResponseLoading ? (
                    <div className='text-2xl'>Loading...</div>
                  ) : (
                    <>
                      {response && (
                        <>
                          <ReactMarkdown>{chatResponse}</ReactMarkdown>
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className='flex flex-row justify-center items-center h-30'>
                  <input
                    className="border-2 border-gray-500 rounded-xl m-1 p-1 w-50 my-5 h-10"
                    type="text"
                    name="search"
                    value={chatQuestion}
                    placeholder="Ask a Question"
                    onChange={(e) => setChatQuestion(e.target.value)}
                  />
                  <button className='bg-gray-600 rounded-3xl w-20 h-8 ml-1' onClick={() => askChat(chatQuestion)}>Ask</button>
                </div>
              </div>
            </div>
          )}

          <div className='text-3xl mb-5'>Suggested Topics</div>
          <div className='flex flex-col bg-gray-700 w-170 h-auto rounded-3xl mb-5 p-5'>
            <div className='flex flex-row items-center'>
              <input
                className="border-2 border-gray-500 rounded-xl m-1 p-1 w-150 my-5"
                type="text"
                name="search"
                value={topic}
                placeholder="Search for a Topic"
                onChange={(e) => setTopic(e.target.value)}
              />
              <button className='bg-gray-600 rounded-3xl w-20 h-8 ml-3' onClick={() => fetchSuggestedTopics(topic)}>Generate</button>
            </div>

            {topicsLoading && (<div className='text-2xl'>Loading...</div>)}
            {!topicsLoading && suggestedTopics.length == 0 && (<button className='bg-gray-600 rounded-3xl w-40 h-8' onClick={() => fetchSuggestedTopics()}>Fetch Topics</button>)}
            {!topicsLoading && suggestedTopics.map((topic, index) => (
              <div
                key={index}
                className='flex flex-col bg-gray-600 rounded-xl p-4 mb-4'
                onClick={() => askSuggestedQuestion(topic.title + " : " + topic.description)}
              >
                <div className='text-2xl font-bold mb-2'>{topic.title}</div>
                <div className='text-lg'>{topic.description}</div>
              </div>
            ))}
          </div>

          {/* <div className='text-3xl mb-5'>Suggested Topics</div>
          <div className='flex flex-col bg-gray-700  w-170 h-100 max-h-100 rounded-3xl mb-5 p-5'>
            <div className='text-3xl mb-2'>Title</div>
            <div className='flex flew-grow overflow-auto text-xl'>Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description </div>
            <div className=''></div>
          </div> */}
        </div>
      </div>
  )
}

export default LearningPage