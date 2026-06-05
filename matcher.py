import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import textract
import tempfile
import magic
from io import BytesIO
from pypdf import PdfReader
from docx import Document
import win32com.client


# --------------------------------------------------
# LOAD MODEL
# --------------------------------------------------

model = SentenceTransformer("all-MiniLM-L6-v2")


# --------------------------------------------------
# TEXT EXTRACTION
# --------------------------------------------------

def extract_text_from_blob(blob_data):
    """
    Extract text from PDF, DOC, DOCX, and TXT files.
    """

    mime_type = magic.from_buffer(blob_data, mime=True)

    print(f"Detected MIME Type: {mime_type}")

    # ==================================================
    # PDF
    # ==================================================
    if mime_type == "application/pdf":

        try:
            pdf_file = BytesIO(blob_data)
            reader = PdfReader(pdf_file)

            text = ""

            for page in reader.pages:
                page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

            if not text.strip():
                raise ValueError(
                    "Resume blob contains no extractable text. PDF appears to be image/scanned."
                )

            return text

        except Exception as e:
            raise ValueError(
                f"Unable to read PDF file: {str(e)}"
            )

    # ==================================================
    # DOCX
    # ==================================================
    elif mime_type in [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/zip"
    ]:

        try:
            docx_file = BytesIO(blob_data)

            doc = Document(docx_file)

            text = "\n".join(
                para.text
                for para in doc.paragraphs
                if para.text.strip()
            )

            if not text.strip():
                raise ValueError(
                    "DOCX contains no readable text."
                )

            return text

        except Exception as e:
            raise ValueError(
                f"Unable to read DOCX file: {str(e)}"
            )

    # ==================================================
    # DOC (OLD MICROSOFT WORD)
    # ==================================================
    elif mime_type == "application/msword":

      import pythoncom
      pythoncom.CoInitialize()
      try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".doc"
        ) as temp_file:

            temp_file.write(blob_data)
            temp_path = temp_file.name

        word = win32com.client.Dispatch("Word.Application")
        doc = word.Documents.Open(temp_path)

        text = doc.Content.Text

        doc.Close()
        word.Quit()

        return text

      except Exception as e:
        raise ValueError(
            f"Unable to read DOC file: {str(e)}"
        )
      finally:
        pythoncom.CoUninitialize()

        
    # ==================================================
    # TXT
    # ==================================================
    elif mime_type.startswith("text/"):

        try:

            text = blob_data.decode(
                "utf-8",
                errors="ignore"
            )

            if not text.strip():
                raise ValueError(
                    "Text file is empty."
                )

            return text

        except Exception as e:
            raise ValueError(
                f"Unable to read text file: {str(e)}"
            )

    # ==================================================
    # UNSUPPORTED
    # ==================================================
    else:

        raise ValueError(
            f"Unsupported file type: {mime_type}"
        )

# --------------------------------------------------
# EMBEDDING FUNCTIONS
# --------------------------------------------------

def create_resume_embedding(resume_text):
    return model.encode(
        resume_text,
        convert_to_numpy=True
    )


def create_job_embedding(job_desc):
    return model.encode(
        job_desc,
        convert_to_numpy=True
    )


def create_embeddings(text):
    """
    Create a single embedding.
    Used by Flask API.
    """
    return model.encode(
        text,
        convert_to_numpy=True
    )


# --------------------------------------------------
# HYBRID MATCHING
# --------------------------------------------------

def calculate_hybrid_similarity(
    job_desc,
    resume_text
):

    embedding_job = create_job_embedding(
        job_desc
    )

    embedding_resume = create_resume_embedding(
        resume_text
    )

    return calculate_hybrid_similarity_with_embeddings(
        job_desc,
        resume_text,
        embedding_job,
        embedding_resume
    )


def calculate_hybrid_similarity_with_embeddings(
    job_desc,
    resume_text,
    embedding_job,
    embedding_resume
):

    semantic_score = cosine_similarity(
        embedding_job.reshape(1, -1),
        embedding_resume.reshape(1, -1)
    )[0][0]

    vectorizer = TfidfVectorizer(
        stop_words="english"
    )

    tfidf_matrix = vectorizer.fit_transform(
        [job_desc, resume_text]
    )

    keyword_score = cosine_similarity(
        tfidf_matrix[0],
        tfidf_matrix[1]
    )[0][0]

    hybrid_score = (
        0.6 * semantic_score +
        0.4 * keyword_score
    )

    return {
        "semantic_score": round(
            float(semantic_score), 4
        ),
        "keyword_score": round(
            float(keyword_score), 4
        ),
        "hybrid_score": round(
            float(hybrid_score), 4
        ),
        "hybrid_percentage": round(
            float(hybrid_score * 100), 2
        )
    }


# --------------------------------------------------
# MATCH RESUME
# --------------------------------------------------

def match_resume(
    job_desc,
    resume_blob
):

    resume_text = extract_text_from_blob(
        resume_blob
    )

    result = calculate_hybrid_similarity(
        job_desc,
        resume_text
    )

    return result