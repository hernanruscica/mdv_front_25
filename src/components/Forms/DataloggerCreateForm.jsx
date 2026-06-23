import { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useLocationUsersStore } from '../../store/locationUsersStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';
import { PATTERNS, validateField, sanitizeInput } from '../../utils/validation';

export const DataloggerCreateForm = ({ locationData, dataloggerData, isEditing }) => {
    const [newImage, setNewImage] = useState(null); // Changed to null to properly check for file
    const [profileImage, setProfileImage] = useState("default_datalogger.webp");    
    const { user: userStore } = useAuthStore();
    const { 
        locationUsers, 
        fetchLocationUsers,
        loadingStates: { fetchLocationUsers: loadingLocationUsers },
        error 
    } = useLocationUsersStore();
    
    const [errors, setErrors] = useState({});

    const [datalogger, setDatalogger] = useState({ 
        mac_address: "", 
        name: "", 
        description: "", 
        image: "default_datalogger.webp", // Default image name
        table_name: "", 
        is_active: 1, // Added is_active field
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
        
    }, [dataloggerData, isEditing, userStore]);

    useEffect(() => {
        if (userStore && !locationUsers) { // Fetch only if not already fetched
            fetchLocationUsers(userStore);
        }
    }, [userStore, fetchLocationUsers, locationUsers]);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setErrors(prev => ({ ...prev, [name]: '' }));
        setDatalogger({
            ...datalogger,
            [name]:  value,
        });
    };

    const validate = () => {
        const errs = {};
        const fields = [
            { name: 'name', rules: [{ required: true, message: 'El nombre es obligatorio' }, { minLength: 2, message: 'Mínimo 2 caracteres' }] },
            { name: 'mac_address', rules: [{ required: true, message: 'La MAC es obligatoria' }, { pattern: PATTERNS.macAddress, message: 'Formato inválido (ej: AA:BB:CC:DD:EE:FF)' }] },
            { name: 'table_name', rules: [{ required: true, message: 'El nombre de tabla es obligatorio' }, { pattern: PATTERNS.alphanumeric, message: 'Solo letras, números y guión bajo' }] },
            { name: 'description', rules: [{ required: true, message: 'La descripción es obligatoria' }, { minLength: 3, message: 'Mínimo 3 caracteres' }] },
        ];
        fields.forEach(({ name, rules }) => {
            const error = validateField(datalogger[name], rules);
            if (error) errs[name] = error;
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const navigate = useNavigate();
    const { createDatalogger, updateDatalogger } = useDataloggersStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;    
        const formData = new FormData();
        formData.append("name", sanitizeInput(datalogger.name || ""));
        formData.append("description", sanitizeInput(datalogger.description || ""));
        formData.append("mac_address", sanitizeInput(datalogger.mac_address || ""));
        formData.append("table_name", sanitizeInput(datalogger.table_name || ""));
        formData.append("is_active", datalogger.is_active); // Boolean value
        formData.append("businessUuid", datalogger.business_uuid);

        if (newImage) {
            formData.append("image", newImage); // Append the File object
        } else if (!isEditing && datalogger.image) {
           
        }

        // business_uuid is only needed for POST, and it's part of the URL for PUT
        if (!isEditing && datalogger.business_uuid) {
            formData.append("businessUuid", datalogger.business_uuid);
        }

        try {
            let response;           
            
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
                        className={errors.name ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.name || ''}</span>
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="table_name">Nombre de Tabla:</label>
                    <input
                        type="text"
                        name="table_name"
                        id="table_name"
                        value={datalogger.table_name}
                        onChange={handleChange}
                        className={errors.table_name ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.table_name || ''}</span>
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="mac_address">Dirección MAC:</label>
                    <input
                        type="text"
                        name="mac_address"
                        id="mac_address"
                        value={datalogger.mac_address}
                        onChange={handleChange}
                        className={errors.mac_address ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.mac_address || ''}</span>
                </div>

            </div>
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="description">Descripción:</label>
                    <textarea
                        className={`${stylesForms.formInputTextarea}${errors.description ? ` ${stylesForms.formInputError}` : ''}`}
                        name="description"
                        id="description"
                        value={datalogger.description}
                        onChange={handleChange}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.description || ''}</span>
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
