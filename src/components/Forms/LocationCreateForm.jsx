import { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';
import {LoadingSpinner} from '../../components/LoadingSpinner/LoadingSpinner.jsx';
import { PATTERNS, validateField, sanitizeInput } from '../../utils/validation';

export const LocationCreateForm = ({ locationData, isEditing }) => {
    const navigate = useNavigate();   
    const { user: userStore } = useAuthStore();
    const { createLocation, 
            updateLocation, 
            loadingStates : {createLocation : isCreatingLocation, updateLocation: isUpdatingLocation},             
        } = useLocationsStore();
    const [profileImage, setProfileImage] = useState("default_location.png");
    const [newImage, setNewImage] = useState("");
    const isLoading = isCreatingLocation || isUpdatingLocation;
    
    const [errors, setErrors] = useState({});

    const [location, setLocation] = useState({     
        name: "", 
        description: "", 
        email: "", 
        phone: "", 
        logo_url: "", 
        street: "", 
        city: "", 
        state: "", 
        country: "", 
        zip_code: "",           
    });    

    useEffect(() => {
        if (isEditing && locationData) {
            setLocation({
                name: locationData?.name || "",
                description: locationData?.description || "",
                email: locationData?.email || "",
                phone: locationData?.phone || "",
                logo_url: locationData?.logo_url || "",
                street: locationData?.address.street || "",
                city: locationData?.address.city || "",
                state: locationData?.address.state || "",
                country: locationData?.address.country || "",
                zip_code: locationData?.address.zip_code || "",
            });
            
        }
    }, [locationData, isEditing]);
    
    const handleChange = (e) => {
        setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        setLocation({
            ...location,
            [e.target.name]: e.target.value,
        });
    };

    const validate = () => {
        const errs = {};
        const fields = [
            { name: 'name', rules: [{ required: true, message: 'El nombre es obligatorio' }, { minLength: 2, message: 'Mínimo 2 caracteres' }] },
            { name: 'email', rules: [{ required: true, message: 'El email es obligatorio' }, { pattern: PATTERNS.email, message: 'Email inválido' }] },
            { name: 'phone', rules: [{ required: true, message: 'El teléfono es obligatorio' }, { pattern: PATTERNS.phone, message: 'Formato inválido' }] },
            { name: 'street', rules: [{ required: true, message: 'La calle es obligatoria' }, { minLength: 3, message: 'Mínimo 3 caracteres' }] },
            { name: 'city', rules: [{ required: true, message: 'La ciudad es obligatoria' }, { minLength: 2, message: 'Mínimo 2 caracteres' }] },
            { name: 'state', rules: [{ required: true, message: 'La provincia es obligatoria' }, { minLength: 2, message: 'Mínimo 2 caracteres' }] },
            { name: 'country', rules: [{ required: true, message: 'El país es obligatorio' }, { minLength: 2, message: 'Mínimo 2 caracteres' }] },
            { name: 'zip_code', rules: [{ required: true, message: 'El código postal es obligatorio' }, { pattern: PATTERNS.zipCode, message: 'Código postal inválido' }] },
            { name: 'description', rules: [{ required: true, message: 'La descripción es obligatoria' }, { minLength: 3, message: 'Mínimo 3 caracteres' }] },
        ];
        fields.forEach(({ name, rules }) => {
            const error = validateField(location[name], rules);
            if (error) errs[name] = error;
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const formData = new FormData();        
        formData.append("name", sanitizeInput(location.name || ""));
        formData.append("description", sanitizeInput(location.description || ""));
        formData.append("email", sanitizeInput(location.email || ""));
        formData.append("phone", sanitizeInput(location.phone || ""));
        formData.append("street", sanitizeInput(location.street || ""));
        formData.append("city", sanitizeInput(location.city || ""));
        formData.append("state", sanitizeInput(location.state || ""));
        formData.append("country", sanitizeInput(location.country || ""));
        formData.append("zip_code", sanitizeInput(location.zip_code || ""));
        formData.append("created_by", userStore.uuid);
        
        // Manejo de la imagen
        if (newImage instanceof File) {            
            formData.append("image", newImage); // Backend expects 'image' field for file upload
        } else {
            // If no new image, but there's an existing profile image, send its URL
            // Or send a default if neither exists.
            // The backend should handle if 'image' is not present or is a URL string.
            formData.append("image", profileImage || "default_location.png");
        }

        try {
            if (isEditing) {
                formData.append("uuid", locationData?.uuid); // Assuming backend needs uuid for update
                const response = await updateLocation(locationData?.uuid, formData);
                
                navigate(`/panel/ubicaciones/${locationData.uuid}`);
                toast.success('Ubicación actualizada exitosamente');
            } else {                
                const response = await createLocation(formData);
                const newLocationId = response.business.uuid;
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

    //console.log('locationData.uuid', locationData?.uuid)
    
    return (        
        <form onSubmit={handleSubmit} className={stylesForms.form}>
            {isLoading && <LoadingSpinner />}
            <fieldset disabled={isLoading} style={{ border: 'none', padding: 0 }}>
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
                        value={location.name}
                        onChange={handleChange}
                        className={errors.name ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.name || ''}</span>
                </div>            
                <div className={stylesForms.formInput}>
                    <label htmlFor="phone">Teléfono:</label>
                    <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={location.phone}
                        onChange={handleChange}
                        className={errors.phone ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.phone || ''}</span>
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={location.email}
                        onChange={handleChange}
                        className={errors.email ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.email || ''}</span>
                </div>               
            </div>
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="description">Descripción:</label>
                    <textarea
                        className={`${stylesForms.formInputTextarea}${errors.description ? ` ${stylesForms.formInputError}` : ''}`}
                        name="description"
                        id="description"
                        value={location.description}
                        onChange={handleChange}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.description || ''}</span>
                </div>
            </div>
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="street">Calle:</label>
                    <input
                        type="text"
                        name="street"
                        id="street"
                        value={location.street}
                        onChange={handleChange}
                        className={errors.street ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.street || ''}</span>
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="city">Ciudad:</label>
                    <input
                        type="text"
                        name="city"
                        id="city"
                        value={location.city}
                        onChange={handleChange}
                        className={errors.city ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.city || ''}</span>
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="state">Provincia:</label>
                    <input
                        type="text"
                        name="state"
                        id="state"
                        value={location.state}
                        onChange={handleChange}
                        className={errors.state ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.state || ''}</span>
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="country">País:</label>
                    <input
                        type="text"
                        name="country"
                        id="country"
                        value={location.country}
                        onChange={handleChange}
                        className={errors.country ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.country || ''}</span>
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="zip_code">Código Postal:</label>
                    <input
                        type="text"
                        name="zip_code"
                        id="zip_code"
                        value={location.zip_code}
                        onChange={handleChange}
                        className={errors.zip_code ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.zip_code || ''}</span>
                </div>
            </div>
            

            </fieldset>
            <button type="submit" className={stylesForms.formBtn} disabled={isLoading}>
                Guardar Ubicación
            </button>
        </form>
    )
};
