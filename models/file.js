const mongoose = require("mongoose");

const File = mongoose.Schema({
    filepath: {
        type: String,
        required: true,
    },

    originalName: {
        type: String,
        required: true,
    },

    password: String,

    downloadCount: {
        required: true,
        type: Number,
        default: 0,
    },
});

const FileModel = mongoose.model('Files', File);

module.exports = FileModel;
