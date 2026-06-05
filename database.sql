CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);


CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "CANDIDATES" (id SERIAL PRIMARY KEY,first_name VARCHAR(50),last_name VARCHAR(50),email VARCHAR(150)
  ,phone VARCHAR(20),date_of_birth DATE,resume_path bytea,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE "JOBS" (id SERIAL PRIMARY KEY,title VARCHAR(100),description TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE EXTENSION vector;

CREATE TABLE IF NOT EXISTS candidatesmatch (
    candidate_id INTEGER PRIMARY KEY,
    resume_embedding VECTOR(384),
    FOREIGN KEY (candidate_id)
        REFERENCES "CANDIDATES"(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobmatching (
    job_id INTEGER PRIMARY KEY,
    description_embedding VECTOR(384),
    FOREIGN KEY (job_id)
        REFERENCES "JOBS"(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidate_selections (
    id SERIAL PRIMARY KEY,
    
    candidate_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,

    selected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_candidate
        FOREIGN KEY (candidate_id)
        REFERENCES "CANDIDATES"(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_job
        FOREIGN KEY (job_id)
        REFERENCES "JOBS"(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recruitment_steps (
    id SERIAL PRIMARY KEY,

    selection_id INTEGER NOT NULL,

    stage_name VARCHAR(100) NOT NULL,

    status VARCHAR(50) NOT NULL
        CHECK (status IN ('Pending', 'In Progress', 'Completed', 'On Hold')),

    notes TEXT,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_selection
        FOREIGN KEY (selection_id)
        REFERENCES candidate_selections(id)
        ON DELETE CASCADE
);

ALTER TABLE recruitment_steps
DROP CONSTRAINT recruitment_steps_status_check;

ALTER TABLE recruitment_steps
ADD CONSTRAINT recruitment_steps_status_check
CHECK (
  status IN (
    'Pending',
    'In Progress',
    'Completed',
    'On Hold',
    'Accepted',
    'Rejected'
  )
);

-- Create Table
-- Candidates
CREATE INDEX idx_candidates_email ON "CANDIDATES"(email);
CREATE INDEX idx_candidates_created_at ON "CANDIDATES"(created_at);

-- Jobs
CREATE INDEX idx_jobs_title ON "JOBS"(title);
CREATE INDEX idx_jobs_created_at ON "JOBS"(created_at);

-- Candidate Selections
CREATE INDEX idx_candidate_selections_candidate_job
ON candidate_selections(candidate_id, job_id);

-- Recruitment Steps
CREATE INDEX idx_recruitment_steps_selection_updated
ON recruitment_steps(selection_id, updated_at DESC);

-- pgvector
CREATE INDEX idx_candidatesmatch_embedding
ON candidatesmatch
USING ivfflat (resume_embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX idx_jobmatching_embedding
ON jobmatching
USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 100);