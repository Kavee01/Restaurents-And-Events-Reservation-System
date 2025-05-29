# PearlReserve - Luxury Dining & Hospitality Platform for Sri Lanka.

PearlReserve is a comprehensive MERN stack application that revolutionizes the way people experience luxury dining and hospitality services in Sri Lanka for restuarents, events, activities and services. The platform connects food enthusiasts with premium restaurants while offering a seamless booking experience for various services.

## 🌟 Features

### For Customers
- **Restaurant Discovery**: Browse and explore premium restaurants with detailed information
- **Easy Booking**: Make restaurant reservations with a user-friendly interface
- **Event Management**: Book and manage special events and celebrations
- **Activity Bookings**: Reserve spots for various activities and experiences
- **Service Reservations**: Book additional services offered by establishments
- **User Dashboard**: Manage bookings, view history, and update preferences
- **Interactive Maps**: Location-based search with Google Maps integration

### For Restaurant Owners
- **Business Management**: Complete control over restaurant information and settings
- **Booking Management**: Handle reservations and customer requests efficiently
- **Event Planning**: Create and manage special events and packages
- **Activity Management**: Set up and manage various activities
- **Service Management**: Add and manage additional services
- **Analytics Dashboard**: Track performance and customer engagement

### For Administrators
- **System Management**: Oversee the entire platform
- **User Management**: Handle user accounts and permissions
- **Content Moderation**: Ensure quality and compliance
- **Analytics**: Access comprehensive platform statistics

## 🛠️ Technology Stack

### Frontend
- React.js
- Mantine UI Library
- React Router DOM
- Google Maps API
- TailwindCSS
- Framer Motion

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Nodemailer

### Development Tools
- Vite
- ESLint
- PostCSS
- Git

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google Maps API Key

### Installation

1. Clone the repository:
```bash
git https://github.com/Kavee01/Restaurents-And-Events-Reservation-System.git
cd PearlReserve
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Environment Setup:
Create `.env` files in both frontend and backend directories:

Frontend (.env):
```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Backend (.env):
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

4. Start the development servers:
```bash
# Start backend server
cd backend
npm start

# Start frontend server
cd ../frontend
npm run dev
```

## 📱 Application Structure

```
pearlreserve/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── service/
│   │   ├── theme/
│   │   └── util/
│   └── public/
└── backend/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    └── util/
```

## 🎨 Design System

The application uses a modern, luxury-focused design system with:

- **Color Palette**:
  - Primary: Deep Teal Blue (#1A5F7A)
  - Secondary: Warm Charcoal (#2D3142)
  - Accent: Coral (#FF6B6B), Sage Green (#66A182), Gold (#E9C46A)

- **Typography**:
  - Primary Font: Poppins
  - Clean, modern interface with emphasis on readability

- **Components**:
  - Custom-styled cards and containers
  - Interactive maps
  - Responsive navigation
  - Modern form elements

## 🔒 Security Features

- JWT-based authentication
- Secure password hashing
- Protected API routes
- Input validation
- XSS protection
- CSRF protection


## 👥 Developers

- [@jx0906](https://github.com/jx0906)
- [@cedricyong00](https://github.com/cedricyong00)
- [@natsumi-h](https://github.com/natsumi-h)

## 🌐 Live Demo

Visit our live application at: [https://pearlreserve.vercel.app/](https://pearlreserve.vercel.app/)

## Screenshots
<img width="1377" alt="Screenshot 2024-01-29 at 7 57 40 PM" src="https://github.com/natsumi-h/chopeseats/assets/88537845/b0236580-474b-46af-8944-4e20bfabc66a">
<img width="1377" alt="Screenshot 2024-01-29 at 7 57 53 PM" src="https://github.com/natsumi-h/chopeseats/assets/88537845/42dbfe76-8e36-494e-9572-f65f8ce9be13">
<img width="1377" alt="Screenshot 2024-01-29 at 7 58 56 PM" src="https://github.com/natsumi-h/chopeseats/assets/88537845/8af1eee7-2d5c-492b-8aa1-d1ee4a19bbc3">
<img width="1377" alt="Screenshot 2024-01-29 at 7 59 06 PM" src="https://github.com/natsumi-h/chopeseats/assets/88537845/27d93903-2d3b-459f-9b68-1969cedee87a">
<img width="1377" alt="Screenshot 2024-01-29 at 7 59 35 PM" src="https://github.com/natsumi-h/chopeseats/assets/88537845/5481d7be-dcec-4c83-9645-fbe316abb11b">
<img width="1377" alt="Screenshot 2024-01-29 at 7 59 47 PM" src="https://github.com/natsumi-h/chopeseats/assets/88537845/5e7b9315-1bc8-4b2b-8b4e-cfda9a3e1b5a">


## Technologies Used
### Backend API/DB
* [Mongo DB](https://www.mongodb.com/)
* [Mongoose](https://mongoosejs.com/)
* [Express](https://expressjs.com/)

### Frontend Application
* [React](https://react.dev/)
* [React router dom](https://reactrouter.com/en/main) -Routing system
* [Mantine](https://mantine.dev/) -UI Library
* [Mantine form](https://mantine.dev/form/use-form/) -Form validation

### Other packeges used
* [dayjs](https://www.npmjs.com/package/dayjs) - Date formatting
* [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
* [bcrypt](https://www.npmjs.com/package/bcrypt)
* [Nodemailer](https://nodemailer.com/)

### PaaS
* [Vercel](https://vercel.com/)


# Google Maps Integration

The application now includes Google Maps integration for restaurant locations. To enable this feature:

1. Install required dependencies:
   ```
   cd frontend
   npm install @react-google-maps/api
   ```

2. Create a `.env` file in the `/frontend` directory with the following content:
   ```
   VITE_API_URL=http://localhost:3000
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

3. Replace `your-google-maps-api-key` with a valid Google Maps API key.
   - You can get a key from the [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Maps JavaScript API and Geocoding API in your Google project