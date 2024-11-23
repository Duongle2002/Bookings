const mongoose = require('mongoose');

// Định nghĩa schema cho booking
const bookingSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Cancelled"],
        required: true
    }
}, {
    timestamps: true 
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
