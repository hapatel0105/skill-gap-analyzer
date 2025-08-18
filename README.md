# Skill Gap Analyzer

A personal skill gap analyzer and learning path generator that helps users identify skills they need to develop for their dream job.

## Features

- **Resume Upload & Parsing**: Extract skills from uploaded resumes
- **Job Description Analysis**: Parse job requirements and extract required skills
- **Skill Gap Analysis**: AI-powered comparison between existing and required skills
- **Personalized Learning Paths**: Generate customized learning plans with resources and timelines
- **Project Recommendations**: Suggest hands-on projects to build required skills

## Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenRouter (LLaMA models for NLP parsing & skill analysis)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage

## Project Structure

```
skill-gap-analyzer/
├── frontend/                 # Next.js application
├── backend/                  # Express API server
├── shared/                   # Shared types and utilities
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenRouter API key

### Setup

1. Clone the repository
2. Install dependencies in both frontend and backend
3. Set up environment variables
4. Run the development servers

See individual README files in frontend/ and backend/ directories for detailed setup instructions.
