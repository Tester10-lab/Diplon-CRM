const mongoose = require('mongoose');
const { scopingPlugin } = require('../plugins/scoping');

const commonFields = {
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, default: null }, // Nullable for direct/retail
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'UserEmployee', default: null },
  convertedFromLeadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
  convertedFromInquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', default: null },
  convertedFromQuotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },
};

function writeOnceFirstResponse(schema) {
  // Guard for document .save()
  schema.pre('save', async function () {
    if (this.isModified('firstResponseAt') && !this.isNew) {
      const docInDb = await this.constructor.findById(this._id, null, { session: this.$session() }).select('firstResponseAt').lean();
      if (docInDb && docInDb.firstResponseAt != null) {
        throw new Error('firstResponseAt is write-once and cannot be modified.');
      }
    }
  });
  
  // Guard for query-level updates (findOneAndUpdate, updateOne, etc.)
  const preventQueryUpdate = async function () {
    const update = this.getUpdate();
    if (!update) return;
    
    const isUpdatingFirstResponse = update.firstResponseAt !== undefined || (update.$set && update.$set.firstResponseAt !== undefined);
    
    if (isUpdatingFirstResponse) {
      const docInDb = await this.model.findOne(this.getQuery(), null, { session: this.options.session }).select('firstResponseAt').lean();
      if (docInDb && docInDb.firstResponseAt != null) {
        throw new Error('firstResponseAt is write-once and cannot be modified via query updates.');
      }
    }
  };
  
  ['update', 'updateOne', 'updateMany', 'findOneAndUpdate'].forEach(op => {
    schema.pre(op, preventQueryUpdate);
  });
}

const leadSchema = new mongoose.Schema({
  ...commonFields,
  status: { type: String, enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'], default: 'NEW' },
  firstResponseAt: { type: Date, default: null }
}, { timestamps: true });
leadSchema.plugin(scopingPlugin);
leadSchema.plugin(writeOnceFirstResponse);

const inquirySchema = new mongoose.Schema({
  ...commonFields,
  status: { type: String, enum: ['NEW', 'IN_PROGRESS', 'QUOTED', 'CLOSED', 'CONVERTED'], default: 'NEW' },
  firstResponseAt: { type: Date, default: null }
}, { timestamps: true });
inquirySchema.plugin(scopingPlugin);
inquirySchema.plugin(writeOnceFirstResponse);

const quotationSchema = new mongoose.Schema({
  ...commonFields,
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  status: { type: String, enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'], default: 'DRAFT' },
  totalAmount: { type: Number, required: true }
}, { timestamps: true });
quotationSchema.plugin(scopingPlugin);

const bookingSchema = new mongoose.Schema({
  ...commonFields,
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  departureInstanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DepartureInstance', required: true },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'WAITLISTED'], default: 'PENDING' },
  paymentStatus: { type: String, enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID'], default: 'UNPAID' },
  seatsReserved: { type: Number, required: true },
  travelerCount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });
bookingSchema.plugin(scopingPlugin);

const Lead = mongoose.model('Lead', leadSchema);
const Inquiry = mongoose.model('Inquiry', inquirySchema);
const Quotation = mongoose.model('Quotation', quotationSchema);
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { Lead, Inquiry, Quotation, Booking };
