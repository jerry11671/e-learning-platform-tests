const mongoose = require('mongoose')


const courseSchema = new mongoose.Schema({
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    students: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User'
        }
    ]
}, { timestamps: true })

// courseSchema.post('save', function () {

// });




module.exports = mongoose.model('Course', courseSchema);    
