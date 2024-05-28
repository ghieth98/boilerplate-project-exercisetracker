const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require("./models/user");
const e = require("express");
const Exercise = require("./models/execrise");


app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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

// Add exercise to a user
app.post('/api/users/:_id/exercises', async (req, res) => {
    try {
        const id = req.params._id;
        const { description, duration, date } = req.body;

        const user = await User.findById(id);
        if (!user){
            res.send('Could not find user');
        }else{
            const exerciseObj = new Exercise({
                user_id: user._id,
                description,
                duration: parseInt(duration),
                date: date ? new Date(date) : new Date()
            });
            const exercise = await exerciseObj.save();

            res.json({
                _id: user._id,
                username: user.username,
                description: exercise.description,
                duration: exercise.duration,
                date: new Date(exercise.date).toDateString(),
            });
        }

    } catch (err) {
        res.status(400).json(err.message);
    }
});

// Get user logs
app.get('/api/users/:_id/logs', async (req, res) => {
    try {
        const { from, to, limit } = req.query;
        const  id  = req.params._id;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let dateObj = {}
        if (from){
            dateObj['$gte'] = new Date(from)

        }
        if (to){
            dateObj['$lte'] = new Date(to)
        }

        let filter = {
            user_id: id
        }

        if (from || to){
            filter.date = dateObj;
        }



        const exercises = await Exercise.find(filter).limit(+limit ?? 500)


        const log = exercises.map(e => ({
            description: e.description,
            duration: e.duration,
            date: e.date.toDateString(),
        }));


        res.json({
            username: user.username,
            count: exercises.length,
            _id: user._id,
            log
        });
    } catch (err) {
        res.status(400).json(err.message);
    }
});


const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
});