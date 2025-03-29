# AI Tools Search Engine

A modern search engine for AI tools using OpenAI API integration to help users find appropriate automation tools.

## Features

- Modern, responsive landing page
- AI-powered search using OpenAI API
- Fallback search algorithm when API is unavailable
- PostgreSQL database for persistent storage
- Categories and tags for better tool organization
- Featured tools showcase

## Tech Stack

- Frontend: React, TailwindCSS, shadcn/ui components
- Backend: Node.js, Express
- Database: PostgreSQL with Drizzle ORM
- APIs: OpenAI API for intelligent search

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/ai-tools-search.git
cd ai-tools-search
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Copy `.env.example` to `.env`
   - Fill in your database connection details and API keys

4. Push database schema
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

6. Open [http://localhost:5000](http://localhost:5000) in your browser

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key
- `PERPLEXITY_API_KEY`: (Optional) Perplexity API key

## Database Schema

The application uses the following data models:
- Tools
- Categories
- Tags
- User preferences
- Tool-category relationships
- Tool-tag relationships

## License

MIT