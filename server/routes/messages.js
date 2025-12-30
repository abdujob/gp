const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// @route   POST api/messages
// @desc    Send a message
// @access  Private
router.post('/', auth, async (req, res) => {
    const { receiver_id, content } = req.body;

    try {
        const newMessage = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, receiver_id, content]
        );
        res.json(newMessage.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
// note: This is a bit complex in SQL to get "last message" per user.
// Simplified: Get all messages and group in frontend, or simple standard query.
router.get('/conversations', auth, async (req, res) => {
    try {
        // Get all messages where user is sender or receiver
        const messages = await pool.query(
            `SELECT m.*, 
                    u1.full_name as sender_name, 
                    u2.full_name as receiver_name
             FROM messages m
             JOIN users u1 ON m.sender_id = u1.id
             JOIN users u2 ON m.receiver_id = u2.id
             WHERE m.sender_id = $1 OR m.receiver_id = $1
             ORDER BY m.created_at DESC`,
            [req.user.id]
        );
        res.json(messages.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/messages/:userId
// @desc    Get chat history with a specific user
// @access  Private
router.get('/:userId', auth, async (req, res) => {
    try {
        const messages = await pool.query(
            `SELECT m.*, u.full_name as sender_name 
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
                OR (m.sender_id = $2 AND m.receiver_id = $1)
             ORDER BY m.created_at ASC`,
            [req.user.id, req.params.userId]
        );
        res.json(messages.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
