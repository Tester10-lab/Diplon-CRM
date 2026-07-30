const timelineService = require('../services/timelineService');
const { operationsNoteCreateSchema } = require('../schemas/module5Schemas');
const { serializeDoc, serializeList } = require('../services/serialization');

async function getTimeline(req, res, next) {
  try {
    const items = await timelineService.getTimeline(req.params.departureInstanceId);
    res.status(200).json(serializeList(items));
  } catch (err) {
    next(err);
  }
}

async function createNote(req, res, next) {
  try {
    const validated = operationsNoteCreateSchema.parse(req.body);
    const note = await timelineService.addNote(req.params.departureInstanceId, validated.type, validated.message, req.user);
    res.status(201).json(serializeDoc(note));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTimeline,
  createNote
};
