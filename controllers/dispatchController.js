const { assignDispatchResource } = require('../services/dispatchService');
const { dispatchAssignSchema } = require('../schemas/module5Schemas');
const { serializeDoc } = require('../services/serialization');

async function assignDispatch(req, res, next) {
  try {
    const validated = dispatchAssignSchema.parse(req.body);
    const assignment = await assignDispatchResource(validated.resourceId, req.params.departureInstanceId, validated.role, req.user);
    res.status(201).json(serializeDoc(assignment));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  assignDispatch
};
