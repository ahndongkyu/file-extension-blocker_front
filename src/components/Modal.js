import ReactDOM from 'react-dom';
import './Modal.css';

function Modal({ onClose, children }) {
  return ReactDOM.createPortal(
    <div className='modal-overlay'>
      <div className='modal-content'>
        <button className='modal-close' onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') // ← index.html에 추가한 div
  );
}

export default Modal;
