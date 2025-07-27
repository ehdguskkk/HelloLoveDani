'use client';
import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Qna } from './adminTypes';

export default function QnaAdmin() {
  const [qnas, setQnas] = useState<Qna[]>([]);
  const [answerInputs, setAnswerInputs] = useState<{ [id: string]: string }>({});
  const [editing, setEditing] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    getDocs(collection(db, "qna")).then(snap =>
      setQnas(snap.docs.map(d => ({ id: d.id, ...d.data() } as Qna)))
    );
  }, []);

  const handleInputChange = (id: string, value: string) => {
    setAnswerInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleAnswerSubmit = async (qna: Qna) => {
    if (!answerInputs[qna.id]) return;
    await updateDoc(doc(db, "qna", qna.id), { answer: answerInputs[qna.id] });
    setQnas(prev =>
      prev.map(item => item.id === qna.id ? { ...item, answer: answerInputs[qna.id] } : item)
    );
    setAnswerInputs(prev => ({ ...prev, [qna.id]: "" }));
    setEditing(prev => ({ ...prev, [qna.id]: false }));
  };

  const handleEditClick = (qna: Qna) => {
    setEditing(prev => ({ ...prev, [qna.id]: true }));
    setAnswerInputs(prev => ({ ...prev, [qna.id]: qna.answer || "" }));
  };

  return (
    <div className="border p-4 rounded mb-10 max-w-xl">
      <h2 className="font-bold mb-2">Q&A 관리</h2>
      <ul>
        {qnas.map(q => (
          <li key={q.id} className="mb-3 border-b pb-2">
            <div>
              <b>상품ID:</b> {q.productId} | {q.user} | Q: {q.question}
            </div>
            <div>
              A: {editing[q.id] ? (
                <>
                  <input
                    className="border rounded px-2 py-1 mr-2"
                    type="text"
                    value={answerInputs[q.id] || ""}
                    onChange={e => handleInputChange(q.id, e.target.value)}
                    placeholder="답변을 입력하세요"
                    style={{ width: 200 }}
                  />
                  <button
                    className="bg-blue-400 px-2 py-1 rounded text-white mr-2"
                    onClick={() => handleAnswerSubmit(q)}
                  >저장</button>
                  <button
                    className="bg-gray-300 px-2 py-1 rounded"
                    onClick={() => setEditing(prev => ({ ...prev, [q.id]: false }))}
                  >취소</button>
                </>
              ) : q.answer ? (
                <>
                  <span>{q.answer}</span>
                  <button
                    className="ml-2 bg-yellow-300 px-2 py-1 rounded"
                    onClick={() => handleEditClick(q)}
                  >수정</button>
                </>
              ) : (
                <>
                  <input
                    className="border rounded px-2 py-1 mr-2"
                    type="text"
                    value={answerInputs[q.id] || ""}
                    onChange={e => handleInputChange(q.id, e.target.value)}
                    placeholder="답변을 입력하세요"
                    style={{ width: 200 }}
                  />
                  <button
                    className="bg-yellow-300 px-2 py-1 rounded"
                    onClick={() => handleAnswerSubmit(q)}
                  >답변 등록</button>
                </>
              )}
            </div>
            <div>{q.createdAt}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}