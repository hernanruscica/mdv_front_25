import { useState } from "react";
import  styles  from "./InfoAccordion.module.css";

const InfoAccordion = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!data) return null;

  return (
    <div className={styles.accordionContainer}>
      <button className={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.titleArea}>
          <img src="/icons/circle-question.svg" alt="info" className={styles.icon} />
          <span>{data.title}</span>
        </div>
        <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className={styles.content}>
          {/* Renderizado de Párrafos */}
          {data.paragraphs.map((text, index) => (
            <p key={index}>{text}</p>
          ))}

          {/* Renderizado de Acciones (Solo si existen y tienen elementos) */}
          {data.actions && data.actions.length > 0 && (
            <div className={styles.actionsSection}>
              <h4 className={styles.actionsTitle}>Acciones de la página:</h4>
              <ul className={styles.actionsList}>
                {data.actions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InfoAccordion;