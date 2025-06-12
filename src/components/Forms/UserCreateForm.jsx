import React,{ useState, useEffect} from 'react'
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useLocationUsersStore } from '../../store/locationUsersStore';
import { useUsersStore } from '../../store/usersStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const UserCreateForm = ({ userId, userData, isEditing }) => {
    const { user: userStore, userRoles } = useAuthStore();
    const [profileImage, setProfileImage] = useState("default_avatar.png");
    const [newImage, setNewImage] = useState("");
    const { 
        locationUsers, 
        fetchLocationUsers,
        loadingStates: { fetchLocationUsers: loadingLocationUsers },
        error 
    } = useLocationUsersStore();
    
    const [user, setUser] = useState({
        foto: "",
        nombre_1: "",
        nombre_2: "",
        apellido_1: "",
        apellido_2: "",
        email: "",
        telefono: "",    
        dni:"",
        password:"",
        estado:"0",
        direcciones_id: ""
    });    
    const navigate = useNavigate();

    useEffect(() => {
        if (isEditing && userData) {
            setUser({
                foto: userData.foto || "",
                nombre_1: userData.nombre_1 || "",
                nombre_2: userData.nombre_2 || "",
                apellido_1: userData.apellido_1 || "",
                apellido_2: userData.apellido_2 || "",
                email: userData.email || "",
                telefono: userData.telefono || "",
                dni: userData.dni || "",
                password: userData.password || "",
                estado: userData.estado || "",
                direcciones_id: userData.direcciones_id || ""
            });
            setProfileImage(userData.foto || "default_avatar.png");
        }
    }, [isEditing, userData]);
    
    useEffect(() => {
        if (userStore) {
            fetchLocationUsers(userStore);
        }
    }, [userStore]);    

    // Estado para la ubicación seleccionada
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedLocationRol, setSelectedLocationRol] = useState('');
    const [filteredRoles, setFilteredRoles] = useState([]);

    // Manejador para el cambio de ubicación
    const handleSelectLocationChange = (e) => {
        setSelectedLocation(e.target.value);
        // Filtrar roles según la ubicación seleccionada    
        const maxRolBylocation = locationUsers.find(locationUser => locationUser.ubicaciones_id === parseInt(e.target.value))?.usuarios_roles_id;               
        const filteredRoles = (userStore.espropietario == 1) 
                                ? userRoles 
                                : userRoles.filter(rol => rol.id < maxRolBylocation);
        setFilteredRoles(filteredRoles);    
        setSelectedLocationRol(filteredRoles[0]?.id || '');            
    };
    
    const handleChange = (e) => {
    setUser({
        ...user,
        [e.target.name]: e.target.value,
        });
    };

    const { createUser, updateUser } = useUsersStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();    
        setIsSubmitting(true);
        
        if (isEditing) {
            const updateData = {
                nombre_1: user.nombre_1,
                nombre_2: user.nombre_2,
                apellido_1: user.apellido_1,
                apellido_2: user.apellido_2,
                email: user.email,
                telefono: user.telefono,
                foto: newImage || profileImage
            };

            try {
                const response = await updateUser(userData.id, updateData);
                console.log(response)
                if (response.success) {
                    toast.success(response.message);
                    navigate(`/panel/usuarios/${userData.id}`);
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
        formData.append("foto", newImage || profileImage);
        formData.append("nombre_1", user.nombre_1);
        formData.append("nombre_2", user.nombre_2);
        formData.append("apellido_1", user.apellido_1);
        formData.append("apellido_2", user.apellido_2);
        formData.append("email", user.email);
        formData.append("telefono", user.telefono);
        formData.append("dni", user.dni);
        formData.append("password", user.password || "P4s5_W0rD*joD1d4+joD1d4_W0rD.P4s5");
        formData.append("estado", user.estado || "0");
        formData.append("ubicaciones_id", selectedLocation);
        formData.append("roles_id", selectedLocationRol);
    
        try {
            const {success, message, user} = await createUser(formData);
            if (success) {               
                toast.success(message);
                navigate(`/panel/usuarios/${user.id}`);
            } else {
                toast.error(message);
            }
        } catch (error) {
            toast.error("Error al procesar el usuario:");
            console.error("Error al procesar el usuario:", error);
        }
    };


    if (loadingLocationUsers) {
        return <div>Cargando datos de ubicaciones...</div>;
    }

    if (isSubmitting) {
        return <div>Guardando cambios...</div>;
    }
    
    if (error) {
        console.error('Error al cargar usuarios por ubicación:', error);
    }

    // console.log(userRoles, filteredRoles);
    
    return (        
        <form onSubmit={handleSubmit} className={stylesForms.form}>
             <CardImageLoadingPreview
              imageFileName={profileImage}
              setNewImageHandler={setNewImage}
            /> 
            <div className={stylesForms.formInputGroup}>
              <div className={stylesForms.formInput}>
                <label htmlFor="nombre_1">Nombre 1:</label>
                <input
                  type="text"
                  name="nombre_1"
                  id="nombre_1"
                  value={user.nombre_1}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={stylesForms.formInput}>
                <label htmlFor="nombre_2">Nombre 2:</label>
                <input
                  type="text"
                  name="nombre_2"
                  id="nombre_2"
                  value={user.nombre_2}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={stylesForms.formInputGroup}>
              <div className={stylesForms.formInput}>
                <label htmlFor="apellido_1">Apellido 1:</label>
                <input
                  type="text"
                  name="apellido_1"
                  id="apellido_1"
                  value={user.apellido_1}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={stylesForms.formInput}>
                <label htmlFor="apellido_2">Apellido 2:</label>
                <input
                  type="text"
                  name="apellido_2"
                  id="apellido_2"
                  value={user.apellido_2}
                  onChange={handleChange}
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
                <label htmlFor="telefono">Telefono:</label>
                <input
                  type="text"
                  name="telefono"
                  id="telefono"
                  value={user.telefono}
                  onChange={handleChange}
                  required
                />
              </div>          
            </div>
            <div className={stylesForms.formInputGroup}>
              <div className={stylesForms.formInput}>
                <label htmlFor="dni">dni:</label>
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
            
            {!isEditing && (
                <>
                    <h3>Rol del usuario en una ubicación:</h3>
                    <div className={stylesForms.formInputGroup}>          
                        <div className={stylesForms.formInput}>
                            <label htmlFor="location">ubicación:</label>
                            <select 
                                name="location" 
                                id="location" 
                                value={selectedLocation} 
                                onChange={handleSelectLocationChange}
                                required
                            >
                                <option value="" disabled>Seleccione una ubicación</option>
                                {locationUsers.map((location) => (
                                    <option 
                                        value={location.ubicaciones_id} 
                                        key={location.ubicaciones_id}
                                    >
                                        {location.ubicaciones_nombre}
                                    </option>
                                ))}
                            </select>
                        </div>      
                        <div className={stylesForms.formInput}>
                            <label htmlFor="rol">Rol:</label>
                            <select 
                                name="rol" 
                                id="rol" 
                                value={selectedLocationRol} 
                                onChange={e => setSelectedLocationRol(e.target.value)}
                                required
                            >
                                <option value="" disabled>Antes seleccione una ubicacion</option>
                                {filteredRoles.map((rol) => (
                                    <option value={rol.id} key={rol.id}>
                                        {rol.nombre}
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



