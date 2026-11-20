const { validationResult } = require('express-validator');
const Suggestion = require('../models/Suggestion');

// Register a suggestion
const registerSuggestion = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { student, hostel, title, description } = req.body;

        const suggestion = new Suggestion({
            student,
            hostel,
            title,
            description
        });

        await suggestion.save();

        res.json(suggestion);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// Get suggestions by hostel
const getbyhostel = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const suggestions = await Suggestion.find({
            hostel: req.body.hostel
        }).populate('student');

        res.json(suggestions);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// Get suggestions by student
const getbystudent = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const suggestions = await Suggestion.find({
            student: req.body.student
        }).populate('hostel');

        res.json(suggestions);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// Update suggestion
const updateSuggestion = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id, status } = req.body;

        const suggestion = await Suggestion.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!suggestion) {
            return res.status(404).json({
                msg: 'Suggestion not found'
            });
        }

        res.json(suggestion);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


module.exports = {
    registerSuggestion,
    getbyhostel,
    getbystudent,
    updateSuggestion
};