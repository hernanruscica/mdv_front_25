import { useState, useEffect} from 'react'
import { useParams } from 'react-router-dom';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from "../../store/locationsStore";
import { useUsersStore } from '../../store/usersStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {mappedCurrentRole} from '../../utils/userRoles.js';
import { PATTERNS, validateField, sanitizeInput } from '../../utils/validation';


export const UserCreateForm = ({ userId, userData, locationData, isEditing }) => {
    const { user: userStore, userRoles } = useAuthStore();
    const [profileImage, setProfileImage] = useState("default_avatar.png");
    const [newImage, setNewImage] = useState("");
    const { businessUuid } = useParams();
    /**/
 const {
    locations,
    loadingStates: { fetchLocations: isLoadingLocations },
    error: locationsError,
    fetchLocations
  } = useLocationsStore();
    
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
        const loadUserLocationUsers = async () => {
          if (userStore) {
            const currentUserLocations = await fetchLocations(userStore);
            // console.log('currentUserLocations', currentUserLocations);
          }

        }
        loadUserLocationUsers();
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

    const [errors, setErrors] = useState({});

    const [selectedLocationRol, setSelectedLocationRol] = useState('');
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [selectedBusinessUuid, setSelectedBusinessUuid] = useState('');
    
    const handleChange = (e) => {
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setUser({
        ...user,
        [e.target.name]: e.target.value,        
        });
    };

    const { createUser, updateUser, loadingStates: {createUser : isCreatingUser} } = useUsersStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const errs = {};
        const fields = [
            { name: 'firstName', rules: [{ required: true, message: 'El nombre es obligatorio' }, { pattern: PATTERNS.letters, message: 'Solo letras' }, { minLength: 2, message: 'Mínimo 2 caracteres' }] },
            { name: 'lastName', rules: [{ required: true, message: 'El apellido es obligatorio' }, { pattern: PATTERNS.letters, message: 'Solo letras' }, { minLength: 2, message: 'Mínimo 2 caracteres' }] },
            { name: 'email', rules: [{ required: true, message: 'El email es obligatorio' }, { pattern: PATTERNS.email, message: 'Email inválido' }] },
            { name: 'phone', rules: [{ required: true, message: 'El teléfono es obligatorio' }, { pattern: PATTERNS.phone, message: 'Formato inválido' }] },
            { name: 'street', rules: [{ required: true, message: 'La calle es obligatoria' }, { minLength: 3, message: 'Mínimo 3 caracteres' }] },
            { name: 'city', rules: [{ required: true, message: 'La ciudad es obligatoria' }, { minLength: 2, message: 'Mínimo 2 caracteres' }] },
            { name: 'state', rules: [{ required: true, message: 'La provincia es obligatoria' }, { minLength: 2, message: 'Mínimo 2 caracteres' }] },
            { name: 'country', rules: [{ required: true, message: 'El país es obligatorio' }, { minLength: 2, message: 'Mínimo 2 caracteres' }] },
            { name: 'zipCode', rules: [{ required: true, message: 'El código postal es obligatorio' }, { pattern: PATTERNS.zipCode, message: 'Código postal inválido' }] },
        ];
        fields.forEach(({ name, rules }) => {
            const error = validateField(user[name], rules);
            if (error) errs[name] = error;
        });
        if (!isEditing) {
            const dniError = validateField(user.dni, [
                { required: true, message: 'El DNI es obligatorio' },
                { pattern: PATTERNS.dni, message: 'Debe tener entre 7 y 9 dígitos' },
            ]);
            if (dniError) errs.dni = dniError;
            if (!selectedBusinessUuid) errs.businessUuid = 'Debe seleccionar una ubicación';
            if (!selectedLocationRol) errs.role = 'Debe seleccionar un rol';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        
        if (isEditing) {
          //console.log('editing', user.uuid);
          
            const formData = new FormData();
            formData.append("uuid", user.uuid); 
            formData.append("firstName", sanitizeInput(user.firstName));
            formData.append("lastName", sanitizeInput(user.lastName));
            formData.append("email", sanitizeInput(user.email));
            formData.append("phone", sanitizeInput(user.phone));
            formData.append("dni", sanitizeInput(user.dni));
            formData.append("street", sanitizeInput(user.street));
            formData.append("city", sanitizeInput(user.city));
            formData.append("state", sanitizeInput(user.state));
            formData.append("country", sanitizeInput(user.country));
            formData.append("zipCode", sanitizeInput(user.zipCode));
            formData.append("business_uuid", businessUuid);
            formData.append("role", selectedLocationRol); // Assuming role can be updated
            //formData.append("image", newImage || profileImage); // Always send image, even if default
            // Manejo de la imagen
            if (newImage instanceof File) {            
              //console.log('newImage', newImage);
              
                formData.append("image", newImage); // Backend expects 'image' field for file upload
            } else {
                // If no new image, but there's an existing profile image, send its URL
                // Or send a default if neither exists.
                // The backend should handle if 'image' is not present or is a URL string.
                formData.append("image", profileImage || "default_location.png");
            }

            try {
                const response = await updateUser(user.uuid, formData);
                //console.log('response from usercreateform', response);
                
                if (response?.success) {
                    toast.success('Usuario actualizado con éxito');
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
        formData.append("firstName", sanitizeInput(user.firstName));
        formData.append("lastName", sanitizeInput(user.lastName));
        formData.append("email", sanitizeInput(user.email));
        formData.append("phone", sanitizeInput(user.phone));
        formData.append("dni", sanitizeInput(user.dni));
        formData.append("password", user.password || crypto.randomUUID());
        formData.append("street", sanitizeInput(user.street));
        formData.append("city", sanitizeInput(user.city));
        formData.append("state", sanitizeInput(user.state));
        formData.append("country", sanitizeInput(user.country));
        formData.append("zipCode", sanitizeInput(user.zipCode));
        formData.append("business_uuid", selectedBusinessUuid || locationData?.uuid);
        formData.append("role", selectedLocationRol);
        formData.append("is_active", user.is_active || "0");
    
        try {
            const {success, message, user} = await createUser(formData, selectedBusinessUuid || locationData?.uuid);
            if (success) {               
                toast.success('Usuario creado con éxito');
                navigate(`/panel/ubicaciones/${businessUuid}/usuarios/${user.uuid}`);
            } else {
                toast.error(message);                
            }
        } catch (error) {            
            console.error("Error al procesar el usuario:", error);
            navigate(`/panel/ubicaciones/${selectedBusinessUuid || locationData?.uuid}/usuarios/`);
        } finally {
                setIsSubmitting(false);
            }
    };
  
    if (isSubmitting) {
        return <div>Guardando cambios...</div>;
    }

   //console.log('locations', locations);
    
    
    return (        
        <form onSubmit={handleSubmit} className={stylesForms.form}>
             <CardImageLoadingPreview
              imageFileName={profileImage}
              setNewImageHandler={setNewImage}
            /> 
            {!isEditing && (
              <>
                <h3>Ubicación y Rol del usuario:</h3>
                <div className={stylesForms.formInputGroup}>  
                  <div className={stylesForms.formInput}>
                    <label htmlFor="businessUuid">Ubicación:</label>
                    <select
                      name="businessUuid"
                      id="businessUuid"
                      value={selectedBusinessUuid}
                      onChange={e => { setErrors(prev => ({ ...prev, businessUuid: '' })); setSelectedBusinessUuid(e.target.value); }}
                      className={errors.businessUuid ? stylesForms.formInputError : ''}
                      required
                    >
                      <option value="" disabled>Seleccione una ubicación</option>
                      {locations.map((loc) => (
                        <option value={loc.uuid} key={loc.uuid}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                    <span className={stylesForms.formErrorMessage}>{errors.businessUuid || ''}</span>
                  </div> 
                  <div className={stylesForms.formInput}>
                      <label htmlFor="role">Rol:</label>
                      <select 
                          name="role" 
                          id="role" 
                          value={selectedLocationRol} 
                          onChange={e => { setErrors(prev => ({ ...prev, role: '' })); setSelectedLocationRol(e.target.value); }}
                          className={errors.role ? stylesForms.formInputError : ''}
                          required
                      >
                          <option value="" disabled>Seleccione un rol para el usuario</option>
                          {filteredRoles.map((rol) => (
                              <option value={rol.name} key={rol.id}>
                                  {mappedCurrentRole[rol.name]}
                              </option>
                          ))}
                      </select>
                      <span className={stylesForms.formErrorMessage}>{errors.role || ''}</span>
                  </div>      
                </div>
              </>
             
            )}
            <h3>Datos del usuario:</h3>
            <div className={stylesForms.formInputGroup}>
              <div className={stylesForms.formInput}>
                <label htmlFor="firstName">Nombre:</label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={user.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? stylesForms.formInputError : ''}
                  required
                />
                <span className={stylesForms.formErrorMessage}>{errors.firstName || ''}</span>
              </div>
              <div className={stylesForms.formInput}>
                <label htmlFor="lastName">Apellido:</label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={user.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? stylesForms.formInputError : ''}
                  required
                />
                <span className={stylesForms.formErrorMessage}>{errors.lastName || ''}</span>
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
                  className={errors.email ? stylesForms.formInputError : ''}
                  required
                />
                <span className={stylesForms.formErrorMessage}>{errors.email || ''}</span>
              </div>
              <div className={stylesForms.formInput}>
                <label htmlFor="phone">Telefono:</label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={user.phone}
                  onChange={handleChange}
                  className={errors.phone ? stylesForms.formInputError : ''}
                  required
                />
                <span className={stylesForms.formErrorMessage}>{errors.phone || ''}</span>
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
                  className={errors.dni ? stylesForms.formInputError : ''}
                  required
                  disabled={isEditing}
                />
                <span className={stylesForms.formErrorMessage}>{errors.dni || ''}</span>
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
                  value={user.city}
                  onChange={handleChange}
                  className={errors.city ? stylesForms.formInputError : ''}
                  required
                />
                <span className={stylesForms.formErrorMessage}>{errors.city || ''}</span>
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
                  value={user.country}
                  onChange={handleChange}
                  className={errors.country ? stylesForms.formInputError : ''}
                  required
                />
                <span className={stylesForms.formErrorMessage}>{errors.country || ''}</span>
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
                  className={errors.zipCode ? stylesForms.formInputError : ''}
                  required
                />
                <span className={stylesForms.formErrorMessage}>{errors.zipCode || ''}</span>
              </div>
            </div>
            
            {!isEditing && (
                <>
                   
                </>
            )}

            <button type="submit" className={stylesForms.formBtn}>
              Guardar cambios
            </button>
        </form>
    )
};
