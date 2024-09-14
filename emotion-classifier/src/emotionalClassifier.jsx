import React, { useState } from "react";
import emotionalWords from "./emotionalWords";  // Import the expanded dataset

const EmotionClassifier = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState({
    harasser: [], 
    victim: [], 
    manipulation: [], 
    defense: [], 
    fear: [], 
    anger: [], 
    legal: [],
    abuse: [],
    combination: []
  });

  // Split text into sentences and words
  const getSentences = (text) => text.match(/[^.!?]+[.!?]?/g)?.map(s => s.trim()) || [];
  const getWords = (text) => text.toLowerCase().split(/\s+/);

  const classifyEmotions = (text) => {
    const detectedEmotions = {
      harasser: [], victim: [], manipulation: [], defense: [], fear: [], anger: [], legal: [], abuse: [], combination: []
    };

    const words = getWords(text);
    const sentences = getSentences(text);

    // Check individual words/phrases
    words.forEach(word => {
      for (let category in emotionalWords) {
        emotionalWords[category].forEach(phrase => {
          if (word.includes(phrase.toLowerCase())) {
            detectedEmotions[category].push(phrase);
          }
        });
      }
    });

    // Check for phrases within sentences
    sentences.forEach((sentence, index) => {
      for (let category in emotionalWords) {
        emotionalWords[category].forEach(phrase => {
          if (sentence.includes(phrase)) {
            detectedEmotions[category].push(phrase);
          }
        });
      }
      // Combine adjacent sentences to find mixed phrases
      if (index < sentences.length - 1) {
        const combined = sentence + " " + sentences[index + 1];
        for (let category in emotionalWords) {
          emotionalWords[category].forEach(phrase => {
            if (combined.includes(phrase)) {
              detectedEmotions.combination.push(phrase);
            }
          });
        }
      }
    });

    setResult(detectedEmotions);
  };

  const handleChange = (e) => {
    const inputText = e.target.value;
    setText(inputText);
    classifyEmotions(inputText);
  };

  return (
    <div>
      <h1>Emotion Classifier</h1>
      <textarea 
        value={text} 
        onChange={handleChange} 
        rows="5" 
        placeholder="Type a sentence here..."
      />
      <h3>Detected Emotions:</h3>
      <div><strong>Harasser:</strong> {result.harasser.join(", ") || "None"}</div>
      <div><strong>Victim:</strong> {result.victim.join(", ") || "None"}</div>
      <div><strong>Manipulation:</strong> {result.manipulation.join(", ") || "None"}</div>
      <div><strong>Defense:</strong> {result.defense.join(", ") || "None"}</div>
      <div><strong>Fear:</strong> {result.fear.join(", ") || "None"}</div>
      <div><strong>Anger:</strong> {result.anger.join(", ") || "None"}</div>
      <div><strong>Legal:</strong> {result.legal.join(", ") || "None"}</div>
      <div><strong>Abuse:</strong> {result.abuse.join(", ") || "None"}</div>
      <div><strong>Combination Detected:</strong> {result.combination.join(", ") || "None"}</div>
    </div>
  );
};

export default EmotionClassifier;
