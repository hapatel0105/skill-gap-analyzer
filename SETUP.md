# Skill Gap Analyzer - Setup Guide

This guide will help you set up the complete Skill Gap Analyzer project with Next.js frontend, Node.js backend, Supabase database, and OpenRouter AI integration.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Supabase account
- OpenRouter API key

## Project Structure

```
skill-gap-analyzer/
├── frontend/                 # Next.js application
├── backend/                  # Express API server
├── shared/                   # Shared types and utilities
├── database/                 # Database schema and migrations
└── README.md
```

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd skill-gap-analyzer

# Install dependencies for shared utilities
cd shared
npm install
npm run build

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Supabase Setup

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `database/schema.sql`
   - Run the SQL script

3. **Configure storage buckets**
   - Go to Storage in your Supabase dashboard
   - Verify that `resumes` and `avatars` buckets are created
   - Set appropriate permissions

## Step 3: OpenRouter Setup

1. **Get API key**
   - Go to [openrouter.ai](https://openrouter.ai)
   - Sign up and get your API key
   - Note: This will be used to access LLaMA models

2. **Configure models**
   - The project is configured to use `gpt-4o-mini`
   - You can change this in `backend/src/config/openrouter.ts`

## Step 4: Environment Configuration

### Backend Environment Variables

Create `backend/.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### Frontend Environment Variables

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Step 5: Backend Setup

```bash
cd backend

# Create uploads directory
mkdir uploads

# Start development server
npm run dev
```

The backend will be available at `http://localhost:3001`

## Step 6: Frontend Setup

```bash
cd frontend

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Step 7: Testing the Setup

1. **Backend Health Check**
   - Visit `http://localhost:3001/health`
   - Should return `{"status":"OK"}`

2. **Frontend Landing Page**
   - Visit `http://localhost:3000`
   - Should see the Skill Gap Analyzer landing page

3. **Database Connection**
   - Check Supabase dashboard for any connection errors
   - Verify tables are created correctly

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Resumes
- `POST /api/resume/upload` - Upload and parse resume
- `GET /api/resume` - Get user's resumes
- `GET /api/resume/:id` - Get specific resume
- `PUT /api/resume/:id` - Update resume
- `DELETE /api/resume/:id` - Delete resume

### Job Descriptions
- `POST /api/job-description` - Create job description
- `GET /api/job-description` - Get user's job descriptions
- `GET /api/job-description/:id` - Get specific job description
- `PUT /api/job-description/:id` - Update job description
- `DELETE /api/job-description/:id` - Delete job description

### Skill Analysis
- `POST /api/skill-analysis/analyze` - Analyze skill gaps
- `GET /api/skill-analysis/history` - Get analysis history
- `GET /api/skill-analysis/:id` - Get specific analysis
- `POST /api/skill-analysis/:id/reanalyze` - Re-analyze

### Learning Paths
- `POST /api/learning-path/generate` - Generate learning path
- `GET /api/learning-path` - Get user's learning paths
- `GET /api/learning-path/:id` - Get specific learning path
- `PUT /api/learning-path/:id/progress` - Update progress

## Development Workflow

1. **Backend Development**
   - Make changes in `backend/src/`
   - Server auto-restarts with nodemon
   - Check logs for any errors

2. **Frontend Development**
   - Make changes in `frontend/src/`
   - Next.js hot reloads automatically
   - Check browser console for errors

3. **Database Changes**
   - Modify `database/schema.sql`
   - Run in Supabase SQL Editor
   - Update shared types if needed

## Production Deployment

### Backend Deployment
- Use PM2 or similar process manager
- Set `NODE_ENV=production`
- Configure reverse proxy (nginx)
- Set up SSL certificates

### Frontend Deployment
- Build with `npm run build`
- Deploy to Vercel, Netlify, or similar
- Configure environment variables

### Database
- Use Supabase production instance
- Configure backup policies
- Monitor performance metrics

## Troubleshooting

### Common Issues

1. **Supabase Connection Errors**
   - Verify environment variables
   - Check project URL and keys
   - Ensure RLS policies are correct

2. **OpenRouter API Errors**
   - Verify API key is valid
   - Check rate limits
   - Ensure model names are correct

3. **File Upload Issues**
   - Check `uploads/` directory exists
   - Verify file size limits
   - Check Supabase storage permissions

4. **CORS Errors**
   - Verify `FRONTEND_URL` in backend
   - Check CORS configuration
   - Ensure frontend and backend ports match

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=* npm run dev

# Frontend
NODE_ENV=development npm run dev
```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate keys regularly

2. **File Uploads**
   - Validate file types and sizes
   - Scan for malware
   - Use secure storage

3. **Authentication**
   - Implement rate limiting
   - Use secure session management
   - Validate all inputs

4. **API Security**
   - Use HTTPS in production
   - Implement proper CORS
   - Validate JWT tokens

## Performance Optimization

1. **Database**
   - Use appropriate indexes
   - Implement connection pooling
   - Monitor query performance

2. **File Processing**
   - Implement file size limits
   - Use streaming for large files
   - Cache processed results

3. **AI Integration**
   - Implement request caching
   - Use appropriate model sizes
   - Monitor API costs

## Monitoring and Logging

1. **Application Logs**
   - Use structured logging
   - Monitor error rates
   - Track performance metrics

2. **Database Monitoring**
   - Monitor connection counts
   - Track query performance
   - Set up alerts for issues

3. **AI Service Monitoring**
   - Track API usage
   - Monitor response times
   - Set up cost alerts

## Support and Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
