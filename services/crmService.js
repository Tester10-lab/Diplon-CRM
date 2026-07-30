const mongoose = require('mongoose');
const { Lead, Inquiry, Quotation } = require('../models/Pipeline');
const { logActivity } = require('./activityService');

async function convertLeadToInquiry(leadId, user) {
  const session = await mongoose.startSession();
  let inquiry;
  
  try {
    session.startTransaction();

    // 1. Fetch Lead
    const lead = await Lead.findById(leadId).session(session);
    if (!lead) {
      const err = new Error('Lead not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    if (lead.status === 'CONVERTED') {
      const err = new Error('Lead is already converted');
      err.isAppError = true;
      err.statusCode = 409;
      throw err;
    }
    if (lead.status === 'LOST') {
      const err = new Error('Cannot convert a LOST lead');
      err.isAppError = true;
      err.statusCode = 400;
      throw err;
    }

    // 2. Create Inquiry copying tenant/customer fields
    inquiry = new Inquiry({
      customerId: lead.customerId,
      branchId: lead.branchId,
      companyId: lead.companyId,
      partnerId: lead.partnerId,
      convertedFromLeadId: lead._id,
      status: 'NEW'
    });
    await inquiry.save({ session });

    // 3. Update Lead Status
    lead.status = 'CONVERTED';
    await lead.save({ session }); // write-once firstResponseAt protection won't trip here because we aren't modifying it

    // 4. Log Activities
    await logActivity(lead._id, 'Lead', 'update', 'Converted to Inquiry', user, session);
    await logActivity(inquiry._id, 'Inquiry', 'create', `Created via conversion from Lead ${lead._id}`, user, session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return inquiry;
}

async function convertInquiryToQuotation(inquiryId, user) {
  const session = await mongoose.startSession();
  let quotation;

  try {
    session.startTransaction();

    const inquiry = await Inquiry.findById(inquiryId).session(session);
    if (!inquiry) {
      const err = new Error('Inquiry not found');
      err.isAppError = true;
      err.statusCode = 404;
      throw err;
    }

    if (inquiry.status === 'CONVERTED') {
      const err = new Error('Inquiry is already converted');
      err.isAppError = true;
      err.statusCode = 409;
      throw err;
    }
    if (inquiry.status === 'CLOSED') {
      const err = new Error('Cannot convert a CLOSED inquiry');
      err.isAppError = true;
      err.statusCode = 400;
      throw err;
    }

    // Default amount 0 until modified by user
    quotation = new Quotation({
      customerId: inquiry.customerId,
      branchId: inquiry.branchId,
      companyId: inquiry.companyId,
      partnerId: inquiry.partnerId,
      convertedFromInquiryId: inquiry._id,
      status: 'DRAFT',
      totalAmount: 0 
    });
    await quotation.save({ session });

    inquiry.status = 'CONVERTED';
    await inquiry.save({ session });

    await logActivity(inquiry._id, 'Inquiry', 'update', 'Converted to Quotation', user, session);
    await logActivity(quotation._id, 'Quotation', 'create', `Created via conversion from Inquiry ${inquiry._id}`, user, session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return quotation;
}

module.exports = {
  convertLeadToInquiry,
  convertInquiryToQuotation
};
