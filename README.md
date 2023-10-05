### Backend for MYM Project

Backend API for MYM Assessment which handles authentication, user data, and additional features.

## Tech Stack

**Platform:** Node.js
**Framework:** Express.js
**Database:** MongoDB
**ORM:** Mongoose
**Authentication:** Passport.js (Local and Google OAuth2.0 strategies)
**Deployment:** Vercel Serverless Functions

## Features

**Authentication:**

Local authentication using username and password
Google authentication using Google OAuth2.0
Rate Limiting: Utilizes express-rate-limit for basic rate limiting.

**Security:** Uses `helmet` for setting HTTP headers securely.
Utilizes `bcryptjs` for password hashing and verification.
**Logging:** Uses morgan for logging HTTP requests.
**Data Parsing:** `body-parser` for parsing incoming request bodies.
**Error Handling:** Custom error handling for 404 and other server errors.

## Environment Variables

To run this project, you need to set up the following environment variables:

GOOGLE_CLIENT_ID: Your Google OAuth2.0 client ID
GOOGLE_CLIENT_SECRET: Your Google OAuth2.0 client secret
SECRET: Secret key for session handling and JWT signing
MONGODB_URI: MongoDB connection string

## Local Development

1. Clone this repository.
2. Install dependencies using `npm install`.
3. Set up the necessary environment variables.
4. Run the server using `npm start`.

## Deployment

Deployed on Vercel as a serverless function.

1. Push your changes to your repository.
2. Link your repository to Vercel.
3. Configure environment variables on Vercel.
4. Deploy!

## Endpoints

# Authentication:

POST /api/login - Login using local strategy.
POST /api/signup - Sign up for a new account.
GET /auth/google - Start Google OAuth2.0 authentication flow.
GET /auth/google/callback - Callback endpoint for Google OAuth2.0.

# Other:

GET /api/nasa-daily-image - Fetch daily image from NASA.

## Acknowledgements

I'd like to say that due to some peresonal reasons, I only managed to start the project a few days late. This was my first time using Vercel, and although it's a fantastic platform, I quickly realized that implementing Google OAuth with it comes with its own unique set of challenges. While I was successful in getting the Google OAuth to work seamlessly on localhost, integrating it with the deployed backend on Vercel posed some hurdles that I couldn't overcome within the time frame. I appreciate the understanding and patience and hope to refine this in the future to provide a seamless experience across all environments.
