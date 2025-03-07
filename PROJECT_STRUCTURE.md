# Web3 Job Matcher - Project Structure

## Frontend (client/src)
### Pages
- `home.tsx` - Landing page with features overview
- `jobs.tsx` - Job listing and search page
- `profile.tsx` - User profile creation/editing
- `dashboard.tsx` - User/Employer dashboard
- `not-found.tsx` - 404 page

### Components
- `navigation.tsx` - Main navigation bar
- `job-card.tsx` - Job listing card component
- `match-score.tsx` - AI match score display

### Core Setup
- `App.tsx` - Main app component with routing
- `main.tsx` - App entry point
- `index.css` - Global styles
- `lib/queryClient.ts` - API client configuration

## Backend (server)
- `index.ts` - Express server setup
- `routes.ts` - API route definitions
- `storage.ts` - In-memory data storage
- `vite.ts` - Development server configuration

## Shared (shared)
- `schema.ts` - Data models and validation schemas
  - User profiles
  - Job listings
  - Job matches

## Configuration Files
- `theme.json` - UI theme configuration
- `tailwind.config.ts` - Tailwind CSS setup
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite bundler configuration
- `drizzle.config.ts` - Database configuration (future use)

## Key Features
1. User Management
   - Profile creation (candidates/employers)
   - Authentication ready
   
2. Job Management
   - Job posting
   - Job search and filtering
   - Blockchain-specific listings
   
3. Matching System
   - AI-powered match scoring (mocked)
   - Application tracking
   - Match status updates

4. UI/UX
   - Dark theme
   - Responsive design
   - Modern component library (shadcn)
