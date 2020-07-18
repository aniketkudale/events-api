const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Users = require('../models/users');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

//@desc   Register User
//@route  POST /api/v1/auth/register
//@access Public
exports.registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const user = await Users.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 200, res );

});

//@desc   Login User
//@route  POST /api/v1/auth/login
//@access Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email and password
    if(!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }

    // Check for user
    const user = await Users.findOne({email}).select('+password');

    if(!user) {
      return next(new ErrorResponse('Invalid Credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if(!isMatch) {
      return next(new ErrorResponse('Invalid Credentials', 401));
    }

    sendTokenResponse(user, 200, res );
});

//@desc   Reset password
//@route  PUT /api/v1/auth/resetpassword/:resettoken
//@access public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hased token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await Users.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now()}
    });

    if(!user) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res );

});

//@desc   Log user out
//@route  GET /api/v1/auth/logout
//@access Private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    
    res.status(200).json({
      success: true,
      data: {}
    });

});

//@desc   Get Current Logged in User
//@route  POST /api/v1/auth/me
//@access Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await Users.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });

});

//@desc   Update User Details
//@route  PUT /api/v1/auth/updatedetails
//@access Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await Users.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });

});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@desc   Forgot Password
//@route  POST /api/v1/auth/forgotpassword
//@access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await Users.findOne({email: req.body.email});

    if(!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetURL}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
      });
      res.status(200).json({
      success: true,
      data: 'Email sent.'
    });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({validateBeforeSave: false});
      return next(new ErrorResponse('Email could not be sent', 500));
    }


});



// Get token from model, create cookie and send 

const sendTokenResponse = (user, statusCode, res) => {

  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now + 30 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token
  });

};

