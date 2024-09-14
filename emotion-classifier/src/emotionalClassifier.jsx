import React, { useState } from "react";
import emotionalWords from "./emotionalWords";  // Import the expanded dataset
import { stemmer } from 'stemmer';

const normalize = (word) => stemmer(word.toLowerCase());

const EmotionClassifier = () => {
  const [sentence, setSentence] = useState("");

  // Function to handle user input
  const handleInputChange = (e) => {
      setSentence(e.target.value);
  };

  // Check for trigger words and analyze the context
  const handleSubmit = () => {
      checkForDangerContext(sentence);
  };

  function checkForDangerContext(sentence) {
      const words = sentence.split(' ').map(normalize);
      let triggerCount = 0;

      // Trigger detection logic
      Object.keys(emotionalWords).forEach(category => {
          words.forEach(word => {
              if (emotionalWords[category].has(word)) {
                  triggerCount++;
              }
          });
      });

      // If two or more trigger words are found, analyze the context
      if (triggerCount > 0) {
          alert("Are you safe?");
      } 
      analyzeContext(sentence);
  }

  async function analyzeContext(sentence) {
      try {
          const response = await fetch('http://localhost:5000/analyze', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ sentence })
          });

          const result = await response.json();
          if (result.context === 'UNSAFE') {
              alert('UNSAFE: The context of the sentence indicates potential danger.');
          } else {
              alert('SAFE: The context does not indicate immediate danger.');
          }
      } catch (error) {
          console.error('Error analyzing context:', error);
      }
  }

  return (
      <div>
          <h1>Danger Context Detection</h1>
          <input 
              type="text" 
              value={sentence} 
              onChange={handleInputChange} 
              placeholder="Enter a sentence..." 
          />
          <button onClick={handleSubmit}>Analyze</button>
      </div>
  );
};

export default EmotionClassifier;
