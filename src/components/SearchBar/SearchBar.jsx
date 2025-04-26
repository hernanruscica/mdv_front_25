import React from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ({ searchTerm, onSearchChange, placeholder }) => {
  return (
    <div className={styles.searchContainer}>
      <img 
        src="/icons/search-solid-grey.svg" 
        alt="Buscar"
        className={styles.searchIcon}
      />
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder || "Buscar..."}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;