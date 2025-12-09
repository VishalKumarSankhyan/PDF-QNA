// import { useState } from "react";

// const API_BASE = "http://127.0.0.1:5000"; // Flask backend

// function App() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [pdfUrl, setPdfUrl] = useState(null);

//   const [summary, setSummary] = useState("");
//   const [keypoints, setKeypoints] = useState("");
//   const [summaryLoading, setSummaryLoading] = useState(false);
//   const [keypointsLoading, setKeypointsLoading] = useState(false);

//   const [question, setQuestion] = useState("");
//   const [chatLoading, setChatLoading] = useState(false);
//   const [messages, setMessages] = useState([]);

//   const [activeTab, setActiveTab] = useState("chat");

//   const handleFileChange = (e) => {
//     setSelectedFile(e.target.files[0] || null);
//   };

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     if (!selectedFile) return;

//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     try {
//       const res = await fetch(`${API_BASE}/upload-pdf`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       console.log("Upload response:", data);

//       // Show PDF preview if backend returns pdf_url
//       if (data.pdf_url) {
//         const fullPdfUrl = `${API_BASE}${data.pdf_url}`;
//         // Add some viewer params if you want (like toolbar, nav)
//         setPdfUrl(fullPdfUrl + "#toolbar=1&navpanes=1&scrollbar=1");
//       }

//       if (!res.ok) {
//         alert(data.error || "Upload / indexing failed");
//         return;
//       }

//       // Indexing success → reset & fetch summary/keypoints
//       setMessages([]);
//       setSummary("");
//       setKeypoints("");
//       fetchSummary();
//       fetchKeypoints();
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong during upload.");
//     }
//   };

//   const fetchSummary = async () => {
//     setSummaryLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/summary`);
//       const data = await res.json();
//       if (res.ok) {
//         setSummary(data.summary || "");
//       } else {
//         console.error(data.error);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setSummaryLoading(false);
//     }
//   };

//   const fetchKeypoints = async () => {
//     setKeypointsLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/keypoints`);
//       const data = await res.json();
//       if (res.ok) {
//         setKeypoints(data.keypoints || "");
//       } else {
//         console.error(data.error);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setKeypointsLoading(false);
//     }
//   };

//   const handleAsk = async (e) => {
//     e.preventDefault();
//     const q = question.trim();
//     if (!q) return;

//     const newMessages = [
//       ...messages,
//       { sender: "user", text: q },
//     ];
//     setMessages(newMessages);
//     setQuestion("");
//     setChatLoading(true);

//     try {
//       const res = await fetch(`${API_BASE}/ask`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ question: q }),
//       });
//       const data = await res.json();

//       if (!res.ok) {
//         setMessages([
//           ...newMessages,
//           { sender: "bot", text: data.error || "Error from backend" },
//         ]);
//         return;
//       }

//       setMessages([
//         ...newMessages,
//         { sender: "bot", text: data.answer },
//       ]);
//     } catch (err) {
//       console.error(err);
//       setMessages([
//         ...newMessages,
//         { sender: "bot", text: "Request failed." },
//       ]);
//     } finally {
//       setChatLoading(false);
//     }
//   };

//   return (
//     <div className="app-root">
//       {/* Top bar */}
//       <header className="app-header">
//         <div className="logo-section">
//           <div className="logo-icon">AI</div>
//           <div>
//             <div className="logo-title">PDF AI Assistant</div>
//             <div className="logo-subtitle">
//               Upload a PDF, preview it, ask questions & get summaries
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleUpload} className="upload-form">
//           <label className="upload-label">
//             <span className="upload-text">
//               {selectedFile ? selectedFile.name : "Select PDF"}
//             </span>
//             <input
//               type="file"
//               accept="application/pdf"
//               onChange={handleFileChange}
//             />
//           </label>
//           <button
//             type="submit"
//             className="primary-btn"
//             disabled={!selectedFile}
//           >
//             Index & Analyze
//           </button>
//         </form>
//       </header>

//       {/* Main layout */}
//       <main className="app-main">
//         {/* Left - PDF viewer */}
//         <section className="pdf-viewer">
//           {pdfUrl ? (
//             <iframe
//               title="PDF Preview"
//               src={pdfUrl}
//               className="pdf-frame"
//             />
//           ) : (
//             <div className="pdf-placeholder">
//               <p>No PDF loaded yet.</p>
//               <p>
//                 Use <span className="highlight">Select PDF</span> and{" "}
//                 <span className="highlight">Index & Analyze</span> above to
//                 upload a document.
//               </p>
//             </div>
//           )}
//         </section>

