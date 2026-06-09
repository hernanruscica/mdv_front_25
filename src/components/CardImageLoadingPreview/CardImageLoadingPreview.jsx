import React, {useState} from 'react';
import toast from 'react-hot-toast';
import styles from './CardImageLoadingPreview.module.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const CardImageLoadingPreview = (props) => {
    const { imageFileName, setNewImageHandler } = props;     
    const [newImage, setNewImage] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error('Formato no permitido. Usá JPG, PNG, WebP o GIF.');
            e.target.value = '';
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('La imagen supera los 5 MB permitidos.');
            e.target.value = '';
            return;
        }

        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            toast.error('Extensión de archivo no permitida.');
            e.target.value = '';
            return;
        }

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

