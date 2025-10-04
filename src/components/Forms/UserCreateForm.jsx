import { useState, useEffect} from 'react'
import { useParams } from 'react-router-dom';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
//import { useLocationUsersStore } from '../../store/locationUsersStore';
import { useUsersStore } from '../../store/usersStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


export const UserCreateForm = ({ userId, userData, locationData, isEditing }) => {
    const { user: userStore, userRoles } = useAuthStore();
    const [profileImage, setProfileImage] = useState("default_avatar.png");
    const [newImage, setNewImage] = useState("");
    const { businessUuid } = useParams();
    /*
    const { 
        locationUsers, 
        fetchLocationUsers,
        loadingStates: { fetchLocationUsers: loadingLocationUsers },
        error 
    } = useLocationUsersStore();
    */
   //console.log(userData)
   
    const [user, setUser] = useState({
        uuid: "",
        avatar_url: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",    
        dni:"",
        password:"",
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
        is_active:"0",
        location_id: "",
        role_id: ""
    });    
    const navigate = useNavigate();

    useEffect(() => {
        if (isEditing && userData) {
          //console.log(userData);
          
            setUser({
                uuid: userData?.uuid || "",
                avatar_url: userData?.avatar_url || "",
                firstName: userData?.first_name || "",                
                lastName: userData?.last_name || "",                
                email: userData?.email || "",
                phone: userData?.phone || "",
                dni: userData?.dni || "",
                password: userData?.password || "",
                street: userData?.address?.street || "",
                city: userData?.address?.city || "",
                state: userData?.address?.state || "",
                country: userData?.address?.country || "",
                zipCode: userData?.address?.zip_code || "",
                is_active: userData?.is_active || "",
                location_id: userData?.location_id || "",
                role_id: userData?.role_id || ""
            });
            setProfileImage(userData?.avatar_url || "default_avatar.png");
        }
    }, [isEditing, userData]);
    
    useEffect(() => {
        if (userStore){
             const userCurrentRole = 
                userStore?.businesses_roles?.some(br => br.role === 'Owner')
                    ? 'Owner'
                    : userStore?.businesses_roles?.find(br => br.uuid === businessUuid)?.role;
            setFilteredRoles(userCurrentRole === 'Owner' ? [{name: 'Administrator', id: 1212}, {name: 'Technician', id: 4545}] : [ {name: 'Technician', id: 4545}]);
            
        }
    }, [businessUuid, userStore]);    

    const [selectedLocationRol, setSelectedLocationRol] = useState('');
    const [filteredRoles, setFilteredRoles] = useState([]);
    
    const handleChange = (e) => {
    setUser({
        ...user,
        [e.target.name]: e.target.value,        
        });
    };

    const { createUser, updateUser, loadingStates: {createUser : isCreatingUser} } = useUsersStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();    
        setIsSubmitting(true);
        
        if (isEditing) {
          console.log('editing', user.uuid);
          
            const formData = new FormData();
            formData.append("uuid", user.uuid); 
            formData.append("firstName", user.firstName);
            formData.append("lastName", user.lastName);
            formData.append("email", user.email);
            formData.append("phone", user.phone);
            formData.append("dni", user.dni);
            formData.append("street", user.street);
            formData.append("city", user.city);
            formData.append("state", user.state);
            formData.append("country", user.country);
            formData.append("zipCode", user.zipCode);
            formData.append("business_uuid", businessUuid);
            formData.append("role", selectedLocationRol); // Assuming role can be updated
            //formData.append("image", newImage || profileImage); // Always send image, even if default
            // Manejo de la imagen
            if (newImage instanceof File) {            
              console.log('newImage', newImage);
              
                formData.append("image", newImage); // Backend expects 'image' field for file upload
            } else {
                // If no new image, but there's an existing profile image, send its URL
                // Or send a default if neither exists.
                // The backend should handle if 'image' is not present or is a URL string.
                formData.append("image", profileImage || "default_location.png");
            }

            try {
                const response = await updateUser(user.uuid, formData);
                console.log('response from usercreateform', response);
                
                if (response?.success) {
                    toast.success(response.message);
                    navigate(`/panel/ubicaciones/${businessUuid}/usuarios/${user.uuid}`);
                } else {
                    toast.error(response.message || 'Error al actualizar usuario');
                }
            } catch (error) {
                toast.error('Error al actualizar el usuario');
                console.error('Error al actualizar el usuario:', error);
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // Código existente para creación
        const formData = new FormData();
        formData.append("image", newImage || profileImage);
        formData.append("firstName", user.firstName);
        formData.append("lastName", user.lastName);
        formData.append("email", user.email);
        formData.append("phone", user.phone);
        formData.append("dni", user.dni);
        formData.append("password", user.password || "P4s5_W0rD*joD1d4+joD1d4_W0rD.P4s5");
        formData.append("street", user.street);
        formData.append("city", user.city);
        formData.append("state", user.state);
        formData.append("country", user.country);
        formData.append("zipCode", user.zipCode);
        formData.append("business_uuid", locationData?.uuid);
        formData.append("role", selectedLocationRol);
        formData.append("is_active", user.is_active || "0");
    
        try {
            const {success, message, user} = await createUser(formData, locationData?.uuid);
            if (success) {               
                toast.success(message);
                navigate(`/panel/ubicaciones/${businessUuid}/usuarios/${user.uuid}`);
            } else {
                toast.error(message);                
            }
        } catch (error) {            
            console.error("Error al procesar el usuario:", error);
            navigate(`/panel/ubicaciones/${locationData?.uuid}/usuarios/`);
        } finally {
                setIsSubmitting(false);
            }
    };
  
    if (isSubmitting) {
        return <div>Guardando cambios...</div>;
    }
    
    return (        
        <form onSubmit={handleSubmit} className={stylesForms.form}>
             <CardImageLoadingPreview
              imageFileName={profileImage}
              setNewImageHandler={setNewImage}
            /> 
            <div className={stylesForms.formInputGroup}>
              <div className={stylesForms.formInput}>
                <label htmlFor="firstName">Nombre:</label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={user.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={stylesForms.formInput}>
                <label htmlFor="lastName">Apellido:</label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={user.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className={stylesForms.formInputGroup}>
              <div className={stylesForms.formInput}>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={user.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={stylesForms.formInput}>
                <label htmlFor="phone">Telefono:</label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={user.phone}
                  onChange={handleChange}
                  required
                />
              </div>          
            </div>
            <div className={stylesForms.formInputGroup}>
              <div className={stylesForms.formInput}>
                <label htmlFor="dni">DNI:</label>
                <input
                  type="text"
                  name="dni"
                  id="dni"
                  value={user.dni}
                  onChange={handleChange}
                  required
                  disabled={isEditing}
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
                  value={user.street}
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
                  value={user.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className={stylesForms.formInputGroup}>
              <div className={stylesForms.formInput}>
                <label htmlFor="state">Provincia:</label>
                <input
                  type="text"
                  name="state"
                  id="state"
                  value={user.state}
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
                  value={user.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className={stylesForms.formInputGroup}>
              <div className={stylesForms.formInput}>
                <label htmlFor="zipCode">Código Postal:</label>
                <input
                  type="text"
                  name="zipCode"
                  id="zipCode"
                  value={user.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            {!isEditing && (
                <>
                    <h3>Rol del usuario en esta ubicación:</h3>
                    <div className={stylesForms.formInputGroup}>   
                        <div className={stylesForms.formInput}>
                            <label htmlFor="role">Rol:</label>
                            <select 
                                name="role" 
                                id="role" 
                                value={selectedLocationRol} 
                                onChange={e => setSelectedLocationRol(e.target.value)}
                                required
                            >
                                <option value="" disabled>Seleccione un rol para el usuario</option>
                                {filteredRoles.map((rol) => (
                                    <option value={rol.name} key={rol.id}>
                                        {rol.name}
                                    </option>
                                ))}
                            </select>
                        </div>      
                    </div>
                </>
            )}

            <button type="submit" className={stylesForms.formBtn}>
              Guardar cambios
            </button>
        </form>
    )
};
