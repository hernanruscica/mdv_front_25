import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';

import styles from './ButtonsBar.module.css';

const ButtonsBar = (props) => {
    const {itemsName, itemsQty, itemsActiveQty, showAddButton = false, children} = props;
    let itemNameCleaned = itemsName.split('/');
    itemNameCleaned = itemNameCleaned.length > 1 ? itemNameCleaned.pop() : itemNameCleaned;

    return (
        <div className={styles.buttonsBar}>
            {(showAddButton) ?
            <BtnCallToAction
                text="Agregar"
                icon="plus-circle-solid.svg"
                type="normal"
                url={`/panel/${itemsName}/agregar`}
            />      
               
            : ''}
            {children}
            <span>Mostrando <strong>{itemsQty - itemsActiveQty || "0"} resultados</strong> </span>   
            
        </div>
    )
}

export default ButtonsBar