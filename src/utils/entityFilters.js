/**
 * Filter entities by their status
 * @param {Array} entities - Array of entities to filter
 * @param {boolean} activeOnly - If true, returns only active entities (estado === 1)
 * @returns {Array} Filtered array of entities
 */
export const filterEntitiesByStatus = (entities = [], activeOnly = true) => {
  if (!Array.isArray(entities)) return [];
  
  return activeOnly 
    ? entities.filter(entity => entity.estado === 1)
    : entities;
};