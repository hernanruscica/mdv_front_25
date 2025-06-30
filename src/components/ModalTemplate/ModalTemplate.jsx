import React from 'react';
import ReactModal from 'react-modal';
import styles from './ModalTemplate.module.css';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';

//ReactModal.setAppElement('#root'); // Ajusta esto según tu estructura

const ModalTemplate = ({ isOpen, onRequestClose, title, children, buttons = [] }) => (
  <ReactModal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    className={styles.modalContent}
    overlayClassName={styles.modalOverlay}
    shouldCloseOnOverlayClick={true}
  >
    <div className={styles.modalHeader}>
      <h2 className={styles.modalTitle}>{title}</h2>
    </div>
    
    <div className={styles.modalBody}>
      {children}
    </div>
    
    <div className={styles.modalFooter}>
      {buttons.map((btnProps, idx) => (
        <CardBtnSmall key={idx} {...btnProps} />
      ))}
    </div>
  </ReactModal>
);

export default ModalTemplate;