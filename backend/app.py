import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from rag_service import (
    DATA_DIR,
    PERSIST_DIR,
    rebuild_index,
    ask_pdf,
    summarize_pdf,
    extract_keypoints,
    has_index,
)

app = Flask(__name__)
CORS(app)  # allow React localhost

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(PERSIST_DIR, exist_ok=True)


# ---------- Routes ----------

@app.route("/upload-pdf", methods=["POST"])
def upload_pdf():
    """
    Upload PDF, clear old data, rebuild index.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(DATA_DIR, filename)

    # Clear old PDFs & index for single-document mode
    for f in os.listdir(DATA_DIR):
        try:
            os.remove(os.path.join(DATA_DIR, f))
        except Exception:
            pass

    for f in os.listdir(PERSIST_DIR):
        try:
            os.remove(os.path.join(PERSIST_DIR, f))
        except Exception:
            pass

    file.save(save_path)

    try:
        rebuild_index()
    except Exception as e:
        return jsonify({"error": f"Failed to build index: {str(e)}"}), 500

    pdf_url = f"/pdf/{filename}"

    return jsonify({
        "message": "File uploaded and indexed successfully",
        "filename": filename,
        "pdf_url": pdf_url
    })


@app.route("/pdf/<path:filename>", methods=["GET"])
def serve_pdf(filename):
    """
    Serve PDF file to React for preview.
    """
    return send_from_directory(DATA_DIR, filename)


@app.route("/ask", methods=["POST"])
def ask():
    """
    Ask a question about the uploaded PDF.
    """
    if not has_index():
        return jsonify({"error": "No index loaded. Upload a PDF first."}), 400

    data = request.get_json(silent=True) or {}
    question = data.get("question", "").strip()
    if not question:
        return jsonify({"error": "Missing 'question' in body"}), 400

    try:
        answer = ask_pdf(question)
        return jsonify({"question": question, "answer": answer})
    except Exception as e:
        return jsonify({"error": f"Query failed: {str(e)}"}), 500


@app.route("/summary", methods=["GET"])
def summary():
    """
    Get summary of the current PDF.
    """
    if not has_index():
        return jsonify({"error": "No index loaded. Upload a PDF first."}), 400

    try:
        text = summarize_pdf()
        return jsonify({"summary": text})
    except Exception as e:
        return jsonify({"error": f"Summary failed: {str(e)}"}), 500


@app.route("/keypoints", methods=["GET"])
def keypoints():
    """
    Get key points of the current PDF.
    """
    if not has_index():
        return jsonify({"error": "No index loaded. Upload a PDF first."}), 400

    try:
        text = extract_keypoints()
        return jsonify({"keypoints": text})
    except Exception as e:
        return jsonify({"error": f"Keypoint extraction failed: {str(e)}"}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "index_loaded": has_index()})


if __name__ == "__main__":
    # Run Flask
    app.run(host="0.0.0.0", port=5000, debug=True)
