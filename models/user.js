const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter username'],
    }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;