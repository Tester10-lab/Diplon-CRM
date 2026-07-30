const { z } = require('zod');

// Schema for Creating a Booking from a Quotation
// Does not allow 'status' or 'travelerCount' to be passed by the client
const bookingCreateSchema = z.object({
  quotationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quotationId'),
  departureInstanceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid departureInstanceId'),
  seatsReserved: z.number().int().positive('seatsReserved must be at least 1')
});

// Schema for adding a BookingTraveler
// Does not allow passing internal state like status
const bookingTravelerCreateSchema = z.object({
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid bookingId'),
  travelerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid travelerId'),
  seatAssignment: z.string().optional(),
  roomAssignment: z.string().optional()
});

module.exports = {
  bookingCreateSchema,
  bookingTravelerCreateSchema
};
