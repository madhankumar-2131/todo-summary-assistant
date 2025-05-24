const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const axios = require('axios');
dotenv.config();


const server = express();
server.use(cors());
server.use(bodyParser.json());

let todoItems = [];
let nextId = 1;

server.get('/todos', (req, res) => {
    res.json(todoItems);
});

// Create 
server.post('/todos', (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Todo text is required' });
    }
    const newTodo = { id: nextId++, text: text.trim() };
    todoItems.push(newTodo);
    res.status(201).json(newTodo);
});

// Remove
server.delete('/todos/:id', (req, res) => {
    const idToRemove = parseInt(req.params.id);
    todoItems = todoItems.filter(todo => todo.id !== idToRemove);
    res.status(204).send();
});

// GENEARTE & SEND
server.post('/summarize', async (req, res) => {
    try {
        const allText = todoItems.map(t => `• ${t.text}`).join('\n');

        const hfResponse = await axios.post(
            'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
            { inputs: allText },
            { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}` } }
        );

        const summaryText = hfResponse.data[0]?.summary_text || 'No summary available';

        await axios.post(process.env.SLACK_WEBHOOK_URL, {
            text: `*Todo List Summary:*\n${summaryText}`
        });

        res.json({ message: 'Summary successfully sent to Slack.' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ message: 'Could not generate or send summary.' });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
