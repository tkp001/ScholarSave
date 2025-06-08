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
const [selectedSection, setSelectedSection] = useState('main');

  /**
   * Ask a finance-related question and get a structured AI response.
   * Updates the response state with parsed JSON from the AI.
   * @param {string} q - The finance question to ask.
   */
  async function askQuestion(q) {
    if (q) {
      setResponseLoading(true);
      setSelectedSection('main');
      setChatResponse(null);
      setChatQuestion("");
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          temperature: 0.2,
          contents: `
          DO NOT ANSWER ANY QUESTIONS UNRELATED TO FINANCE.
          Question: ${q}
          Respond ONLY in JSON format with the following structure:
          {
            "main": "A detailed answer to the question, explained simply.",
            "definitions": "A list or paragraph of key definitions relevant to the question.",
            "summary": "A short summary of the main answer.",
            "links_resources": ["A list of 5-10 reputable links or resources for further reading."]
            "examples": ["A list of 5-10 examples relevant to the question."],
            "related_topics": ["A list of 5-10 related topics for further exploration."],
            "case_studies": ["A list of 5-10 case studies or real-world examples that illustrate the topic."],
            "applications": ["A list of 5-10 practical applications or uses of the topic in real life."],
            "future_outlook": ["A list of 5-10 current trends or developments/predictions related to the topic.],
          }
          Do not include any text outside the JSON object. Name of JSON is response.
          Use github markdown.
          `,
        });
        // Try to extract and parse JSON from the response
        let cleaned = response.text.trim();
        const jsonStart = cleaned.indexOf("{");
        const jsonEnd = cleaned.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
        }
        const parsed = JSON.parse(cleaned);
        console.log("Parsed Response:", parsed);
        setResponse(parsed);
      } catch (err) {
        console.error("Error getting response:", err);
        toastMessage("Error fetching response. Please try again.", "error");
      }
      setResponseLoading(false);
    }
  }

  const sectionLabels = {
    main: "Main",
    definitions: "Definitions",
    summary: "Summary",
    links_resources: "Links & Resources",
    examples: "Examples",
    related_topics: "Related Topics",
    case_studies: "Case Studies",
    applications: "Applications",
    future_outlook: "Future Outlook"
  };

  /**
   * Ask a follow-up chat question based on the main AI response.
   * Updates the chatResponse state with the AI's answer.
   * @param {string} chatQuestion - The follow-up question to ask.
   */
  async function askChat(chatQuestion) {
    if (!chatQuestion) {
      toastMessage("Please enter a question", "warning");
      return;
    }

    setChatResponseLoading(true);

    try {
      const chatResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `DO NOT ANSWER ANY QUESTIONS UNRELATED TO FINANCE. Based on the following response: "${JSON.stringify(response)}", answer the follow-up question: "${chatQuestion}". Provide a clear answer.`,
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

  /**
   * Fetch a list of suggested finance topics from the AI.
   * Updates the suggestedTopics state with parsed topics.
   * @param {string} [topics] - Optional keywords to filter suggested topics.
   */
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
      console.error("Error fetching suggested topics:", error);
      toastMessage("Error fetching suggested topics. Please try again.", "error");
      setTopicsLoading(false);
      // fetchSuggestedTopics();
    }
  }

  /**
   * Fetch suggested topics when the component mounts.
   */
  useEffect(() => {
    fetchSuggestedTopics();
  }, []);

  /**
   * Ask a suggested question (from the topics list) and update the main question/response.
   * @param {string} q - The suggested question to ask.
   */
  function askSuggestedQuestion(q) {
    setQuestion(q);
    askQuestion(q);
  }


return (
    <div className='flex flex-grow flex-nowrap overflow-auto no-scrollbar bg-gray-800 text-white stagger-container'>
        <div className="flex flex-col items-center w-full h-full p-10">
          <div className='text-5xl'>Learn About Finance</div>
          <div className='flex flex-row justify-around items-center '>
            <input
              className="border-2 border-gray-500 rounded-xl m-1 p-1 w-150 my-5 scale-on-hover"
              type="text"
              name="search"
              value={question}
              placeholder="Ask a Question"
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') askQuestion(question); }}
            />
            <button className='bg-gray-600 rounded-3xl w-20 h-8 ml-3 scale-on-hover' onClick={() => askQuestion(question)}>Ask</button>
          </div>
          <div className='italic text-sm font-bold my-2'>Disclaimer: AI is not a financial advisor.</div>

          {(responseLoading || response) && (
            <div className='flex flex-row w-5/6 min-w-5/6 min-h-5/6 mb-10 fade-in'>
              <div className="flex flex-col bg-gray-700 rounded-2xl p-4 mr-2 min-w-40">
                {!responseLoading && response && (
                  <div className="flex flex-col flex-grow p-1 overflow-auto ">
                    {/* Dynamic render options to select */}
                    {Object.keys(response).map((key) => (
                      <button
                        key={key}
                        className={`mb-2 p-2 rounded scale-on-hover ${selectedSection === key ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-200'}`}
                        onClick={() => setSelectedSection(key)}
                      >
                        {sectionLabels[key] || key}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className='flex-nowrap overflow-auto no-scrollbar bg-gray-700 rounded-l-2xl p-4 mb-10 w-full h-full min-w-50'>
                <>
                  {!responseLoading && response && (
                    <div
                      key={selectedSection}
                      className="prose prose-lg prose-invert max-w-none fade-in"
                    >
                      {selectedSection && response[selectedSection] && (
                        Array.isArray(response[selectedSection]) ? (
                          <ul>
                            {response[selectedSection].map((item, idx) => (
                              <li key={idx}>
                                <ReactMarkdown>{item}</ReactMarkdown>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ReactMarkdown>{response[selectedSection]}</ReactMarkdown>
                        )
                      )}
                    </div>
                  )}
                  
                  <PulseLoader 
                    className='my-2 fade-in'
                    color="white"
                    loading={responseLoading}
                    size={15}
                  />
                </>
      
              </div>
              <div className='flex flex-col w-75 min-w-75 h-full bg-gray-700 rounded-r-2xl'>
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
                    onKeyDown={e => { if (e.key === 'Enter') askChat(chatQuestion); }}
                  />
                  <button className='bg-gray-600 rounded-3xl w-20 h-8 ml-1 scale-on-hover' onClick={() => askChat(chatQuestion)}>Ask</button>
                </div>
              </div>
            </div>
          )}

          <div className='flex flex-col bg-gray-700 w-170 h-auto rounded-3xl mb-5 p-5 stagger-container'>
            <div className='flex flex-row items-center'>
              <input
                className="border-2 border-gray-500 rounded-xl m-1 p-1 w-150 my-5 scale-on-hover"
                type="text"
                name="search"
                value={topic}
                placeholder="Search for a Topic"
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') fetchSuggestedTopics(topic); }}
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