//         {/* Right - AI panel */}
//         <section className="side-panel">
//           {/* Tabs */}
//           <div className="tabs">
//             <button
//               className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
//               onClick={() => setActiveTab("chat")}
//             >
//               💬 Chat
//             </button>
//             <button
//               className={`tab-btn ${activeTab === "summary" ? "active" : ""}`}
//               onClick={() => setActiveTab("summary")}
//             >
//               📝 Summary
//             </button>
//             <button
//               className={`tab-btn ${activeTab === "keypoints" ? "active" : ""}`}
//               onClick={() => setActiveTab("keypoints")}
//             >
//               📌 Key Points
//             </button>
//           </div>

//           <div className="tab-content">
//             {/* Chat Tab */}
//             {activeTab === "chat" && (
//               <div className="chat-tab">
//                 <div className="quick-actions">
//                   <button onClick={fetchSummary}>
//                     🔍 Summarize PDF
//                   </button>
//                   <button onClick={fetchKeypoints}>
//                     📎 Get Key Points
//                   </button>
//                 </div>

//                 <div className="messages">
//                   {messages.length === 0 && (
//                     <div className="empty-chat-hint">
//                       Ask anything like:
//                       <ul>
//                         <li>“Give me an overview of this PDF.”</li>
//                         <li>“What are the main findings?”</li>
//                         <li>“Explain the conclusion section.”</li>
//                       </ul>
//                     </div>
//                   )}

//                   {messages.map((m, idx) => (
//                     <div
//                       key={idx}
//                       className={
//                         "message-row " +
//                         (m.sender === "user" ? "align-right" : "align-left")
//                       }
//                     >
//                       <div
//                         className={
//                           "message-bubble " +
//                           (m.sender === "user" ? "user" : "bot")
//                         }
//                       >
//                         <div className="sender-label">
//                           {m.sender === "user" ? "You" : "AI"}
//                         </div>
//                         <div>{m.text}</div>
//                       </div>
//                     </div>
//                   ))}

//                   {chatLoading && (
//                     <div className="message-row align-left">
//                       <div className="message-bubble bot">
//                         <div className="sender-label">AI</div>
//                         <div className="typing-dots">
//                           <span />
//                           <span />
//                           <span />
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <form className="chat-input-bar" onSubmit={handleAsk}>
//                   <input
//                     type="text"
//                     placeholder="Ask a question about the PDF..."
//                     value={question}
//                     onChange={(e) => setQuestion(e.target.value)}
//                   />
//                   <button
//                     type="submit"
//                     className="primary-btn"
//                     disabled={chatLoading || !question.trim()}
//                   >
//                     Ask
//                   </button>
//                 </form>
//               </div>
//             )}

//             {/* Summary Tab */}
//             {activeTab === "summary" && (
//               <div className="text-panel">
//                 <div className="text-panel-body">
//                   {summaryLoading ? (
//                     <p>Generating summary...</p>
//                   ) : summary ? (
//                     <pre>{summary}</pre>
//                   ) : (
//                     <p>
//                       No summary yet. Upload a PDF and use{" "}
//                       <span className="highlight">Summarize PDF</span> from the
//                       Chat tab.
//                     </p>
//                   )}
//                 </div>
//                 <div className="text-panel-footer">
//                   <button
//                     className="secondary-btn"
//                     onClick={fetchSummary}
//                     disabled={summaryLoading}
//                   >
//                     Refresh Summary
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Keypoints Tab */}
//             {activeTab === "keypoints" && (
//               <div className="text-panel">
//                 <div className="text-panel-body">
//                   {keypointsLoading ? (
//                     <p>Extracting key points...</p>
//                   ) : keypoints ? (
//                     <pre>{keypoints}</pre>
//                   ) : (
//                     <p>
//                       No key points yet. Upload a PDF and use{" "}
//                       <span className="highlight">Get Key Points</span> from the
//                       Chat tab.
//                     </p>
//                   )}
//                 </div>
//                 <div className="text-panel-footer">
//                   <button
//                     className="secondary-btn"
//                     onClick={fetchKeypoints}
//                     disabled={keypointsLoading}
//                   >
//                     Refresh Key Points
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }

// export default App;



import { useState } from "react";

import './app.css'

