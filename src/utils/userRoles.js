 
 
 export const mappedCurrentRole = {
    'Owner': 'Propietario',
    'Administrator': 'Administrador',
    'Technician': 'Operario'
    }
 
 // Get user current role from a determinated location (businessUuid) 
 // Returns an object with its names, internal and visible name.
 export const GetUserCurrentRole = (user, businessUuid) => {

    if (!user) return null;

    const mappedCurrentRole = {
    'Owner': 'Propietario',
    'Administrator': 'Administrador',
    'Technician': 'Operario'
    }

    const userCurrentRole = 
      user?.businesses_roles.some(br => br.role === 'Owner')
        ? 'Owner'
        : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;

    const userCurrentRoleNameToShow = mappedCurrentRole[userCurrentRole];

    return {
              name: userCurrentRole,
              nameToShow: userCurrentRoleNameToShow
            }
  }