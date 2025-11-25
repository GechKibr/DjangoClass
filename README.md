
# -DjangoClass

Corruption Reporting & Case Tracking System

A modern web-based platform designed to make corruption reporting easier, more transparent, and traceable. The system allows citizens, employees, or whistleblowers to submit reports, upload evidence, and track the progress of their cases — while authorized officers manage, investigate, and resolve each report efficiently.

             Features
For Reporters

Submit corruption cases anonymously or with full identity

Upload supporting evidence (documents, images, videos)

Track the real-time status of submitted cases

Receive notifications on case updates

For Investigators / Officers

View and manage assigned corruption reports

Change case status (Pending → Under Review → Resolved → Closed)

Add comments, request additional evidence

Generate analytics and reports

   For Administrators

Manage users, roles, and permissions

Assign cases to investigation officers

Review system activity logs

Manage evidence storage and security

  System Architecture

Backend: Django + Django REST Framework

Frontend: React (planned)

Database: PostgreSQL / MySQL / or cloud-based DB

Authentication: JWT or Session-based

File Storage: Local or cloud (S3, Cloudinary, etc.)
    
     Core Modules

User Management

Case Submission & Tracking

Evidence (File Upload) Handling

Case Assignment & Workflow

Comments & Communication

Notifications

Analytics Dashboard
   
    Installation (Backend)
git clone <repo-url>

cd backend
pip install -r requirements.txt

python manage.py migrate
python manage.py runserver

  API Endpoints (Sample)
/api/cases/          → List & Create cases
/api/comments/       → Comment on cases
/api/attachments/    → Upload & view evidence
/api/auth/           → Authentication routes

     Project Goal

This system is built to support transparent governance, reduce manual paperwork, and give citizens a reliable platform to fight corruption through secure and trackable reporting.

## Pushing from Replit to GitHub

To push your code changes from Replit to this GitHub repository, follow these steps:

### Option 1: Connect GitHub to Replit (Recommended)

1. **Connect your GitHub account to Replit:**
   - Open your Repl
   - Click on the **Git** panel (branch icon) in the left sidebar
   - Click **Connect to GitHub**
   - Authorize Replit to access your GitHub account

2. **Link to this repository:**
   - In the Git panel, click **Import from GitHub** or use the repository URL
   - Select or enter: `GechKibr/DjangoClass`

3. **Push your changes:**
   - Make your code changes in Replit
   - In the Git panel, stage your changes
   - Write a commit message
   - Click **Commit & Push**

### Option 2: Using Shell Commands

1. **Open the Shell tab in Replit**

2. **Configure Git (first time only):**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your-email@example.com"
   ```

3. **Add the GitHub repository as remote (if not already added):**
   ```bash
   git remote add origin https://github.com/GechKibr/DjangoClass.git
   ```
   
   Or if origin already exists, update it:
   ```bash
   git remote set-url origin https://github.com/GechKibr/DjangoClass.git
   ```

4. **Stage, commit, and push your changes:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

5. **Authentication:**
   - When prompted, use your GitHub username
   - For the password, use a **Personal Access Token (PAT)** instead of your GitHub password
   - To create a PAT: Go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token
   - Select the `repo` scope for full repository access

### Troubleshooting

- **Permission denied:** Ensure you have write access to the repository and your PAT has the correct scopes
- **Remote already exists:** Use `git remote set-url origin <url>` instead of `git remote add`
- **Merge conflicts:** Pull the latest changes first with `git pull origin main --rebase`