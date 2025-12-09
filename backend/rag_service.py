import os
from typing import Optional

from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    Settings,
    StorageContext,
    load_index_from_storage,
)
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.core.node_parser import SentenceSplitter




from llama_index.core import Settings



# ---------- Paths (relative to backend folder) ----------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
PERSIST_DIR = os.path.join(BASE_DIR, "storage")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(PERSIST_DIR, exist_ok=True)

# ---------- LlamaIndex / Ollama Settings ----------

# Settings.llm = Ollama(
#     model="llama3:8b-instruct-q4_0",  # make sure it's pulled in Ollama
#     request_timeout=60.0,
#     model_kwargs={
#         "num_predict": 256,  # limit answer length -> faster
#     },
# )

# Settings.embed_model = OllamaEmbedding(model_name="nomic-embed-text")


OLLAMA_BASE = "http://127.0.0.1:11434"

Settings.llm = Ollama(
    model="llama3:8b-instruct-q4_0",
    base_url=OLLAMA_BASE,
    request_timeout=120.0,
)

Settings.embed_model = OllamaEmbedding(
    model_name="nomic-embed-text",
    base_url=OLLAMA_BASE,
    request_timeout=120.0,
)



# CHUNK_SIZE = 768
# CHUNK_OVERLAP = 50

CHUNK_SIZE = 512      # was 1024 or 2048
CHUNK_OVERLAP = 50

Settings.text_splitter = SentenceSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
)

# ---------- Globals ----------

_index: Optional[VectorStoreIndex] = None
_query_engine = None


# ---------- Core Helpers ----------

def _build_index_from_data() -> VectorStoreIndex:
    """
    Build a new index from PDFs in DATA_DIR and persist it.
    """
    if not os.listdir(DATA_DIR):
        raise FileNotFoundError(
            f"No files found in '{DATA_DIR}'. Upload at least one PDF."
        )

    print(f"🔍 Loading documents from: {DATA_DIR}")
    documents = SimpleDirectoryReader(input_dir=DATA_DIR).load_data()

    print(f"📚 Found {len(documents)} document(s). Indexing...")
    idx = VectorStoreIndex.from_documents(documents)

    idx.storage_context.persist(persist_dir=PERSIST_DIR)
    print("💾 Index built & saved to disk.")

    return idx


def _load_index_from_disk() -> VectorStoreIndex:
    """
    Load existing index from PERSIST_DIR.
    """
    storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
    idx = load_index_from_storage(storage_context)
    print("✅ Index loaded from disk.")
    return idx


def _create_query_engine(idx: VectorStoreIndex):
    qe = idx.as_query_engine(
        similarity_top_k=3,
        response_mode="compact",
    )
    return qe


def rebuild_index():
    """
    Force rebuild the index from whatever is in DATA_DIR.
    """
    global _index, _query_engine
    _index = _build_index_from_data()
    _query_engine = _create_query_engine(_index)


def load_index_if_available():
    """
    Load index from disk if available (used at startup).
    """
    global _index, _query_engine

    if os.path.exists(PERSIST_DIR) and os.listdir(PERSIST_DIR):
        try:
            _index = _load_index_from_disk()
            _query_engine = _create_query_engine(_index)
        except Exception as e:
            print(f"⚠️ Failed to load index from disk: {e}")
            _index = None
            _query_engine = None
    else:
        print("ℹ️ No existing index found to load.")


def has_index() -> bool:
    return _query_engine is not None


# ---------- High-level operations used by Flask ----------

def ask_pdf(question: str) -> str:
    if _query_engine is None:
        raise RuntimeError("No index loaded")
    response = _query_engine.query(question)
    return response.response.strip()


def summarize_pdf() -> str:
    if _query_engine is None:
        raise RuntimeError("No index loaded")

    prompt = (
        "You are analyzing this PDF document. "
        "Provide a clear, structured summary in 6–10 bullet points. "
        "Include purpose, main sections, methodology (if any), and key conclusions."
    )
    response = _query_engine.query(prompt)
    return response.response.strip()


def extract_keypoints() -> str:
    if _query_engine is None:
        raise RuntimeError("No index loaded")

    prompt = (
        "Extract the most important key points / takeaways from this document. "
        "Return them as a numbered list of short, crisp points."
    )
    response = _query_engine.query(prompt)
    return response.response.strip()


# ---------- Initialize at import ----------

try:
    load_index_if_available()
except Exception as e:
    print(f"⚠️ Initialization warning: {e}")
