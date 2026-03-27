import styles from './ReportPreview.module.css';

const ReportSection = ({ title, icon, children, isPlaceholder = false }) => {
  return (
    <div className={`${styles.reportSection} ${isPlaceholder ? styles.sectionPlaceholder : ''}`}>
      <h3 className={styles.sectionTitle}>
        {icon && <img src={icon} alt="" className={styles.sectionIcon} />}
        {title}
        {isPlaceholder && <span className={styles.placeholderBadge}>Pendiente</span>}
      </h3>
      <div className={styles.sectionContent}>
        {children}
      </div>
    </div>
  );
};

export default ReportSection;
