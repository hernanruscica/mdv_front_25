import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';
import styles from './Table.module.css';

const Table = ({ columns, data, onRowClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const filteredData = sortedData.filter(item =>
    columns.some(column =>
      item[column.accessor].toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleRowClick = (row) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <div>
      <div className={styles.controls}>
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Buscar..." />
        <span>Mostrando {filteredData.length} resultados</span>
        <div className={styles.pagination}>
          Páginas: 
            {currentPage > 1 && (
            <button onClick={() => setCurrentPage(prev => prev - 1)}>Anterior</button>
            )}
            {[...Array(totalPages)].map((_, index) => (
            <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                disabled={currentPage === index + 1}
                className={currentPage === index + 1 ? styles.activePage : ''}
            >
                {index + 1}
            </button>
            ))}
            {currentPage < totalPages && (
            <button onClick={() => setCurrentPage(prev => prev + 1)}>Siguiente</button>
            )}
        </div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.accessor} onClick={() => requestSort(column.accessor)}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr 
              key={index}
              onClick={() => handleRowClick(row)}
              className={styles.clickableRow}
            >
              {columns.map(column => (
                <td key={column.accessor}>{row[column.accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  );
};

export default Table;