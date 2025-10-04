import { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';
import {LoadingSpinner} from '../../components/LoadingSpinner/LoadingSpinner.jsx';

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
            setProfileImage(locationData?.logo_url || "default_location.png");
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
        formData.append("name", location.name || "");
        formData.append("description", location.description || "");
        formData.append("email", location.email || "");
        formData.append("phone", location.phone || "");
        formData.append("street", location.street || "");
        formData.append("city", location.city || "");
        formData.append("state", location.state || "");
        formData.append("country", location.country || "");
        formData.append("zip_code", location.zip_code || "");
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
                console.log('editing', locationData?.uuid);
                
                formData.append("uuid", locationData?.uuid); // Assuming backend needs uuid for update
                const response = await updateLocation(locationData?.uuid, formData);
                console.log('formData enviada:', formData);
                
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

    console.log('locationData.uuid', locationData?.uuid)
    
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
                        required
                    />
                </div>            
                <div className={stylesForms.formInput}>
                    <label htmlFor="phone">Teléfono:</label>
                    <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={location.phone}
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
                    <label htmlFor="description">Descripción:</label>
                    <textarea
                        className={stylesForms.formInputTextarea}
                        name="description"
                        id="description"
                        value={location.description}
                        onChange={handleChange}
                        required
                    />
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
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="city">Ciudad:</label>
                    <input
                        type="text"
                        name="city"
                        id="city"
                        value={location.city}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="state">Provincia:</label>
                    <input
                        type="text"
                        name="state"
                        id="state"
                        value={location.state}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="country">País:</label>
                    <input
                        type="text"
                        name="country"
                        id="country"
                        value={location.country}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="zip_code">Código Postal:</label>
                    <input
                        type="text"
                        name="zip_code"
                        id="zip_code"
                        value={location.zip_code}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            

            </fieldset>
            <button type="submit" className={stylesForms.formBtn} disabled={isLoading}>
                Guardar Ubicación
            </button>
        </form>
    )
};
