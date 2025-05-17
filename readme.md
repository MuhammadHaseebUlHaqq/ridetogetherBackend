# NUST Carpooling Backend

This is the backend service for the NUST Carpooling application, handling ride posting and management using a MERN stack.

## Features

- **Ride Management**: Create, read, update, and delete ride listings
- **Filtering**: Filter rides by various criteria like location, days, etc.
- **Status Updates**: Mark rides as active, completed, or cancelled
- **Data Validation**: Comprehensive input validation for ride data

## Prerequisites

- Node.js (v14 or newer)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd nust-carpooling/backend
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

```bash
# Copy the example .env file
cp .env.example .env

# Edit .env file with your MongoDB connection string and other settings
```

## Configuration

Update the `.env` file with your configuration:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/nust_carpooling
# For production use MongoDB Atlas or another cloud provider
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nust_carpooling
```

## Running the Server

### Development mode

```bash
# Run with nodemon for auto reloading
npm run server
# or
yarn server
```

### Production mode

```bash
npm start
# or
yarn start
```

### Run frontend and backend concurrently (for development)

```bash
npm run dev
# or
yarn dev
```

## API Endpoints

### Rides

- **POST /api/rides** - Create a new ride listing
- **GET /api/rides** - Get all active rides
- **GET /api/rides/filter** - Get rides by filter criteria
- **GET /api/rides/:id** - Get a specific ride by ID
- **PUT /api/rides/:id/status** - Update ride status (active/completed/cancelled)
- **DELETE /api/rides/:id** - Delete a ride

## Database Schema

The Ride schema includes:

- Route details (starting point, destination, stops)
- Ride preferences (frequency, days available, trip type)
- Vehicle information (type, details, capacity, amenities)
- Contact details (name, student ID, phone, email)
- Status information (active, completed, cancelled)

## Frontend Integration

To connect the frontend with this backend:

1. Create a `.env` file in your frontend root with:

```
VITE_API_URL=http://localhost:5000/api
```

2. Use the provided `rideService.js` in your frontend components to make API calls.

## Folder Structure

```
backend/
├── config/         # Database connection setup
├── controllers/    # API route controllers
├── middleware/     # Express middleware
├── models/         # MongoDB models
├── routes/         # API routes
├── .env            # Environment variables
├── package.json
└── server.js       # Main entry point
```

## Future Improvements

- User authentication and authorization
- Ride booking functionality
- User ratings and reviews
- Real-time notifications
- Chat functionality between riders and passengers

## License

MIT
