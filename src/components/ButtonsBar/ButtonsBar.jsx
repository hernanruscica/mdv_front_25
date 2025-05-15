import React from 'react'
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';

import styles from './ButtonsBar.module.css';

const ButtonsBar = (props) => {
    const {itemsName, itemsQty, showAddButton = false, children} = props;
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
            <span>Mostrando <strong>{itemsQty || "0"}</strong> {itemNameCleaned}</span>   
            
        </div>
    )
}

export default ButtonsBar