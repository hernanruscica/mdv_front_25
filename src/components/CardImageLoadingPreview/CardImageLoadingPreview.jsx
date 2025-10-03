import React, {useState} from 'react';
import styles from './CardImageLoadingPreview.module.css';

const CardImageLoadingPreview = (props) => {
    const { imageFileName, setNewImageHandler } = props;     
    const [newImage, setNewImage] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewImage(file);
        setNewImageHandler(file);
    };

    return (
        <div className={styles.cardLocationDetails}>
            <div className={styles.locationDetailsContainer}>
                {newImage ? (
                    <img
                        src={URL.createObjectURL(newImage)}
                        alt="Vista previa"
                        className={styles.locationDetailsContainerImage}
                    />
                ) : (
                    <img
                        src={(imageFileName.startsWith('default')) ? `/images/${imageFileName}` : imageFileName }
                        alt="foto de perfil"
                        title="foto de perfil"
                        className={styles.locationDetailsContainerImage}
                    />
                )}
            </div>
            <div className={styles.locationDetailsInfo}>
                <p className={styles.paragraph}>
                    Haciendo click en el boton de abajo, puede subir una nueva foto. 
                </p>

                <div className={styles.cardLocationDetailsBtnContainer}>
                    <label htmlFor="file_upload" className={styles.editButton}>
                        <img 
                            src={`/icons/folder-open-regular.svg`} 
                            style={{width: '20px'}}
                            alt="icono de subir archivos" 
                        />
                        <span>subir archivo</span>
                    </label>
                    <input 
                        type="file" 
                        id='file_upload'
                        accept="image/*" 
                        onChange={handleImageChange}                       
                        style={{display: 'none'}} 
                    />
                </div>
            </div>
        </div>
    );
};

export default CardImageLoadingPreview;

