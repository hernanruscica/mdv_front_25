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

  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Botón Anterior
    if (currentPage > 1) {
      buttons.push(
        <button key="prev" onClick={() => setCurrentPage(prev => prev - 1)}>
          Anterior
        </button>
      );
    }

    // Página actual y páginas cercanas
    if (currentPage === 1) {
      // Si estamos en la primera página
      buttons.push(
        <button key={1} className={styles.activePage}>1</button>
      );
      
      // Mostrar las siguientes páginas
      for (let i = 2; i <= Math.min(4, totalPages); i++) {
        buttons.push(
          <button key={i} onClick={() => setCurrentPage(i)}>
            {i}
          </button>
        );
      }
    } else if (currentPage === totalPages) {
      // Si estamos en la última página
      buttons.push(
        <button key={1} onClick={() => setCurrentPage(1)}>1</button>
      );
      
      if (totalPages > 4) {
        buttons.push(<span key="dots">...</span>);
      }
      
      // Mostrar las últimas páginas
      for (let i = Math.max(totalPages - 3, 2); i < totalPages; i++) {
        buttons.push(
          <button key={i} onClick={() => setCurrentPage(i)}>
            {i}
          </button>
        );
      }
      
      // Última página seleccionada
      buttons.push(
        <button key={totalPages} className={styles.activePage}>
          {totalPages}
        </button>
      );
    } else {
      // Si estamos en una página intermedia
      buttons.push(
        <button key={1} onClick={() => setCurrentPage(1)}>1</button>
      );

      // Páginas alrededor de la página actual
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 2, totalPages - 1); i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={currentPage === i ? styles.activePage : ''}
          >
            {i}
          </button>
        );
      }
      
      // Última página
      if (totalPages > 4 && currentPage < totalPages - 2) {
        buttons.push(<span key="dots">...</span>);
        buttons.push(
          <button key={totalPages} onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </button>
        );
      }
    }

    // Botón Siguiente
    if (currentPage < totalPages) {
      buttons.push(
        <button key="next" onClick={() => setCurrentPage(prev => prev + 1)}>
          Siguiente
        </button>
      );
    }

    return buttons;
  };

  return (
    <div>
      <div className={styles.controls}>
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Buscar..." />
        <span>Mostrando {filteredData.length} resultados</span>
        <div className={styles.pagination}>
          Páginas: {renderPaginationButtons()}
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