const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A event must hava a title'],
    min: 5,
    max: 100,
  },
  description: {
    type: String,
    required: [true, 'A event must hava a description'],
    min: 10,
    max: 500,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    requied: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;
