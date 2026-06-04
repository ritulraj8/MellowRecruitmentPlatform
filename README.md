# Mellow Recruitment Management System

## Overview

The Recruitment Management System is a web-based application designed to streamline the recruitment workflow, from candidate onboarding to final hiring decisions. The system enables recruiters to manage candidates, create job postings, match candidates with jobs using AI-based resume analysis, track recruitment progress, and onboard successful candidates.

---

## Features

### Authentication

* Secure login system
* Session management
* Automatic logout after inactivity
* Protected routes for authenticated users

### Candidate Management

* Add new candidates
* View candidate profiles
* Upload and manage resumes
* Search and filter candidates

### Job Management

* Create job postings
* View active job listings
* Search jobs by title
* Manage job descriptions

### AI-Based Job Matching

* Resume parsing and processing
* Embedding generation using machine learning models
* Candidate-job similarity scoring
* Ranked candidate recommendations

### Candidate Selection

* Select candidates for specific job postings
* Maintain candidate selection records
* Track recruitment stages

### Recruitment Workflow Tracking

The system supports the following recruitment stages:

1. Initial Screening
2. Phone / Video Interview
3. Technical Assessment
4. HR Interview
5. Final Decision

Recruiters can:

* Update stage status
* Add notes
* Track progress
* Record final hiring decisions

### Candidate Onboarding

* Track hired candidates
* Maintain onboarding records
* Monitor onboarding status

---

## Technology Stack

### Frontend

* Next.js
* React.js
* Tailwind CSS

### Backend

* Next.js 
* API Routes
* FASTAPI
* RESTAPI
* Node.js

### Database

* PostgreSQL
* Neon Database

### Machine Learning

* Python
* Sentence Transformers
* TF-IDF
* Cosine Similarity

---

## Database Tables

### JOBS

Stores job posting information.

### CANDIDATES

Stores candidate details and resume information.

### jobmatching

Stores job description embeddings.

### candidatesmatch

Stores candidate resume embeddings.

### candidate_selections

Stores selected candidate records for job postings.

### recruitment_steps

Stores recruitment workflow stages, status updates, and recruiter notes.

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd recruitment-management-system
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=your_neon_database_url
NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
JWT_SECRET=your_secret_key
```

### Run Database Setup

Execute the provided SQL file:

```bash
psql -d your_database_name -f database_setup.sql
```

or execute the SQL script in the Neon SQL Editor.

### Start Next.js Application

```bash
npm run dev
```

### Start Flask Matching Service

```bash
python app.py
```

---

## Project Structure

```text
src/
│
├── app/
│   ├── dashboard/
│   ├── jobposting/
│   ├── joblisting/
│   ├── jobmatching/
│   ├── candidateselection/
│   ├── candidateview/
│   ├── candidateonboarding/
│   └── api/
│
├── components/
│
└── lib/
```

---

## Workflow

1. Recruiter logs into the system.
2. Recruiter creates job postings.
3. Candidates are added to the system.
4. AI matching engine ranks candidates against job requirements.
5. Recruiter reviews ranked candidates.
6. Candidate is selected for a specific job.
7. Recruitment stages are tracked and updated.
8. Final hiring decision is recorded.
9. Successful candidates proceed to onboarding.

---
## Authors

Ritul Raj Mullur
