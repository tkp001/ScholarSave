import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import csv from "csvtojson";
import { GoogleGenAI } from "@google/genai";

const ImportTransactions = () => {
  const [parsedData, setParsedData] = useState([]); // State to store parsed CSV data
  const api = import.meta.env.VITE_API_GOOGLE_GENAI;
  const ai = new GoogleGenAI({ apiKey: api });
  const [response, setResponse] = useState(null); // State to store AI response

    async function AIEnhance(q) {
        if (q) {
            const response = await ai.models.generateContent({
              model: "gemini-2.0-flash",
              temperature: 0.2,
              contents: "present this data in JSON format, title is data: " + q,
            });
            console.log(response.text);
            setResponse(response.text);
          }
    }
  
  const onDrop = (acceptedFiles) => {
    const csvFiles = acceptedFiles.filter((file) => file.type === "text/csv" || file.name.endsWith(".csv"));

    if (csvFiles.length === 0) {
      alert("Please upload a valid CSV file.");
      return;
    }

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
    <div>
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
          <p>Drag 'n' drop a CSV file here, or click to select one</p>
        )}
      </div>

      {parsedData.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Parsed Data:</h3>
          <ul>
            {parsedData.map((row, index) => (
              <li key={index}>
                {JSON.stringify(row)} {/* Display each row as a JSON string */}
              </li>
            ))}
          </ul>
        </div>
        
      )}
      {response && (
            <div>{response}</div>
        )}
        
    </div>
  );
};

export default ImportTransactions;