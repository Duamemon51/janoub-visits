import mongoose from 'mongoose';

const LiveEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  img: { type: String },
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, required: true },
  location: { type: String },
  price: { type: String },
  btn: { type: String },
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
  status: { type: String, enum: ['active', 'deactive'], default: 'active' },
  totalSeats: { type: Number, default: 0 },        // total seats
  availableSeats: { type: Number, default: 0 },    // remaining seats
  perPersonLimit: { type: Number, default: 1 },    // max seats per person
});

const LiveEvent = mongoose.models.LiveEvent || mongoose.model('LiveEvent', LiveEventSchema);
export default LiveEvent;
