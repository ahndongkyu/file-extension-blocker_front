import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';
import './components/Modal.css';

function App() {
  const [fixedExtensions, setFixedExtensions] = useState([]);
  const [selectedFixed, setSelectedFixed] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [customTags, setCustomTags] = useState([]);
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadLogs, setUploadLogs] = useState([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const fileInputRef = useRef();

  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 7;

  // 파일명 길이 줄임
  const shortenFilename = (name, max = 30) => {
    return name.length > max ? `${name.slice(0, max)}...` : name;
  };

  // 업로드 로그의 시간 정보를 YY.MM.DD HH:MM 형식으로 변환
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    return `${yy}.${mm}.${dd} ${hh}:${mi}`;
  };

  // 서버에서 고정/커스텀 확장자 목록 불러오기
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/extensions`)
      .then((res) => {
        const fixed = res.data.fixed;
        const custom = res.data.custom;

        setFixedExtensions(fixed);
        setSelectedFixed(
          fixed.filter((ext) => ext.checked).map((ext) => ext.extension)
        );
        setCustomTags(custom.map((ext) => ext.extension));
      })
      .catch((err) => console.error('확장자 불러오기 실패:', err));
  }, []);

  // 로컬스토리지에서 이전 업로드 로그 불러오기
  useEffect(() => {
    const savedLogs = localStorage.getItem('uploadLogs');
    if (savedLogs) {
      setUploadLogs(JSON.parse(savedLogs));
    }
  }, []);

  // 업로드 로그 변경 시 로컬스토리지에 저장
  useEffect(() => {
    localStorage.setItem('uploadLogs', JSON.stringify(uploadLogs));
  }, [uploadLogs]);

  // 고정 확장자 상태 업데이트
  const handleCheckboxChange = (ext) => {
    const updated = selectedFixed.includes(ext)
      ? selectedFixed.filter((e) => e !== ext)
      : [...selectedFixed, ext];

    setSelectedFixed(updated);

    axios
      .patch(`${process.env.REACT_APP_API_URL}/extensions/fixed`, {
        selected: updated,
      })
      .then(() => {
        const msg = selectedFixed.includes(ext)
          ? `"${ext}" 확장자 차단 해제됨.`
          : `"${ext}" 확장자 차단 목록에 추가됨.`;
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(() => {
        setMessage('서버 통신 오류 발생.');
        setTimeout(() => setMessage(''), 3000);
      });
  };

  // 커스텀 확장자 추가
  const handleAddCustom = () => {
    const trimmed = customInput.trim().toLowerCase();
    const isValid = /^[a-z0-9]{1,20}$/.test(trimmed);

    if (!trimmed || !isValid) {
      alert('영문 소문자와 숫자만 입력 (1~20자)');
      return;
    }
    if (customTags.includes(trimmed)) {
      alert('이미 추가된 확장자입니다.');
      return;
    }
    if (customTags.length >= 200) {
      alert('최대 200개까지 추가 가능');
      return;
    }

    axios
      .post(`${process.env.REACT_APP_API_URL}/extensions/custom`, {
        extension: trimmed,
      })
      .then(() => {
        setCustomTags((prev) => [...prev, trimmed]);
        setCustomInput('');
        setMessage(`"${trimmed}" 확장자 추가됨.`);
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(() => {
        alert('커스텀 확장자 추가 실패');
      });
  };

  // 커스텀 확장자 삭제
  const handleDeleteTag = (ext) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/extensions/custom/${ext}`)
      .then(() => {
        setCustomTags((prev) => prev.filter((e) => e !== ext));
        setMessage(`"${ext}" 확장자 삭제됨.`);
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(() => console.error('커스텀 삭제 실패'));
  };

  // 파일 업로드 시 확장자 검사 및 업로드 허용 여부 판단, 로그 기록
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newLogs = [];

    const filtered = files.filter((file) => {
      const ext = file.name.split('.').pop().toLowerCase();
      const isBlocked = selectedFixed.includes(ext) || customTags.includes(ext);
      const timestamp = new Date();

      newLogs.push({
        filename: file.name,
        extension: ext,
        blocked: isBlocked,
        timestamp,
      });

      if (isBlocked) {
        alert(`차단된 확장자: .${ext}`);
        e.target.value = '';
        return false;
      }
      return true;
    });

    if (newLogs.length > 0) setUploadLogs((prev) => [...newLogs, ...prev]); // 최신 로그를 앞에 추가
    if (filtered.length === 0) return;
    setUploadedFiles((prev) => [...prev, ...filtered]);
  };

  // 업로드된 파일 목록에서 파일 제거
  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 업로드 로그 전체 초기화 및 로컬스토리지 초기화
  const clearLogs = () => {
    setUploadLogs([]);
    localStorage.removeItem('uploadLogs');
  };

  // 페이지네이션
  const totalPages = Math.ceil(uploadLogs.length / logsPerPage);
  const currentLogs = uploadLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  return (
    <div className='app-container'>
      <div className='message-placeholder'>
        {message && <div className='message'>{message}</div>}
      </div>

      <h2>파일 확장자 차단</h2>

      {/* 고정 확장자 */}
      <div className='section'>
        <label className='label'>고정 확장자</label>
        <div className='fixed-list'>
          {fixedExtensions.map((ext) => (
            <label className='checkbox' key={ext.id}>
              <input
                type='checkbox'
                checked={selectedFixed.includes(ext.extension)}
                onChange={() => handleCheckboxChange(ext.extension)}
              />
              {ext.extension}
            </label>
          ))}
        </div>
      </div>

      {/* 커스텀 확장자 */}
      <div className='section'>
        <label className='label'>커스텀 확장자</label>
        <div className='custom-input-wrap'>
          <input
            type='text'
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder='확장자 입력'
            maxLength={20}
          />
          <button onClick={handleAddCustom}>+추가</button>
        </div>
        <div className='custom-tags'>
          {customTags.map((tag) => (
            <div className='tag' key={tag}>
              {tag}
              <button onClick={() => handleDeleteTag(tag)}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* 파일 업로드 */}
      <div className='section'>
        <label className='label'>파일 업로드</label>

        {/* 클릭 업로드 */}
        <input
          type='file'
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
        />

        {/* 업로드 목록 */}
        {uploadedFiles.length > 0 && (
          <ul className='upload-list'>
            {uploadedFiles.map((file, idx) => (
              <li key={idx}>
                {file.name}
                <button onClick={() => handleRemoveFile(idx)}>삭제</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 업로드 시도 로그 보기 */}
      <div className='section'>
        <h3
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {
            setCurrentPage(1);
            setIsLogModalOpen(true);
          }}
        >
          업로드 시도 로그 보기
        </h3>
      </div>

      {/* 모달 */}
      {isLogModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <h3>업로드 시도 로그</h3>
            {uploadLogs.length === 0 ? (
              <p>로그가 없습니다.</p>
            ) : (
              <>
                <table className='log-table'>
                  <thead>
                    <tr>
                      <th>파일명</th>
                      <th>확장자</th>
                      <th>차단 여부</th>
                      <th>시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td>{shortenFilename(log.filename)}</td>
                        <td>.{log.extension}</td>
                        <td>{log.blocked ? '차단' : '허용'}</td>
                        <td>{formatDate(log.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className='pagination'>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={currentPage === i + 1 ? 'active' : ''}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className='modal-buttons'>
              <button onClick={clearLogs}>로그 초기화</button>
              <button onClick={() => setIsLogModalOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
