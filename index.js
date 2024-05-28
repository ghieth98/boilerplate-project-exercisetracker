const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const User = require("./models/user");
const e = require("express");
const Exercise = require("./models/execrise");


app.use(cors())
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({extended: false}))
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to database');

})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
})

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
    try {
        const userId = req.params._id;
        const {description, duration, date} = req.body;
        const exercise = await Exercise.create({
            userId,
            description,
            duration,
            date: date ? new Date(date) : new Date(),
        });

        const user = User.findById(userId);

        res.status(200).json({
            username: user.username,
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString(),
            _id: exercise._id
        });

    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

app.get('/api/users/:_id/logs', async (req, res) => {
    try {
        const userId = req.params._id;
        const { from, to, limit } = req.query;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let filter = { userId };
        if (from || to) filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);

        const exercises = await Exercise.find(filter).limit(parseInt(limit)).exec();
        res.json({
            username: user.username,
            count: exercises.length,
            _id: user._id,
            log: exercises.map(e => ({
                description: e.description,
                duration: e.duration,
                date: e.date.toDateString()
            }))
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
});