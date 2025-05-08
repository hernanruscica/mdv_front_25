import React,{ useState, useEffect} from 'react'
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useLocationUsersStore } from '../../store/locationUsersStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';

export const DataloggerCreateForm = ({ dataloggerData, isEditing }) => {
    const { user: userStore } = useAuthStore();
    const [profileImage, setProfileImage] = useState("default_datalogger.webp"); 
    const [newImage, setNewImage] = useState(""); 
    
    const { 
        locationUsers, 
        fetchLocationUsers,
        loadingStates: { fetchLocationUsers: loadingLocationUsers },
        error 
    } = useLocationUsersStore();
    
    const [datalogger, setDatalogger] = useState({ 
        direccion_mac: "", 
        nombre: "", 
        descripcion: "", 
        foto: "", 
        nombre_tabla: "", 
        ubicacion_id: ""    
    }); 

    useEffect(() => {
        if (isEditing && dataloggerData) {
            setDatalogger({
                direccion_mac: dataloggerData.direccion_mac || "",
                nombre: dataloggerData.nombre || "",
                descripcion: dataloggerData.descripcion || "",
                foto: dataloggerData.foto || "",
                nombre_tabla: dataloggerData.nombre_tabla || "",
                ubicacion_id: dataloggerData.ubicacion_id || ""
            })
        }
    }, [dataloggerData, isEditing])

    useEffect(() => {
        if (userStore) {
            fetchLocationUsers(userStore);
        }
    }, [userStore]);

    useEffect(() => {
        if (locationUsers && locationUsers.length > 0 && !isEditing) {
            setDatalogger(prev => ({
                ...prev,
                ubicacion_id: locationUsers[0].ubicaciones_id
            }));
        }
    }, [locationUsers, isEditing]);
    
    const handleChange = (e) => {
        setDatalogger({
            ...datalogger,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();    
        const formData = new FormData();
        formData.append("direccion_mac", datalogger.direccion_mac || "");
        formData.append("nombre", datalogger.nombre || "");
        formData.append("descripcion", datalogger.descripcion || "");
        formData.append("foto", newImage || "default_datalogger.webp");
        formData.append("nombre_tabla", datalogger.nombre_tabla || "");
        formData.append("ubicacion_id", datalogger.ubicacion_id || "");
        if (isEditing) {
            formData.append("id", dataloggerData.id);
            console.log("enviando datos EDITADOS del datalogger", formData);            
        }else{
            console.log("enviando datos para CREAR el datalogger", formData);            
        }        
    };

    if (loadingLocationUsers) {
        return <div>Cargando ubicaciones...</div>;
    }

    if (error) {
        return <div>Error al cargar las ubicaciones: {error}</div>;
    }
    console.log(dataloggerData)
    return (        
        <form onSubmit={handleSubmit} className={stylesForms.form}>
            <CardImageLoadingPreview
                imageFileName={(isEditing) ? datalogger.foto : profileImage}
                setNewImageHandler={setNewImage}
            /> 
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        value={datalogger.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="nombre_tabla">Nombre de Tabla:</label>
                    <input
                        type="text"
                        name="nombre_tabla"
                        id="nombre_tabla"
                        value={datalogger.nombre_tabla}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="direccion_mac">Dirección MAC:</label>
                    <input
                        type="text"
                        name="direccion_mac"
                        id="direccion_mac"
                        value={datalogger.direccion_mac}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="ubicacion_id">Ubicación:</label>
                    <select
                        name="ubicacion_id"
                        id="ubicacion_id"
                        value={datalogger.ubicacion_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione una ubicación</option>
                        {locationUsers.map((location) => (
                            <option 
                                key={location.ubicaciones_id} 
                                value={location.ubicaciones_id}
                            >
                                {location.ubicaciones_nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea
                        className={stylesForms.formInputTextarea}
                        name="descripcion"
                        id="descripcion"
                        value={datalogger.descripcion}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            <div className={stylesForms.formInputGroup}>
                
            </div>

            <button type="submit" className={stylesForms.formBtn}>
              Guardar datalogger
            </button>
        </form>
    );
};



