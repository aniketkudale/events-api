# Events API
A CRUD API for Events built using NodeJS, MongoDB, Express and Mongoose.

## API Specs
Create the backend for a events directory website. 

### Events
- List all events in the database
   * Pagination
   * Select specific fields in result
   * Limit number of results
   * Filter by fields
- Get single event
- Create new event
  * Authenticated users only
  * Must have the role "publisher" or "admin"
  * Only one event per publisher (admins can create more)
  * Field validation via Mongoose
- Upload a photo for event
  * Owner only
  * Photo will be uploaded to local filesystem
- Update events
  * Owner only
  * Validation on update
- Delete event
  * Owner only

### Users & Authentication
- Authentication will be done using JWT/cookies
  * JWT and cookie should expire in 30 days
- User registration
  * Register as a "user" or "publisher"
  * Once registered, a token will be sent along with a cookie (token = xxx)
  * Passwords must be hashed
- User login
  * User can login with email and password
  * Plain text password will compare with stored hashed password
  * Once logged in, a token will be sent along with a cookie (token = xxx)
- User logout
  * Cookie will be sent to set token = none
- Get user
  * Route to get the currently logged in user (via token)
- Password reset (lost password)
  * User can request to reset password
  * A hashed token will be emailed to the users registered email address
  * A put request can be made to the generated url to reset password
  * The token will expire after 10 minutes
- Update user info
  * Authenticated user only
  * Separate route to update password
- User CRUD
  * Admin only
- Users can only be made admin by updating the database field manually

### Security
- Encrypt passwords and reset tokens
- Prevent NoSQL injections
- Add headers for security (helmet)
- Prevent cross site scripting - XSS
- Add a rate limit for requests of 100 requests per 10 minutes
- Protect against http param polution

### How to setup
1. Clone the repo
2. Run `npm install` to install dependencies
3. Add config details in such as Mongo URI, SMTP setup etc. in `config/config.env`

```
NODE_ENV=development
PORT=5000
MONGO_URI=

FILE_UPLOAD_PATH= ./public/uploads
MAX_FILE_UPLOAD=1000000

JWT_SECRET=Venu123
JWT_EXPIRE=20d

SMTP_HOST=
SMTP_POST=
SMTP_EMAIL=
SMTP_PASSWORD=
FROM_EMAIL=
FROM=NAME=
```
4. Run using `npm run dev`

## API Documentation
[API Documentation](https://documenter.getpostman.com/view/10649161/T1Djjz3B?version=latest)

## Copyright
MIT (C) 2020 Aniket Kudale
