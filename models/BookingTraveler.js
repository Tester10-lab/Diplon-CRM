const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const bookingTravelerSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  travelerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Traveler', required: true },
  seatAssignment: { type: String },
  roomAssignment: { type: String },
  status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active' },
  boardingStatus: { type: String, enum: ['NOT_BOARDED', 'BOARDED'], default: 'NOT_BOARDED' },
  boardedAt: { type: Date, default: null },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { timestamps: true });

bookingTravelerSchema.plugin(scopingPlugin);
const BookingTraveler = mongoose.model('BookingTraveler', bookingTravelerSchema);

module.exports = { BookingTraveler };
