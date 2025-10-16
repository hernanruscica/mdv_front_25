import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import SearchBar from '../SearchBar/SearchBar';
import styles from './ButtonsBar.module.css';

/*
Muestra una barra de botones para interactuar con la lista de ítems:
showAddButton: si es true, se muestra el botón de agregar dicho item
addLink: link al que lleva el botón de agregar
itemsName: string con el nombre del item en plural y en minúsculas, ej: 'usuarios', 'dataloggers', 'canales', 'ubicaciones'
items: array con todos los ítems (activos y archivados)
filteredItems: array con los ítems a mostrar después de aplicar filtros
searchTerm: término de búsqueda para filtrar los ítems
onSearchChange: función que se llama cuando cambia el término de búsqueda
showArchived: booleano que indica si se deben mostrar los ítems archivados
onShowArchivedChange: función que se llama cuando cambia el estado de mostrar archivados
*/
const ButtonsBar = (props) => {
    const {
        itemsName,
        items = [],
        filteredItems = [],
        showAddButton = false,
        addLink = '/panel',
        searchTerm,
        onSearchChange,
        showArchived,
        onShowArchivedChange,
    } = props;

    // Calcula las cantidades directamente de las props
    const itemsArchivedQty = items.filter(item => item.is_active == 0).length;
    const itemsFilteredQty = filteredItems.length;

    return (
        <div className={styles.buttonsBar}>
            {showAddButton && (
                <BtnCallToAction
                    text="Agregar"
                    icon="plus-circle-solid.svg"
                    type="normal"
                    url={`/panel/${addLink}/agregar`}
                />
            )}
            
            <div className={styles.controls}>
                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={onSearchChange}
                    placeholder={`Buscar ${itemsName}...`}
                />
                <span>
                    Mostrando <strong>{itemsFilteredQty} resultados</strong>
                </span>
                {showAddButton && itemsArchivedQty > 0 && (
                    <label className={styles.checkboxContainer}>
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={(e) => onShowArchivedChange(e.target.checked)}
                            className={styles.checkbox}
                        />
                        <img
                            src={!showArchived ? `/icons/eye-regular.svg` : `/icons/eye-slash-regular.svg`}
                            className={styles.showIcon}
                        />
                        <span>{!showArchived ? 'Mostrar' : 'Ocultar'} {itemsArchivedQty} archivados</span>
                    </label>
                )}
            </div>
            
        </div>
    );
};

export default ButtonsBar
