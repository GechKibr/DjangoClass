# Corruption Reporting & Case Tracking System

## Overview
A modern web-based platform for corruption reporting with real-time case tracking. Built with Django REST Framework backend and React frontend, this system enables citizens to submit corruption reports, upload evidence, and track case progress while authorized officers manage investigations.

## Recent Changes
- **November 24, 2025**: Initial Replit setup
  - Configured for Replit environment with proper host settings
  - Frontend configured to run on port 5000
  - Backend API configured on port 8000
  - Updated CORS and CSRF settings for Replit domains
  - Fixed psycopg2 dependency (changed to psycopg2-binary)
  - Set up workflows for both frontend and backend

## Project Architecture

### Technology Stack
- **Backend**: Django 5.2.8 + Django REST Framework
- **Frontend**: React 19.2 + Vite 7.2 + TailwindCSS 4.1
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Authentication**: JWT tokens + Session authentication

### Directory Structure
```
├── backend/               # Django backend application
│   ├── accounts/         # User management app
│   ├── cases/           # Case management app
│   ├── dashboard/       # Analytics dashboard
│   ├── api_public/      # Public API endpoints
│   ├── evidence/        # Evidence file storage
│   └── backend/         # Django settings and config
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── api/         # API client configuration
│   │   ├── components/  # React components
│   │   └── pages/       # Page components
│   └── public/          # Static assets
└── requirements.txt     # Python dependencies
```

### Key Features
- **For Reporters**: Anonymous/identified submission, evidence upload, case tracking
- **For Officers**: Case management, status updates, comment system
- **For Admins**: User management, case assignment, activity logs

## Development Setup

### Running the Application
The application runs two workflows:
1. **Frontend** (port 5000): React + Vite dev server
2. **Backend** (port 8000): Django development server

Both workflows start automatically. The frontend is accessible via the webview.

### Environment Configuration
- Frontend connects to backend via Replit domain
- CORS is configured for `*.replit.dev` domains
- All hosts are allowed in Django for Replit proxy support

### Database
Currently using SQLite for development. The database is pre-migrated and ready to use.

To create a superuser for admin access:
```bash
cd backend && python manage.py createsuperuser
```

### API Endpoints
- `/api/v1/` - API base URL
- `/admin/` - Django admin panel
- Authentication uses JWT tokens stored in localStorage

## Deployment
Configured for VM deployment with:
- Gunicorn WSGI server for Django backend
- Vite preview for production frontend build
- Both services running concurrently

## User Preferences
None specified yet.

## Notes
- Frontend proxy requires `host: '0.0.0.0'` in Vite config
- Backend API domain is hardcoded in `frontend/src/api/api.jsx`
- Media files stored in `backend/media/`
- Static files served by Django in development
