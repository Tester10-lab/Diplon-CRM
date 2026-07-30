const { assignResource } = require('../services/assignmentService');

exports.createAssignment = async (req, res) => {
  const { resourceId, departureInstanceId } = req.body;
  
  const assignment = await assignResource(resourceId, departureInstanceId, req.user);
  
  res.status(201).json({ data: assignment });
};
