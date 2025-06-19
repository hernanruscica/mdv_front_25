import React from 'react';
import ReactModal from 'react-modal';
import styles from './ModalTemplate.module.css';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';

ReactModal.setAppElement('#root'); // Ajusta esto según tu estructura

const ModalTemplate = ({ isOpen, onRequestClose, title, children, buttons = [] }) => (
  <ReactModal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    className={styles.modal}
    overlayClassName={styles.overlay}
    shouldCloseOnOverlayClick={true}
  >
    <div className={styles.header}>
      <h2>{title}</h2>
      <button className={styles.closeBtn} onClick={onRequestClose}>&times;</button>
    </div>
    <div className={styles.content}>
      {children}
    </div>
    <div className={styles.buttons}>
      {buttons.map((btnProps, idx) => (
        <CardBtnSmall key={idx} {...btnProps} />
      ))}
    </div>
  </ReactModal>
);

export default ModalTemplate;