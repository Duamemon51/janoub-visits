const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    img: { type: String, required: true },
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
    availableSeats: { type: Number, required: true },
    perPersonLimit: { type: Number, required: true },
    totalSeats: { type: Number, required: true }
}, { timestamps: true });

// ✅ Reuse model if it already exists
const Tour = mongoose.models.Tour || mongoose.model('Tour', tourSchema);

module.exports = Tour;
