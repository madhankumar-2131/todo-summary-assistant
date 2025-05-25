import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function TodoApp() {
  const [todoList, setTodoList] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [inputText, setInputText] = useState('');
  const [motivation, setMotivation] = useState('');

  const motivationQuotes = [
    "Every morning is a fresh start. Make it count!",
    "Push yourself, because no one else is going to do it for you.",
    "The future depends on what you do today.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Don’t watch the clock; do what it does — keep going."
  ];
  // random  generate a Quotes
  const showMotivation = () => {
    const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
    setMotivation(motivationQuotes[randomIndex]);
  };

  //  backend
  const loadTodos = async () => {
    try {
      const result = await axios.get('http://localhost:5000/todos');
      setTodoList(result.data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setStatusMsg('Could not load todos.');
    }
  };
  const handleAddTodo = async () => {
    if (!inputText.trim()) {
      alert('Todo cannot be empty');
      return;
    }
    try {
      await axios.post('http://localhost:5000/todos', { text: inputText });
      setInputText('');
      loadTodos();
      setStatusMsg('Todo added!');
    } catch (err) {
      console.error('Add todo failed:', err);
      setStatusMsg('Unable to add todo.');
    }
  };
  // delete
  const handleDeleteTodo = async (todoId) => {
    try {
      await axios.delete(`http://localhost:5000/todos/${todoId}`);
      loadTodos();
      setStatusMsg('Todo removed.');
    } catch (err) {
      console.error('Delete todo failed:', err);
      setStatusMsg('Could not delete todo.');
    }
  };
  // Send summary 
  const sendSummary = async () => {
    try {
      const response = await axios.post('http://localhost:5000/summarize');
      setStatusMsg(response.data.message);
    } catch {
      setStatusMsg('Failed to send summary.');
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);
  const containerStyle = {
    backgroundColor: isDarkTheme ? '#121212' : '#fff',
    color: isDarkTheme ? '#fff' : '#000',
    minHeight: '100vh',
    padding: '20px',
    transition: 'background-color 0.3s',
  };
  const titleStyle = {
    color: isDarkTheme ? '#3b82f6' : '#000',
  };




  return (
    <div style={containerStyle}>
      <button
        onClick={() => setIsDarkTheme(!isDarkTheme)}
        style={{ float: 'right' }}
      >
        {isDarkTheme ? 'Switch to Light' : 'Switch to Dark'}
      </button>

      <h2 style={titleStyle}>Todo Summary Assistant</h2>
      <button
        onClick={showMotivation}
        style={{
          marginBottom: '15px',
          padding: '10px 15px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Today's Motivation
      </button>
      {motivation && (
        <p
          style={{
            fontStyle: 'italic',
            marginBottom: '20px',
            color: isDarkTheme ? '#90caf9' : '#1a237e',
            fontWeight: 'bold',
          }}
        >
          "{motivation}"
        </p>
      )}

      <label htmlFor="newTodo" style={{ display: 'block', marginBottom: '8px' }}>
        Enter a new todo:
      </label>
      <input
        id="newTodo"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type todo here"
      />
      <button onClick={handleAddTodo}>Add</button>

      {todoList.length === 0 ? (
        <p>Todo list is empty.</p>
      ) : (
        <ul>
          {todoList.map((item) => (
            <li key={item.id}>
              {item.text}{' '}
              <button onClick={() => handleDeleteTodo(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={sendSummary}>Summarize & Notify</button>
      {statusMsg && <p>{statusMsg}</p>}

    </div>
  );
}

export default TodoApp;
