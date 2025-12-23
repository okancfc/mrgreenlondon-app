# Sir Green App

A production-ready mobile app for booking local services in the UK (landscaping and home services). Built with React Native, Expo, and Supabase.

## Features

- Three-screen onboarding flow with area selection
- Phone authentication with SMS OTP via Supabase (Twilio)
- Browse available services from database
- Multi-step booking creation with UK address validation
- Booking tracking with status updates
- User profile management

## Tech Stack

- **Frontend**: React Native + Expo + TypeScript
- **Backend**: Supabase (Auth + Postgres)
- **Navigation**: React Navigation 7+
- **Forms**: React Hook Form + Zod validation
- **State**: React Query + Context API

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API** and copy your:
   - Project URL
   - Anon (public) API key

3. Configure Phone Auth:
   - Go to **Authentication > Providers > Phone**
   - Enable Phone provider
   - Configure Twilio credentials (Account SID, Auth Token, Phone Number)

4. Run the database schema:
   - Go to **SQL Editor** in Supabase
   - Copy the contents of `supabase/schema.sql`
   - Run the SQL to create tables, RLS policies, and seed services

### 3. Configure Environment Variables

In Replit, add these secrets:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the App

```bash
npx expo start
```

Or use the workflow:
- The "Start dev servers" workflow runs both Expo (port 8081) and Express (port 5000)

### 5. Test on Device

- Scan the QR code with Expo Go on your phone
- Or use the web version at localhost:5000

## Database Schema

### Tables

- **profiles**: User profiles linked to auth.users
- **services**: Available services (admin-managed)
- **addresses**: User delivery addresses
- **bookings**: Service booking records

### Row Level Security

- Users can only access their own profiles, addresses, and bookings
- Services are publicly readable when active
- Admin management is done via Supabase Dashboard

## Project Structure

```
client/
├── components/     # Reusable UI components
├── constants/      # Theme and configuration
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── lib/            # API clients, utilities
├── navigation/     # React Navigation setup
└── screens/        # App screens

server/
├── index.ts        # Express server entry
└── routes.ts       # API routes

supabase/
└── schema.sql      # Database schema + RLS policies
```

## Key Components

- **Button**: Primary action button with press animation
- **Card**: Elevated surface container
- **TextField**: Form input with validation
- **Chip**: Status indicator badges
- **ServiceCard**: Service listing card
- **BookingCard**: Booking summary card

## Booking Flow

1. Browse services on Home screen
2. Tap "Book" to start booking
3. Enter delivery address (UK format)
4. Select date and time window
5. Review and confirm booking
6. Track booking status in Bookings tab

## Support

For support, the app includes:
- WhatsApp link (placeholder)
- Email link (placeholder)

Configure actual support contacts in `ProfileScreen.tsx`.
