const mongoose = require('mongoose');
const slugify = require('slugify');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide event name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  slug: String,
  website: {
    type: String
  },
  city: {
    type: String,
    required: [true, 'Please provide city name']
  },
  country: {
    type: String,
    required: [true, 'Please provide country name']
  },
  twitter: {
    type: String
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Create
eventSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('events', eventSchema);