const { writeAuditLog } = require('./audit');
const { getContext } = require('../utils/context');

async function serializeCustomerOrTraveler(doc, entityType, canViewPII = false) {
  const context = getContext();
  const data = doc.toObject ? doc.toObject() : { ...doc };

  if (canViewPII) {
    if (context.currentUserId) {
      await writeAuditLog({
        entityType,
        entityId: data._id,
        action: 'pii_view'
      });
    }
    return data;
  }

  // Mask PII
  if (data.email) data.email = data.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + '*'.repeat(gp3.length));
  if (data.phone && data.phone.length > 6) {
    data.phone = data.phone.slice(0, 3) + '*'.repeat(data.phone.length - 6) + data.phone.slice(-3);
  }
  if (data.passportNumber) data.passportNumber = '***-***-***';
  
  return data;
}

function serializeDoc(doc) {
  if (!doc) return null;
  return doc.toObject ? doc.toObject() : doc;
}

function serializeList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(serializeDoc);
}

module.exports = { serializeCustomerOrTraveler, serializeDoc, serializeList };

