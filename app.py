import json
import base64
import os
import tempfile
import win32com.client
import pythoncom
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

from matcher import (
    extract_text_from_blob,
    create_embeddings,
    calculate_hybrid_similarity_with_embeddings,
    model
)

app = Flask(__name__)
CORS(app)

# --------------------------------------------------
# EMBEDDING SERIALIZATION
# --------------------------------------------------

def serialize_embedding(embedding: np.ndarray) -> list:
    """Convert numpy array embedding to list for JSON serialization."""
    if embedding is None:
        return None
    return embedding.astype(float).tolist()


def deserialize_embedding(value) -> np.ndarray:
    """Convert JSON list or string back to numpy array."""
    if value is None:
        return None
    
    # Handle string JSON
    if isinstance(value, str):
        value = json.loads(value)
    
    return np.asarray(value, dtype=np.float32)


# --------------------------------------------------
# ROUTES
# --------------------------------------------------

@app.route("/", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "message": "Flask ML Service Running"}), 200

@app.route("/embedding", methods=["POST"])
def create_text_embedding():

    data = request.get_json()

    text = data.get("text")

    if not text:
        return jsonify({
            "error": "text is required"
        }), 400

    embedding = model.encode(
        text,
        convert_to_numpy=True
    )

    return jsonify({
        "embedding": embedding.tolist()
    })

