import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const FLASK_API_URL =
  process.env.NEXT_PUBLIC_FLASK_API_URL ||
  'http://localhost:5000';

export async function POST(req) {
  try {
    const {
      candidateId,
      jobId,
      resumeBlob,
      jobDescription,
    } = await req.json();

    if (!candidateId || !jobId) {
      return Response.json(
        {
          message:
            'candidateId and jobId are required',
        },
        {
          status: 400,
        }
      );
    }

    //------------------------------------------------
    // Candidate Embedding
    //------------------------------------------------

    let resumeEmbedding = null;

    const candidateEmbeddingResult =
      await pool.query(
        `
        SELECT resume_embedding
        FROM candidatesmatch
        WHERE candidate_id = $1
        LIMIT 1
        `,
        [candidateId]
      );

    if (
      candidateEmbeddingResult.rows.length > 0 &&
      candidateEmbeddingResult.rows[0]
        .resume_embedding
    ) {
      resumeEmbedding =
        candidateEmbeddingResult.rows[0]
          .resume_embedding;
    }

    //------------------------------------------------
    // Generate Resume Embedding
    //------------------------------------------------

    if (!resumeEmbedding) {
      const response = await fetch(
        `${FLASK_API_URL}/resume-embedding`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            resume_blob: resumeBlob,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        return Response.json(
          {
            message:
              data.error ||
              'Failed to create resume embedding',
          },
          {
            status: 500,
          }
        );
      }

      resumeEmbedding =
        data.embedding;

      await pool.query(
        `
        INSERT INTO candidatesmatch
        (
          candidate_id,
          resume_embedding
        )
        VALUES
        (
          $1,
          $2::vector
        )
        ON CONFLICT(candidate_id)
        DO UPDATE SET
        resume_embedding =
        EXCLUDED.resume_embedding
        `,
        [
          candidateId,
          `[${resumeEmbedding.join(',')}]`,
        ]
      );
    }

    //------------------------------------------------
    // Job Embedding
    //------------------------------------------------

    let jobEmbedding = null;

    const jobEmbeddingResult =
      await pool.query(
        `
        SELECT description_embedding
        FROM jobmatching
        WHERE job_id = $1
        LIMIT 1
        `,
        [jobId]
      );

    if (
      jobEmbeddingResult.rows.length > 0 &&
      jobEmbeddingResult.rows[0]
        .description_embedding
    ) {
      jobEmbedding =
        jobEmbeddingResult.rows[0]
          .description_embedding;
    }

    //------------------------------------------------
    // Generate Job Embedding
    //------------------------------------------------

    if (!jobEmbedding) {
      const response = await fetch(
        `${FLASK_API_URL}/embedding`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            text: jobDescription,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        return Response.json(
          {
            message:
              data.error ||
              'Failed to create job embedding',
          },
          {
            status: 500,
          }
        );
      }

      jobEmbedding =
        data.embedding;

      await pool.query(
        `
        INSERT INTO jobmatching
        (
          job_id,
          description_embedding
        )
        VALUES
        (
          $1,
          $2::vector
        )
        ON CONFLICT(job_id)
        DO UPDATE SET
        description_embedding =
        EXCLUDED.description_embedding
        `,
        [
          jobId,
          `[${jobEmbedding.join(',')}]`,
        ]
      );
    }

    //------------------------------------------------
    // Return
    //------------------------------------------------

    return Response.json({
      success: true,
      resume_embedding:
        resumeEmbedding,
      job_embedding:
        jobEmbedding,
    });
  } catch (error) {
    console.error(
      'Embedding Route Error:',
      error
    );

    return Response.json(
      {
        message:
          error.message ||
          'Embedding route failed',
      },
      {
        status: 500,
      }
    );
  }
}