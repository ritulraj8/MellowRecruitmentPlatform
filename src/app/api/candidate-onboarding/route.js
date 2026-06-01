import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req) {
  try {
    const formData = await req.formData();

    const candidateId = Number(formData.get('candidateId')?.toString().trim() || '');
    const firstName = formData.get('firstName')?.toString().trim() || '';
    const lastName = formData.get('lastName')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const phone = formData.get('phone')?.toString().trim() || '';
    const dob = formData.get('dob')?.toString().trim() || '';
    const resumeFile = formData.get('resume');

    if (!firstName || !lastName || !email || !phone || !dob) {
      return Response.json(
        { message: 'All fields except resume are required.' },
        { status: 400 }
      );
    }

    if (firstName.length > 50 || lastName.length > 50) {
      return Response.json(
        { message: 'First name and last name must not exceed 50 characters.' },
        { status: 400 }
      );
    }

    const resumeBytes = resumeFile ? Buffer.from(await resumeFile.arrayBuffer()) : null;

    if (candidateId && !Number.isNaN(candidateId)) {
      const existingEmail = await pool.query(
        'SELECT id FROM "CANDIDATES" WHERE email = $1 AND id <> $2 LIMIT 1',
        [email, candidateId]
      );

      if (existingEmail.rows.length > 0) {
        return Response.json(
          { message: 'Another candidate with this email already exists.' },
          { status: 409 }
        );
      }

      const updateFields = [firstName, lastName, email, phone, dob, candidateId];
      let updateQuery = 'UPDATE "CANDIDATES" SET first_name = $1, last_name = $2, email = $3, phone = $4, date_of_birth = $5';

      if (resumeBytes) {
        updateQuery += ', resume_path = $6 WHERE id = $7';
        updateFields.splice(5, 0, resumeBytes);
      } else {
        updateQuery += ' WHERE id = $6';
      }

      const result = await pool.query(updateQuery, updateFields);
      if (result.rowCount === 0) {
        return Response.json(
          { message: 'Candidate not found.' },
          { status: 404 }
        );
      }

      return Response.json(
        {
          success: true,
          message: 'Candidate details updated successfully.',
          candidateId,
        },
        { status: 200 }
      );
    }

    if (!resumeBytes) {
      return Response.json(
        { message: 'Resume file is required for new candidates.' },
        { status: 400 }
      );
    }

    const existingResult = await pool.query(
      'SELECT * FROM "CANDIDATES" WHERE email = $1 LIMIT 1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      return Response.json(
        { message: 'Candidate with this email already exists.' },
        { status: 409 }
      );
    }

    const result = await pool.query(
      'INSERT INTO "CANDIDATES" (first_name, last_name, email, phone, date_of_birth, resume_path, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id',
      [firstName, lastName, email, phone, dob, resumeBytes]
    );

    const newCandidateId = result.rows[0].id;

    return Response.json(
      {
        success: true,
        message: 'Candidate details saved successfully.',
        candidateId: newCandidateId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving candidate:', error.message);
    console.error('Error details:', error);

    return Response.json(
      { message: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