@app.route("/resume-embedding", methods=["POST"])
def create_resume_embedding_route():

    data = request.get_json()

    resume_blob_b64 = data.get(
        "resume_blob"
    )

    if not resume_blob_b64:
        return jsonify({
            "error": "resume_blob missing"
        }), 400

    try:
        resume_blob = base64.b64decode(
            resume_blob_b64
        )

        resume_text = extract_text_from_blob(
            resume_blob
        )

        embedding = model.encode(
            resume_text,
            convert_to_numpy=True
        )

        return jsonify({
            "embedding":
            embedding.tolist()
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route("/match", methods=["POST"])
def match_candidate():
    """
    Match a candidate resume against a job description.
    
    Expected JSON input:
    {
        "candidate_id": 1,
        "job_id": 2,
        "job_description": "...",
        "resume_blob": "base64_encoded_string",
        "job_embedding": null or [...],
        "resume_embedding": null or [...]
    }
    """
    try:
        payload = request.get_json(silent=True)
        
        if not payload:
            return jsonify({"error": "Request body must be JSON"}), 400
        
        # Validate required fields
        required_fields = ["candidate_id", "job_id", "job_description", "resume_blob"]
        missing_fields = [f for f in required_fields if f not in payload]
        
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        candidate_id = payload.get("candidate_id")
        job_id = payload.get("job_id")
        job_description = payload.get("job_description")
        resume_blob_b64 = payload.get("resume_blob")
        job_embedding_input = payload.get("job_embedding")
        resume_embedding_input = payload.get("resume_embedding")
        
        # Validate types
        if not isinstance(candidate_id, int) or not isinstance(job_id, int):
            return jsonify({
                "error": "candidate_id and job_id must be integers"
            }), 400
        
        if not isinstance(job_description, str) or not job_description.strip():
            return jsonify({
                "error": "job_description must be a non-empty string"
            }), 400
        
        if not isinstance(resume_blob_b64, str) or not resume_blob_b64.strip():
            return jsonify({
                "error": "resume_blob must be a non-empty base64 string"
            }), 400
        
        # Decode base64 resume blob
        try:
            resume_blob = base64.b64decode(resume_blob_b64)
        except Exception as e:
            return jsonify({
                "error": f"Invalid base64 encoding for resume_blob: {str(e)}"
            }), 400
        
        # Extract text from resume blob
        try:
            resume_text = extract_text_from_blob(resume_blob)
            #print(resume_text[:500])
        except Exception as e:
            return jsonify({
                "error": f"Failed to extract text from resume: {str(e)}"
            }), 400
        
        if not resume_text or not resume_text.strip():
            return jsonify({
                "error": "Resume blob contains no extractable text"
            }), 400
        
        # Process job embedding
        created_job_embedding = False
        if job_embedding_input is None:
            try:
                job_embedding = create_embeddings(job_description)
                created_job_embedding = True
            except Exception as e:
                return jsonify({
                    "error": f"Failed to create job embedding: {str(e)}"
                }), 500
        else:
            try:
                job_embedding = deserialize_embedding(job_embedding_input)
            except Exception as e:
                return jsonify({
                    "error": f"Failed to deserialize job_embedding: {str(e)}"
                }), 400
        
        # Process resume embedding
        created_resume_embedding = False
        if resume_embedding_input is None:
            try:
                resume_embedding = create_embeddings(resume_text)
                created_resume_embedding = True
            except Exception as e:
                return jsonify({
                    "error": f"Failed to create resume embedding: {str(e)}"
                }), 500
        else:
            try:
                resume_embedding = deserialize_embedding(resume_embedding_input)
            except Exception as e:
                return jsonify({
                    "error": f"Failed to deserialize resume_embedding: {str(e)}"
                }), 400
        
        # Calculate hybrid similarity
        try:
            scores = calculate_hybrid_similarity_with_embeddings(
                job_description,
                resume_text,
                job_embedding,
                resume_embedding
            )
            '''if candidate_id == 395:
                print("Job Description:")
                print(job_description[:500])

                print("\nResume Text:")
                print(resume_text[:1000])

                print("\nSemantic Score:", scores["semantic_score"])
                print("Keyword Score:", scores["keyword_score"])'''
        except Exception as e:
            return jsonify({
                "error": f"Failed to calculate similarity scores: {str(e)}"
            }), 500
        
        # Return response with embeddings
        return jsonify({
            "candidate_id": candidate_id,
            "job_id": job_id,
            "scores": scores,
            "created_job_embedding": created_job_embedding,
            "created_resume_embedding": created_resume_embedding,
            "job_embedding": serialize_embedding(job_embedding),
            "resume_embedding": serialize_embedding(resume_embedding)
        }), 200

       
    
    except Exception as e:
        return jsonify({
            "error": f"Unexpected error: {str(e)}"
        }), 500


@app.route("/convert-doc", methods=["POST"])
def convert_doc_route():
    pythoncom.CoInitialize()
    temp_in_path = None
    temp_out_path = None
    word = None
    doc = None
    try:
        data = request.get_json(silent=True)
        if not data or "doc_bytes" not in data:
            return jsonify({"error": "doc_bytes (base64 encoded) is required in JSON body"}), 400
        
        doc_bytes = base64.b64decode(data["doc_bytes"])
        
        # Save to temp .doc file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".doc") as temp_in:
            temp_in.write(doc_bytes)
            temp_in_path = temp_in.name
            
        temp_out_path = temp_in_path + "x" # .docx
        
        # Open in Word and save as docx
        # FileFormat=16 is wdFormatXMLDocument (docx)
        word = win32com.client.DispatchEx("Word.Application")
        word.Visible = False
        
        doc = word.Documents.Open(temp_in_path)
        doc.SaveAs2(temp_out_path, FileFormat=16)
        
        doc.Close(False)
        del doc
        doc = None
        
        word.Quit()
        del word
        word = None
            
        # Read the docx file
        with open(temp_out_path, "rb") as temp_out:
            docx_bytes = temp_out.read()
            
        return jsonify({
            "docx_bytes": base64.b64encode(docx_bytes).decode("utf-8")
        }), 200
        
    except Exception as e:
        print("Error during doc to docx conversion:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        if doc:
            try:
                doc.Close(False)
            except Exception:
                pass
            del doc
        if word:
            try:
                word.Quit()
            except Exception:
                pass
            del word
        pythoncom.CoUninitialize()
        for path in [temp_in_path, temp_out_path]:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except Exception as cleanup_err:
                    print(f"Cleanup error: {cleanup_err}")


# --------------------------------------------------
# ERROR HANDLERS
# --------------------------------------------------

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad Request"}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal Server Error"}), 500


# --------------------------------------------------
# MAIN
# --------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)