const API_BASE = "http://127.0.0.1:5000"; // Flask backend

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const [summary, setSummary] = useState("");
  const [keypoints, setKeypoints] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [keypointsLoading, setKeypointsLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const [activeTab, setActiveTab] = useState("chat");
  const [assistantOpen, setAssistantOpen] = useState(true);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${API_BASE}/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Upload response:", data);

      // Show PDF preview if backend returns pdf_url
      if (data.pdf_url) {
        const fullPdfUrl = `${API_BASE}${data.pdf_url}`;
        setPdfUrl(fullPdfUrl + "#toolbar=1&navpanes=1&scrollbar=1");
      }

      if (!res.ok) {
        alert(data.error || "Upload / indexing failed");
        return;
      }

      // Indexing success → reset & fetch summary/keypoints
      setMessages([]);
      setSummary("");
      setKeypoints("");
      fetchSummary();
      fetchKeypoints();
    } catch (err) {
      console.error(err);
      alert("Something went wrong during upload.");
    }
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/summary`);
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary || "");
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchKeypoints = async () => {
    setKeypointsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/keypoints`);
      const data = await res.json();
      if (res.ok) {
        setKeypoints(data.keypoints || "");
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setKeypointsLoading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    const newMessages = [
      ...messages,
      { sender: "user", text: q },
    ];
    setMessages(newMessages);
    setQuestion("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages([
          ...newMessages,
          { sender: "bot", text: data.error || "Error from backend" },
        ]);
        return;
      }

      setMessages([
        ...newMessages,
        { sender: "bot", text: data.answer },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { sender: "bot", text: "Request failed." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="app-root">
      {/* Global top bar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-dot">AI</div>
          <div className="topbar-text">
            <div className="topbar-title">PDF AI Studio</div>
            <div className="topbar-subtitle">Reader + Chat + Summarizer</div>
          </div>
        </div>

        <form onSubmit={handleUpload} className="topbar-right">
          <label className="file-label">
            <span className="file-label-text">
              {selectedFile ? selectedFile.name : "Choose PDF"}
            </span>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </label>
          <button
            type="submit"
            className="btn primary"
            disabled={!selectedFile}
          >
            Index & Analyze
          </button>
        </form>
      </header>

      {/* Main layout */}
      <div className="main-layout">
        {/* Left vertical toolbar (like Adobe icons) */}
        {/* <aside className="left-toolbar">
          <button className="toolbar-icon active" title="Pages">
            ⬛
          </button>
          <button className="toolbar-icon" title="Bookmarks">
            ★
          </button>
          <button className="toolbar-icon" title="Search">
            🔍
          </button>
          <button className="toolbar-icon" title="Comment">
            💬
          </button>
          <div className="toolbar-spacer" />
          <button
            className="toolbar-icon"
            title={assistantOpen ? "Hide Assistant" : "Show Assistant"}
            onClick={() => setAssistantOpen(!assistantOpen)}
          >
            🤖
          </button>
        </aside>*/}

        {/* Center viewer area */}
        <section className={`viewer-shell ${assistantOpen ? "" : "full-width"}`}>
          {/* PDF toolbar row (like Adobe) */}
          <div className="viewer-toolbar">
            <div className="viewer-file-info">
              <div className="file-name">
                {selectedFile ? selectedFile.name : "No file selected"}
              </div>
              <div className="file-meta">
                {pdfUrl ? "Ready • Indexed" : "Upload a PDF to start"}
              </div>
            </div>
            { /*<div className="viewer-controls">
              
              <button className="toolbar-btn small" title="Zoom Out">
                -
              </button>
              <span className="zoom-text">100%</span>
              <button className="toolbar-btn small" title="Zoom In">
                +
              </button>
              <div className="divider-vertical" />
              <button
                className="toolbar-btn small"
                type="button"
                title="Summarize PDF"
                onClick={fetchSummary}
              >
                Summary
              </button>
              <button
                className="toolbar-btn small"
                type="button"
                title="Key Points"
                onClick={fetchKeypoints}
              >
                Key Points
              </button>
            </div>*/}
          </div>

          {/* PDF content */}
          <div className="viewer-content">
            {pdfUrl ? (
              <iframe
                title="PDF Preview"
                src={pdfUrl}
                className="pdf-frame"
              />
            ) : (
              <div className="pdf-placeholder">
                <p className="placeholder-title">No PDF loaded</p>
                <p className="placeholder-text">


                  <form onSubmit={handleUpload} className="placeholder-text">
                    <label className="highlight" style={{'margin-top': '5px' ,'margin-right': '10px', 'cursor': 'pointer'}}>
                      <span className="file-label-text">
                        {selectedFile ? selectedFile.name : "Choose PDF"}
                      </span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange} hidden={true}
                      />
                    </label>


                    <button
                      type="submit"
                      className="highlight placeholder-text-btn"
                      disabled={!selectedFile}

                      style={{'margin-right': '10px', 'cursor': 'pointer'}}
                    >
                      Index & Analyze
                    </button>
                  </form>

                  to open a document.

                  {/* Use <span className="highlight">Choose PDF</span> and{" "}
                  <span className="highlight">Index & Analyze</span> to open a
                  document. */}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right AI assistant panel */}
        <aside
          className={
            "assistant-panel" + (assistantOpen ? " open" : " collapsed")
          }
        >
          <div className="assistant-header">
            <div>
              <div className="assistant-title">AI Assistant</div>
              <div className="assistant-subtitle">
                Ask, summarize & extract insights
              </div>
            </div>
            {/* <button
              className="assistant-toggle"
              onClick={() => setAssistantOpen(!assistantOpen)}
            >
              {assistantOpen ? "➜" : "⇦"}
            </button> */}
          </div>

          {/* Tabs */}
          <div className="assistant-tabs">
            <button
              className={
                "assistant-tab" + (activeTab === "chat" ? " active" : "")
              }
              onClick={() => setActiveTab("chat")}
            >
              Chat
            </button>
            <button
              className={
                "assistant-tab" + (activeTab === "summary" ? " active" : "")
              }
              onClick={() => setActiveTab("summary")}
            >
              Summary
            </button>
            <button
              className={
                "assistant-tab" + (activeTab === "keypoints" ? " active" : "")
              }
              onClick={() => setActiveTab("keypoints")}
            >
              Key Points
            </button>
          </div>

          {/* Tab content */}
          <div className="assistant-body">
            {/* Chat */}
            {activeTab === "chat" && (
              <div className="chat-tab">
                {/* <div className="chat-quick-row">
                  <button onClick={() => { fetchSummary(); setActiveTab("summary"); }}>Summarize this PDF</button>
                  <button onClick={() => { fetchKeypoints(); setActiveTab("keypoints"); }}>Extract key points</button>
                </div> */}

                <div className="messages">
                  {messages.length === 0 && (
                    <div className="empty-chat">
                      <div className="empty-title">Try asking:</div>
                      <ul>
                        <li>“Give me an overview of this document.”</li>
                        <li>“What are the main findings?”</li>
                        <li>“Explain the conclusion in simple terms.”</li>
                      </ul>
                    </div>
                  )}

                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={
                        "message-row " +
                        (m.sender === "user" ? "align-right" : "align-left")
                      }
                    >
                      <div
                        className={
                          "message-bubble " +
                          (m.sender === "user" ? "user" : "bot")
                        }
                      >
                        <div className="sender-label">
                          {m.sender === "user" ? "You" : "AI"}
                        </div>
                        <div>{m.text}</div>
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="message-row align-left">
                      <div className="message-bubble bot">
                        <div className="sender-label">AI</div>
                        <div className="typing-dots">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <form className="chat-input" onSubmit={handleAsk}>
                  <input
                    type="text"
                    placeholder="Ask anything about this PDF..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn primary"
                    disabled={chatLoading || !question.trim()}
                  >
                    Ask
                  </button>
                </form>
              </div>
            )}

            {/* Summary */}
            {activeTab === "summary" && (
              <div className="text-panel">
                <div className="text-panel-body">
                  {summaryLoading ? (
                    <p>Generating summary...</p>
                  ) : summary ? (
                    <pre>{summary}</pre>
                  ) : (
                    <p>
                      No summary yet. Upload a PDF and choose{" "}
                      <span className="highlight">Summarize</span>.
                    </p>
                  )}
                </div>
                <div className="text-panel-footer">
                  <button
                    className="btn ghost"
                    onClick={fetchSummary}
                    disabled={summaryLoading}
                  >
                    Refresh Summary
                  </button>
                </div>
              </div>
            )}

            {/* Key Points */}
            {activeTab === "keypoints" && (
              <div className="text-panel">
                <div className="text-panel-body">
                  {keypointsLoading ? (
                    <p>Extracting key points...</p>
                  ) : keypoints ? (
                    <pre>{keypoints}</pre>
                  ) : (
                    <p>
                      No key points yet. Upload a PDF and choose{" "}
                      <span className="highlight">Key Points</span>.
                    </p>
                  )}
                </div>
                <div className="text-panel-footer">
                  <button
                    className="btn ghost"
                    onClick={fetchKeypoints}
                    disabled={keypointsLoading}
                  >
                    Refresh Key Points
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
