import { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useLocationUsersStore } from '../../store/locationUsersStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';

export const DataloggerCreateForm = ({ locationData, dataloggerData, isEditing }) => {
    const [newImage, setNewImage] = useState(null); // Changed to null to properly check for file
    const [profileImage, setProfileImage] = useState("default_datalogger.png");    
    const { user: userStore } = useAuthStore();
    const { 
        locationUsers, 
        fetchLocationUsers,
        loadingStates: { fetchLocationUsers: loadingLocationUsers },
        error 
    } = useLocationUsersStore();
    
    const [datalogger, setDatalogger] = useState({ 
        mac_address: "", 
        name: "", 
        description: "", 
        image: "default_datalogger.webp", // Default image name
        table_name: "", 
        is_active: true, // Added is_active field
        business_uuid: locationData?.uuid || "", // Added business_uuid
    }); 

    useEffect(() => {
        if (isEditing && dataloggerData) {
            setDatalogger({
                mac_address: dataloggerData.mac_address || "",
                name: dataloggerData.name || "",
                description: dataloggerData.description || "",
                image: dataloggerData.image || "default_datalogger.webp",
                table_name: dataloggerData.table_name || "",
                is_active: dataloggerData.is_active, // Initialize is_active
                business_uuid: dataloggerData?.business_uuid || "", // Initialize business_uuid
            })
            setProfileImage(dataloggerData?.img || "default_location.png");
        }
        /* else 
            
            if (!isEditing && userStore) {
            setDatalogger(prev => ({
                ...prev,
                business_uuid: userStore.business_uuid || ""
            }));
        }*/

    }, [dataloggerData, isEditing, userStore]);

    useEffect(() => {
        if (userStore && !locationUsers) { // Fetch only if not already fetched
            fetchLocationUsers(userStore);
        }
    }, [userStore, fetchLocationUsers, locationUsers]);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDatalogger({
            ...datalogger,
            [name]:  value,
        });
    };

    const navigate = useNavigate();
    const { createDatalogger, updateDatalogger } = useDataloggersStore();

    const handleSubmit = async (e) => {
        e.preventDefault();    
        const formData = new FormData();
        formData.append("name", datalogger.name || "");
        formData.append("description", datalogger.description || "");
        formData.append("mac_address", datalogger.mac_address || "");
        formData.append("table_name", datalogger.table_name || "");
        formData.append("is_active", datalogger.is_active); // Boolean value
        formData.append("businessUuid", datalogger.business_uuid);

        if (newImage) {
            formData.append("image", newImage); // Append the File object
        } else if (!isEditing && datalogger.image) {
            // For creation, if no new image is selected, but a default image name exists,
            // we might need to handle it differently or ensure backend handles default.
            // For now, if newImage is null and not editing, we don't send 'image' field
            // unless it's a default string that the backend expects.
            // Based on backend examples, if no image is provided, it's omitted.
            // If a default image is needed, the backend should handle it.
        }

        // business_uuid is only needed for POST, and it's part of the URL for PUT
        if (!isEditing && datalogger.business_uuid) {
            formData.append("businessUuid", datalogger.business_uuid);
        }

        try {
            let response;
           // console.log('dataloggerData', dataloggerData);
            
            if (isEditing) {
                response = await updateDatalogger(dataloggerData?.uuid, formData);
                toast.success('Datalogger actualizado con éxito');
                navigate(`/panel/ubicaciones/${dataloggerData?.business_uuid}/dataloggers/${dataloggerData?.uuid}`);
            } else {
                response = await createDatalogger(datalogger.business_uuid, formData);
                toast.success(response.message);
                if (response.success){                    
                    navigate(`/panel/ubicaciones/${locationData?.uuid}/dataloggers/${response.item?.uuid}`);
                }
            }        
        } catch (error) {
            console.error("Error al procesar el datalogger:", error);
            toast.error(isEditing ? 'Error al actualizar el datalogger' : 'Error al crear el datalogger');
        }
    };

    if (loadingLocationUsers) {
        return <div>Cargando ubicaciones...</div>;
    }

    if (error) {
        return <div>Error al cargar las ubicaciones: {error}</div>;
    }

    //console.log('locationData create form', locationData);
    
   
    return ( 
        <form onSubmit={handleSubmit} className={stylesForms.form}>            
            <CardImageLoadingPreview
                imageFileName={profileImage}
                setNewImageHandler={setNewImage}
            /> 
            
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="name">Nombre:</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={datalogger.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="table_name">Nombre de Tabla:</label>
                    <input
                        type="text"
                        name="table_name"
                        id="table_name"
                        value={datalogger.table_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="mac_address">Dirección MAC:</label>
                    <input
                        type="text"
                        name="mac_address"
                        id="mac_address"
                        value={datalogger.mac_address}
                        onChange={handleChange}
                        required
                    />
                </div>
{/*                 
                <div className={stylesForms.formInput}>
                    <label htmlFor="is_active">Activo:</label>
                    <input
                        type="checkbox"
                        name="is_active"
                        id="is_active"
                        checked={datalogger.is_active}
                        onChange={handleChange}
                    />
                </div>
                 */}
            </div>
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="description">Descripción:</label>
                    <textarea
                        className={stylesForms.formInputTextarea}
                        name="description"
                        id="description"
                        value={datalogger.description}
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
