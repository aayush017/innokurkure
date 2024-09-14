import React, { useState } from "react";
import emotionalWords from "./emotionalWords";  // Import the expanded dataset
import { stemmer } from 'stemmer';

const normalize = (word) => stemmer(word.toLowerCase());

const EmotionClassifier = () => {
  const [sentence, setSentence] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Function to handle voice input
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSentence(transcript);
      checkForDangerContext(transcript);  // Automatically submit after voice input
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognition.start();
  };

  // Check for trigger words and analyze the context
  const checkForDangerContext = (sentence) => {
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
      setShowModal(true);
    } 
    analyzeContext(sentence);
  };

  const handleModalClose = (answer) => {
    setShowModal(false);
    if (answer === 'no') {
      sendHelpEmail();  // Call the function to send the help email if unsafe
    }
  };

  async function sendHelpEmail() {
    try {
      const response = await fetch('http://localhost:5000/send-help-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'Urgent help needed. Please help me!' })
      });

      const result = await response.json();
      alert("Help mail sent successfully!")
    } catch (error) {
      console.error('Error sending email:', error);
      alert('An error occurred while trying to send the email.');
    }
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
      <h2>Voice Input</h2>
      <button onClick={handleVoiceInput}>
        {isListening ? "Listening..." : "Click to Speak"}
      </button>
      <p>Detected Sentence: {sentence}</p>

      {showModal && (
        <div className="modal">
          <p>Are you safe?</p>
          <button onClick={() => handleModalClose('yes')}>Yes</button>
          <button onClick={() => handleModalClose('no')}>No</button>
        </div>
      )}
    </div>
  );
};

export default EmotionClassifier;
