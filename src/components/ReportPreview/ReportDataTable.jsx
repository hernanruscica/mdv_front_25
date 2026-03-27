import styles from './ReportPreview.module.css';

const ReportDataTable = ({ columns, data, emptyMessage = 'Sin datos' }) => {
  if (!data || data.length === 0) {
    return <p className={styles.emptyMessage}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={styles.tableHeader}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={styles.tableRow}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={styles.tableCell}>
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportDataTable;
