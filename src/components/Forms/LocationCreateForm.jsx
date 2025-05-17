import React,{ useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';

export const LocationCreateForm = ({ locationData, isEditing }) => {
    const navigate = useNavigate();   
    const { user: userStore } = useAuthStore();
    const { createLocation, updateLocation, loadingStates } = useLocationsStore();
    const [profileImage, setProfileImage] = useState("default_location.png");
    const [newImage, setNewImage] = useState("");
    
    const [location, setLocation] = useState({     
        nombre: "", 
        descripcion: "", 
        foto: "", 
        telefono: "", 
        email: "",           
    });    

    useEffect(() => {
        if (isEditing && locationData) {
            setLocation({
                nombre: locationData.nombre || "",
                descripcion: locationData.descripcion || "",
                foto: locationData.foto || "",
                telefono: locationData.telefono || "",
                email: locationData.email || "",
            });
            setProfileImage(locationData.foto || "default_location.png");
        }
    }, [locationData, isEditing]);
    
    const handleChange = (e) => {
        setLocation({
            ...location,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();       
        const formData = new FormData();        
        // Datos básicos
        formData.append("nombre", location.nombre || "");
        formData.append("descripcion", location.descripcion || "");
        formData.append("telefono", location.telefono || "");
        formData.append("email", location.email || "");
        
        // Manejo de la imagen con depuración
        if (newImage instanceof File) {            
            formData.append("foto", newImage);
        } else {
            formData.append("foto", profileImage || "default_location.png");
        }
        
        // Datos adicionales
        formData.append("usuarios_id", userStore.id.toString());
        formData.append("calle", "calle falsa");
        formData.append("numero", "1234");
        formData.append("localidad", "54");
        formData.append("partido", "14");
        formData.append("provincia", "02");
        formData.append("codigo_postal", "1478");
        formData.append("latitud", "0");
        formData.append("longitud", "0");

        try {
            if (isEditing) {
                formData.append("id", locationData.id);
                const response = await updateLocation(locationData.id, formData);
                navigate(`/panel/ubicaciones/${locationData.id}`);
                toast.success('Ubicación actualizada exitosamente');
            } else {                
                const response = await createLocation(formData);
                const newLocationId = response.location.id;
                navigate(`/panel/ubicaciones/${newLocationId}`);
                toast.success('Ubicación creada exitosamente');
            }
        } catch (error) {
            console.error("Error detallado al procesar la ubicación:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            toast.error('Error al procesar la ubicación');
        }
    };    
    
    return (        
        <form onSubmit={handleSubmit} className={stylesForms.form}>
            <CardImageLoadingPreview
                imageFileName={profileImage}
                setNewImageHandler={setNewImage}
            /> 
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        value={location.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>            
                <div className={stylesForms.formInput}>
                    <label htmlFor="telefono">Teléfono:</label>
                    <input
                        type="text"
                        name="telefono"
                        id="telefono"
                        value={location.telefono}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={location.email}
                        onChange={handleChange}
                        required
                    />
                </div>               
            </div>
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea
                        className={stylesForms.formInputTextarea}
                        name="descripcion"
                        id="descripcion"
                        value={location.descripcion}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            

            <button type="submit" className={stylesForms.formBtn}>
                Guardar Ubicación
            </button>
        </form>
    )
};



