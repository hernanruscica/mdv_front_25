import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useReportStore } from '../../store/reportStore';
import styles from './ReportPreview.module.css';

const ReportExportButton = ({ reportRef }) => {
  const { loadingStates } = useReportStore();

  const handleExportPdf = async () => {
    if (!reportRef?.current) return;

    const element = reportRef.current;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 20) / imgHeight);

      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('informe-canal.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <button
      onClick={handleExportPdf}
      disabled={loadingStates.exportPdf}
      className={styles.exportButton}
    >
      <img src="/icons/file-pdf.svg" alt="" className={styles.exportIcon} />
      {loadingStates.exportPdf ? 'Exportando...' : 'Exportar PDF'}
    </button>
  );
};

export default ReportExportButton;
