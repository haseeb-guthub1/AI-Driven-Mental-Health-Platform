// import React, { useState } from 'react';
// import axios from 'axios';
// import { getCurrentUser } from '../services/authService';

// const Journal = () => {
//     const [entry, setEntry] = useState('');
//     const [isSaving, setIsSaving] = useState(false);
//     const user = getCurrentUser();

//     const maxLength = 1000;

//     const saveEntry = async () => {
//         if (!entry.trim()) return;

//         setIsSaving(true);
//         try {
//             await axios.post('http://127.0.0.1:8000/api/emotion-data/', {
//                 user_id: user.user_id,
//                 text_content: entry,
//                 timestamp: new Date().toISOString()
//             });
//             alert("Journal saved. Your mood is being analyzed 💙");
//             setEntry('');
//         } catch (err) {
//             console.error("Save failed", err);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     return (
//         <div className="journal-container">
//             <h1>Daily Reflection</h1>
//             <p className="journal-subtitle">
//                 Take a moment to express how you're feeling today.
//             </p>

//             <div className="journal-date">
//                 {new Date().toLocaleDateString()}
//             </div>

//             <textarea
//                 placeholder="How are you feeling today?"
//                 value={entry}
//                 maxLength={maxLength}
//                 onChange={(e) => setEntry(e.target.value)}
//             />

//             <div className="journal-footer">
//                 <span className="char-count">
//                     {entry.length}/{maxLength}
//                 </span>

//                 <button
//                     onClick={saveEntry}
//                     className="main-btn"
//                     disabled={isSaving || !entry.trim()}
//                 >
//                     {isSaving ? 'Saving...' : 'Save Entry'}
//                 </button>
//             </div>

//             <p className="journal-disclaimer">
//                 Your journal is private and used only to support your emotional wellbeing.
//             </p>
//         </div>
//     );
// };

// export default Journal;
