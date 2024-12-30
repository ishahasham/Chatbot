import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

// Use environment variables loaded by Vite
const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { text: userInput, sender: 'user' };
    setMessages([...messages, userMessage]);
    setLoading(true);

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: userInput,
          }],
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        },
      };

      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const botMessage = {
        text: response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from bot.',
        sender: 'bot',
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error communicating with Gemini API:', error);
      const errorMessage = { text: 'Oops! Something went wrong.', sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setUserInput('');
    setLoading(false);
  };

  // Handle Enter key press to send message
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default action (like a new line)
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-heading">Tumhara Dost</h1>
      <div className="chat-box">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'bot' ? 'bot' : 'user'}`}
          >
            <p>{message.text}</p>
          </div>
        ))}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <span>Dost is typing...</span>
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}  // Listen for the Enter key press
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;
