# Diplon CRM Foundation (Module 0)

This is the foundation layer for the Diplon Travel CRM system built with Node.js, Express, and MongoDB.

## Architecture Highlights
- **Replica Set Required:** MongoDB transactions are used to enforce atomicity across booking, traveler assignment, inventory decrement, and ledger updates. A replica set must be running for this to work.
- **AsyncLocalStorage:** Tenancy context (`branchId`, `companyId`) and Actor context (`currentUserId`, `employeeId`, `currentUserRole`) are passed implicitly down to the Mongoose models without manual prop drilling.
- **Scoping Plugin:** Intercepts database reads/writes and automatically enforces tenancy separation.
- **RBAC & Field-level Guards:** Pre-save hooks prevent unauthorized changes (e.g. users editing their own `salesTarget` or `commissionRate`).
- **Append-only Ledgers:** Balances are determined by aggregation instead of error-prone direct state mutations.

## Getting Started

1. Start MongoDB with a replica set. If using Docker:
   `docker run -d -p 27017:27017 --name mongo mongo:latest --replSet rs0`
   `docker exec -it mongo mongosh --eval "rs.initiate()"`
2. Install dependencies: `npm install`
3. Run the seed script: `node seed.js`
4. Run the concurrent seat booking test to verify transactions and race condition protection: `node test-booking.js`

## Entity Relationships
- **User / Employee:** Every employee references a user (nullable, some don't login).
- **Customer / Traveler:** Independent people. Joined to Bookings via `BookingTraveler`.
- **Pipeline:** Lead -> Inquiry -> Quotation -> Booking. Linked by `convertedFrom...Id`.
- **Package / DepartureInstance:** The product and its specific dated instance holding seat inventory.
- **Ledgers:** Financial and commission tracking.
- **AuditLog / Reminder:** Polymorphic logs for system activity and follow-ups.

## Testing MongoDB Transactions
The `test-booking.js` script fires multiple concurrent booking requests at a `DepartureInstance` that only has 1 seat available. 
Because the seat decrement and booking creation are wrapped in a MongoDB transaction with atomic `$inc` checks (`seatsAvailable: { $gte: requiredSeats }`), exactly one request will succeed, and the others will fail with a clean "No seats available" rejection, rolling back any partial document creations.
