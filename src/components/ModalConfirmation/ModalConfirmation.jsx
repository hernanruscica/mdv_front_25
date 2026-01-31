import ModalTemplate from "../ModalTemplate/ModalTemplate";
import styles from "../ModalTemplate/ModalTemplate.module.css"

const ModalConfirmation = ({
    title='Confirmar eliminación',
    mesagge='Realmente quiere eliminar el elemento?',
    isOpen,
    onRequestClose,
    handleAccept = () => null
    }) => {
    return(
        <ModalTemplate
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            title={title}
            buttons={[
                { title: 'Cancelar', onClick: onRequestClose },
                { title: 'Aceptar', onClick: handleAccept }
            ]}
            customStyles={{
                overlay: { zIndex: 2000 },
                content: { zIndex: 2001 }
            }}
            >
            <p>
                {mesagge}<br/><br/>            
                <span className={styles.textDanger}>ATENCION: ESTE PROCESO NO SE PUEDE REVERTIR!</span>
            </p>
        </ModalTemplate>
    )
}
export default ModalConfirmation;