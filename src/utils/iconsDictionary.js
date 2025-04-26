export const iconsDictionary = {
    default: 'folder-solid.svg',
    panel: 'columns-solid.svg',
    usuarios: 'user-regular.svg',
    usuario: 'user-regular.svg',
    dataloggers: 'microchip-solid.svg',
    canales: 'chart-line-solid.svg',
    ubicaciones: 'building-regular.svg',
    alarmas: 'bell-regular.svg',
    historial: 'history-solid.svg',
    edicion: 'edit-regular.svg',
    construccion: 'person-digging-solid.svg',
    inicio: 'flag-checkered-solid.svg',
    contacto: 'envelope-regular.svg'
};

export const getIconFileName = (type) => {
    return iconsDictionary[type] || iconsDictionary.default;
};