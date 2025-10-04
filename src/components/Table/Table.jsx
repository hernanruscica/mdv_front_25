import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';
import CustomTag from '../CustomTag/CustomTag';
import styles from './Table.module.css';
import BtnCallToAction from '../BtnCallToAction/BtnCallToAction';
import { useAuthStore } from '../../store/authStore';

const Table = ({ columns, data, onRowClick, showAddButton }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showArchived, setShowArchived] = useState(showAddButton);
  //const [showAddButton, setShowAddButton] = useState(true);
  const { user } = useAuthStore();

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

  const filteredData = useMemo(() => {
    // Primero filtramos por término de búsqueda
    let filtered = sortedData.filter(item =>
      columns.some(column =>
        item[column.accessor].toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Luego filtramos por estado si showArchived es false
    if (!showArchived) {
      filtered = filtered.filter(item => item.estado !== 0);
    }

    return filtered;
  }, [sortedData, columns, searchTerm, showArchived]);

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

  const handleCheckArchived = (e) => {
    setShowArchived(e.target.checked);
    //console.log('Mostrar archivados:', e.target.checked);
    
    //console.log('raw Data:', data);
  }

  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Si hay 5 o menos páginas, mostrar todas
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
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
      return buttons;
    }

    // Si hay más de 5 páginas, implementar lógica dinámica
    let pagesToShow = new Set();
    
    // Siempre agregar la página actual
    pagesToShow.add(currentPage);

    // Si estamos en la primera página o carga inicial
    if (currentPage === 1) {
      pagesToShow.add(2);
      pagesToShow.add(3);
      pagesToShow.add(4);
      pagesToShow.add(totalPages);
    } 
    // Si estamos en la última página
    else if (currentPage === totalPages) {
      pagesToShow.add(1);
      pagesToShow.add(2);
      pagesToShow.add(totalPages - 2);
      pagesToShow.add(totalPages - 1);
    }
    // Si estamos en cualquier otra página
    else {
      pagesToShow.add(1);
      pagesToShow.add(2);
      if (currentPage > 2) pagesToShow.add(currentPage - 1);
      if (currentPage < totalPages - 1) pagesToShow.add(currentPage + 1);
      pagesToShow.add(totalPages);
    }

    // Convertir el Set a Array y ordenar
    return Array.from(pagesToShow)
      .sort((a, b) => a - b)
      .map(pageNum => (
        <button
          key={pageNum}
          onClick={() => setCurrentPage(pageNum)}
          className={currentPage === pageNum ? styles.activePage : ''}
        >
          {pageNum}
        </button>
      ));
  };

  //console.log('data', data[0].businessUuid, data[1].businessUuid);
  

  return (
    <div>
      <div className={styles.controls}>
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Buscar..." />
        {showAddButton && (
          <>          
            <BtnCallToAction 
              text="Agregar" 
              icon="plus-circle-solid.svg" 
              url={`/panel/ubicaciones/${data[0]?.businessUuid}/usuarios/agregar`}
            />
          

          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={handleCheckArchived}
            />
            <span>Mostrar también los archivados</span>
          </label>        
          </>        
        )}
        <span>Mostrando {filteredData.length} resultados</span>
        <div className={styles.pagination}>
          <span>Páginas: </span>
          {renderPaginationButtons()}
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
                <td key={column.accessor} data-label={column.label}>
                  {renderCellContent(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  );
};

export default Table;


const renderCellContent = (row, column) => {
  const content = row[column.accessor];
  
  // Caso especial para la columna estado
  if (column.accessor === 'estado') {
    const tagType = content === 0 ? 'archive' : 'success';
    const tagText = content === 0 ? 'Archivado' : 'Activo';
    const icon = `/icons/${content === 0 ? 'archive-solid.svg' : 'eye-regular-white.svg'}`;
    
    return (
      <CustomTag 
        text={tagText}
        type={tagType}
        icon={icon}
      />
    );
  }

  // Renderizado normal para otras columnas
  return (
    <div className={styles.cellContent}>
      {column.icon && <img 
        src={column.icon} 
        alt={content}
        className={styles.cellIcon}
      />}
      <span className={styles.cellText}>{content}</span>
    </div>
  );
};