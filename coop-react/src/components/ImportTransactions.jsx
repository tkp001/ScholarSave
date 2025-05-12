import React, { useState } from "react";
import "../App.css";
import { useDropzone } from "react-dropzone";
import csv from "csvtojson";
import { GoogleGenAI } from "@google/genai";
import { Timestamp } from "firebase/firestore"; // Import Timestamp from Firestore

const ImportTransactions = ({importCorrectedTransactions}) => {
  const [parsedData, setParsedData] = useState([]); // State to store parsed CSV data
  const api = import.meta.env.VITE_API_GOOGLE_GENAI;
  const ai = new GoogleGenAI({ apiKey: api });
  const [response, setResponse] = useState(null); // State to store AI response
  const [responseData, setResponseData] = useState(null); // State to store AI response data

    function acceptTransactions() {
        importCorrectedTransactions(responseData);
        setResponse(null);
        setParsedData([]);
        setResponseData(null);
        console.log("Accepted Transactions:", responseData);
    }

    async function AIEnhance(q) {
      if (q) {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          temperature: 0.2,
          contents:
            "present the data: " +
            q +
            " in JSON format, include the headings (Name, Date in YY-MM-DD, Category, Amount), all headings are lowercase. Do not include any additional text outside the JSON object. name of JSON is data",
        });
    
        // Manually clean and format the response
        let cleanedResponse = response.text.trim(); // Remove leading/trailing whitespace
    
        // Find the start and end of the JSON object
        const jsonStartIndex = cleanedResponse.indexOf("{");
        const jsonEndIndex = cleanedResponse.lastIndexOf("}");
    
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
          cleanedResponse = cleanedResponse.slice(
            jsonStartIndex,
            jsonEndIndex + 1
          ); // Extract the JSON object
        } else {
          throw new Error("Invalid JSON format in API response.");
        }
    
        // Parse the cleaned JSON
        const parsedResponse = JSON.parse(cleanedResponse);
    
        // Add fullDate to each transaction
        const transactionsWithFullDate = parsedResponse.data.map((transaction) => {
          const [year, month, day] = transaction.date.split("-").map(Number);
          const fullYear = year < 100 ? 2000 + year : year; // Handle 2-digit year (e.g., 25 -> 2025)
          const localDate = new Date(fullYear, month - 1, day); // Month is 0-indexed
            
          const fullDate = Timestamp.fromDate(localDate); 
          
          return {
            ...transaction,
            fullDate: fullDate.toDate(),
          };
        });
    
        // Update the state with the processed transactions
        setResponse(transactionsWithFullDate);
        setResponseData({ data: transactionsWithFullDate });
    
        console.log("Transactions with Full Date:", transactionsWithFullDate);
      }
    }
  
  const onDrop = (acceptedFiles) => {
    const csvFiles = acceptedFiles.filter((file) => file.type === "text/csv" || file.name.endsWith(".csv"));

    if (csvFiles.length === 0) {
      alert("Please upload a valid CSV file.");
      return;
    }
    setParsedData([]); 
    setResponse(null);

    const file = csvFiles[0]; // Process the first valid CSV file
    const reader = new FileReader();

    reader.onload = async (event) => {
      const csvString = event.target.result;

      try {
        const jsonArray = await csv().fromString(csvString); // Parse CSV into JSON
        setParsedData(jsonArray); // Store the parsed data in state
        AIEnhance(JSON.stringify(jsonArray));
      } catch (error) {
        console.error("Error parsing CSV:", error);
        alert("Failed to parse the CSV file.");
      }
    };

    reader.readAsText(file); // Read the file as text
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"], // Map MIME type to file extension
    },
  });

  return (
    <div className="bg-gray-700 my-2 p-3 rounded-3xl stagger-container">
      <div className="text-lg mb-2">Import Transactions</div>
      
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p className="scale-on-hover">Drag 'n' drop a CSV file here, or click to select one</p>
        )}
      </div>

      {parsedData.length > 0 && (
        <>
          <h3 className="text-lg my-2 bg-gray-500 rounded-xl p-1">Parsed Data:</h3>
          <div className="mt-4 max-h-50 overflow-auto">
            <ul>
              {parsedData.map((row, index) => (
                <li key={index}>
                  {JSON.stringify(row)}
                </li>
              ))}
            </ul>
          </div>
        </>  
      )}
      
      {!response && parsedData.length > 0 && (
        <div className="text-lg my-2 bg-yellow-500 rounded-xl p-1">Correcting Data..</div>
      )}

      {response && (
        <>
          <div className="text-lg my-2 bg-gray-500 rounded-xl p-1">AI Corrected Data</div>
          {/* <div className="mt-4 max-h-50 overflow-auto">
            <ul>
              {response.map((transaction, index) => (
                <li key={index}>
                  <strong>Name:</strong> {transaction.name}, 
                  <strong>Date:</strong> {transaction.date}, 
                  <strong>Category:</strong> {transaction.category}, 
                  <strong>Amount:</strong> {transaction.amount}, 
                  <strong>Full Date:</strong> {transaction.fullDate}
                </li>
              ))}
            </ul>
          </div> */}
        </>
      )}

      {response && (
        <div className="mt-4 max-h-50 overflow-auto">
          <ul>
            {(() => {
              try {
                return responseData.data.map((transaction, index) => (
                  <li key={index}>
                    <strong>Name:</strong> {transaction.name}, <strong>Date:</strong> {transaction.date}, <strong>Category:</strong> {transaction.category}, <strong>Amount:</strong> {transaction.amount}
                  </li>
                ));
              } catch (error) {
                console.error("Error parsing AI response:", error);
                return <li>Error displaying AI response.</li>;
              }
            })()}
          </ul>
        </div>
      )}

      {response && (
        <>
          <div className="text-lg my-2 bg-green-500 rounded-xl p-1">Transaction Preview</div>
          <div className="flex flex-row p-1">
            <div className="w-100">Name</div>
            <div className="w-40">Date</div>
            <div className="w-60">Category</div>
            <div>Amount</div>
          </div>
          <div className="flex flex-nowrap overflow-auto no-scrollbar items-center">
            <div className="flex flex-col w-full h-60 stagger-container">
              {responseData.data.map((transaction, index) => (
                  <div className="flex flex-row justify-left w-full bg-gray-600 rounded-xl m-1 p-2">
                      <div className='flex flex-row w-full'>
                        <div className="w-100">{transaction.name}</div>
                        <div className="w-40">{transaction.date}</div>
                        <div className="w-60">{transaction.category}</div>
                        <div className='w-15'>${transaction.amount}</div>
                      </div>
                  </div>
              ))}
            </div>
          </div>
          <div>
            <button className="bg-green-600 rounded-3xl w-20 h-8 my-3 scale-on-hover" onClick={acceptTransactions}>Accept</button>
          </div>
        </> 
      )}
        
    </div>
  );
};

export default ImportTransactions;