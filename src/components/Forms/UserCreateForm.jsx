import React,{ useState, useEffect} from 'react'
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useLocationUsersStore } from '../../store/locationUsersStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';

export const UserCreateForm = () => {
    const { user: userStore, userRoles } = useAuthStore();
    const [profileImage, setProfileImage] = useState("default_avatar.png"); // Imagen de perfil actual
    const [newImage, setNewImage] = useState(""); // Nueva imagen seleccionada
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
        estado:"",
        direcciones_id: ""
      });    
    
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

    const handleSubmit = async (e) => {
        e.preventDefault();    
        // Crear formData para enviar los datos incluyendo la imagen
        const formData = new FormData();
        // Verifica que los campos del usuario tengan valores válidos
        formData.append("nombre_1", user.nombre_1 || "");
        formData.append("nombre_2", user.nombre_2 || "");
        formData.append("apellido_1", user.apellido_1 || "");
        formData.append("apellido_2", user.apellido_2 || "");
        formData.append("email", user.email || "");
        formData.append("telefono", user.telefono || "");
        formData.append("dni", user.dni || "");
        formData.append("password", user.password || "P4s5_W0rD*joD1d4+joD1d4_W0rD.P4s5");
        formData.append("estado", user.estado || "0");
        formData.append("direcciones_id", user.direcciones_id || "1");
        formData.append("foto", newImage || "default_avatar.png");

        console.log("enviando datos")
    };


    if (loadingLocationUsers) {
        return <div>Cargando datos...</div>;
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
                />
              </div>
            </div>
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
                  <option value="" disabled>Antes de seleccione un rol, elija una ubicación</option>
                  {filteredRoles.map((rol) => (
                    <option value={rol.id} key={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>      
            </div>

            <button type="submit" className={stylesForms.formBtn}>
              Guardar cambios
            </button>
        </form>
    )
};



