import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useReportStore } from '../../store/reportStore';
import styles from './ReportPreview.module.css';

const ReportExportButton = ({ reportContentRef, chartSectionRef }) => {
  const { loadingStates } = useReportStore();

  const handleExportPdf = async () => {
    if (!reportContentRef?.current) return;

    try {
      // 1. Capturar contenido principal (sin gráfico)
      const contentCanvas = await html2canvas(reportContentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // 2. Crear PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 3. Agregar página 1: Contenido sin gráfico
      const contentImg = contentCanvas.toDataURL('image/png');
      const contentRatio = Math.min(190 / contentCanvas.width, 277 / contentCanvas.height);
      const contentImgWidth = contentCanvas.width * contentRatio;
      const contentImgHeight = contentCanvas.height * contentRatio;
      const contentImgX = (190 - contentImgWidth) / 2;
      const contentImgY = 10;
      
      pdf.addImage(contentImg, 'PNG', contentImgX, contentImgY, contentImgWidth, contentImgHeight);

      // 4. Si hay gráfico seleccionado, agregar página 2 (apaisada/landscape)
      if (chartSectionRef?.current) {
        const chartCanvas = await html2canvas(chartSectionRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const chartImg = chartCanvas.toDataURL('image/png');
        
        pdf.addPage('a4', 'landscape');  // Página en landscape (apaisada)
        
        // Agregar gráfico en orientación landscape: 297mm x 190mm
        const chartRatio = Math.min(297 / chartCanvas.width, 190 / chartCanvas.height);
        const chartImgWidth = chartCanvas.width * chartRatio;
        const chartImgHeight = chartCanvas.height * chartRatio;
        const chartImgX = (297 - chartImgWidth) / 2;
        const chartImgY = 10;
        
        pdf.addImage(chartImg, 'PNG', chartImgX, chartImgY, chartImgWidth, chartImgHeight);
      }

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