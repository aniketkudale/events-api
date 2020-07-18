const Events = require('../models/events');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');

//@desc   Get all Events
//@route  GET /api/v1/events
//@access Public
exports.getEvents = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advancedResults);
});

//@desc   Get an Event
//@route  GET /api/v1/events/:id
//@access Public
exports.getEvent = asyncHandler(async (req, res, next) => {
    const events = await Events.findById(req.params.id);
    if(!events) {
      return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
      success: true,
      data: events
    });
});

//@desc   Create an Event
//@route  POST /api/v1/events/
//@access Public
exports.createEvent = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;

    // Check for published bootcamp
    const publishedEvents = await Events.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one Event
    if(publishedEvents && req.user.role !== 'admin') {
      return next(new ErrorResponse(`The user with ID ${req.user.id} has already published an event`, 400));
    }

    const events = await Events.create(req.body);
    res.status(201).json({
      success: true,
      data: events
    });
});

//@desc   Update an Event
//@route  PUT /api/v1/events/:id
//@access Public
exports.updateEvent = asyncHandler(async (req, res, next) => {
    let events = await Events.findById(req.params.id);

    if(!events) {
      return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is event owner
    if(events.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`${req.user.id} is not authorized to update this event`, 401));
    }

    events = await Events.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: events
    });
});

//@desc   Delete an Event
//@route  DELETE /api/v1/events/:id
//@access Public
exports.deleteEvent = asyncHandler(async (req, res, next) => {
    const events = await Events.findByIdAndDelete(req.params.id);

    if(!events) {
      return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is event owner
    if(events.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`${req.user.id} is not authorized to delete this event`, 401));
    }

    events.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
});

//@desc   Update photo of an Event
//@route  PUT /api/v1/events/:id/photo
//@access Public
exports.uploadEventPhoto = asyncHandler(async (req, res, next) => {
    const events = await Events.findById(req.params.id);

    if(!events) {
      return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is event owner
    if(events.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`${req.user.id} is not authorized to update this event`, 401));
    }

    if(!req.files) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.file;

    // Making sure file is an image
    if(!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Checking file size
    if(file.size > process.env.MAX_FILE_UPLOAD) {
      return next(new ErrorResponse(`Please upload an image file less than ${process.env.MAX_FILE_UPLOAD / 1000000} MB`, 400));
    }

    // Create custom file name
    file.name = `photo_${events._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
      if(err) {
        return next(new ErrorResponse('Problem uploading the file', 500));
      }

      await Events.findByIdAndUpdate(req.params.id, { photo: file.name});

      res.status(200).json({
        success: true,
        data: file.name
      });
      
    });

});