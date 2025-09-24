# MatchMySkills - Internship Matching Platform

A full-stack web application that intelligently matches students with internship opportunities based on their skills, interests, and experience level.

## Features

- **Smart Matching Algorithm**: AI-powered recommendation engine that analyzes user profiles and internship requirements
- **User Authentication**: Secure sign-up and login with Supabase Auth
- **Profile Management**: Comprehensive user profiles with skills, interests, and resume upload
- **Resume Parsing**: Automatic skill extraction from uploaded resumes
- **Internship Discovery**: Browse and search internships with advanced filtering
- **Application Tracking**: Track application status and history
- **Responsive Design**: Modern, mobile-first UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for resumes)
- **Styling**: Tailwind CSS, shadcn/ui
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/matchmyskills.git
cd matchmyskills
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

4. Run database migrations:
Execute the SQL scripts in the `scripts/` folder in your Supabase SQL editor:
- `001_create_database_schema.sql`
- `002_seed_sample_data.sql`
- `003_create_storage_bucket.sql`

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── internships/       # Internship pages
│   ├── profile/           # Profile management
│   └── applications/      # Application tracking
├── components/            # Reusable UI components
├── lib/                   # Utility functions and types
├── scripts/               # Database migration scripts
└── __tests__/             # Test files
\`\`\`

## Key Features

### Recommendation Engine

The platform uses a sophisticated matching algorithm that considers:
- **Skills matching** (40% weight): Compares user skills with internship requirements
- **Experience level** (20% weight): Matches user experience with internship complexity
- **Location preferences** (20% weight): Considers location and remote work preferences
- **Interest alignment** (20% weight): Analyzes interests against internship descriptions

### Resume Upload & Parsing

- Supports PDF and Word document uploads
- Automatic skill extraction from resume content
- Secure file storage with Supabase Storage
- Auto-population of user profile with extracted data

### Security

- Row Level Security (RLS) policies for all database tables
- Secure file upload with type and size validation
- Authentication required for all protected routes
- User data isolation and privacy protection

## Testing

Run the test suite:
\`\`\`bash
npm test
\`\`\`

Run tests in watch mode:
\`\`\`bash
npm run test:watch
\`\`\`

Generate coverage report:
\`\`\`bash
npm run test:coverage
\`\`\`

## Deployment

The application is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@matchmyskills.com or create an issue in the GitHub repository.
