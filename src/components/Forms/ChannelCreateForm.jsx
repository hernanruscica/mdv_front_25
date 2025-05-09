import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useChannelsStore } from '../../store/channelsStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';

export const ChannelCreateForm = ({ channelData, isEditing }) => {
    const { dataloggerId, channelId } = useParams();
    const { user: userStore } = useAuthStore();
    const [profileImage, setProfileImage] = useState(channelData?.foto || "default_channel.png");
    const [newImage, setNewImage] = useState("");
    
    const [channel, setChannel] = useState({ 
        datalogger_id: dataloggerId, 
        nombre: "", 
        descripcion: "", 
        nombre_columna: "", 
        tiempo_a_promediar: "720", 
        foto: "", 
        multiplicador: "1" 
    }); 
    
    const handleChange = (e) => {
        setChannel({
            ...channel,
            [e.target.name]: e.target.value,
        });
    };
    const navigate = useNavigate();
    const { createChannel, updateChannel } = useChannelsStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();    
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("datalogger_id", channel.datalogger_id || "");
        formData.append("nombre", channel.nombre || "");
        formData.append("descripcion", channel.descripcion || "");
        formData.append("nombre_columna", channel.nombre_columna || "");
        formData.append("tiempo_a_promediar", channel.tiempo_a_promediar || "");    
        formData.append("foto", newImage || "default_channel.webp");
        formData.append("multiplicador", channel.multiplicador || "");
        
        try {
            if (isEditing) {
                const response = await updateChannel(channelId, formData);
                if (response.success) {
                    toast.success(response.message);
                    navigate(`/panel/dataloggers/${dataloggerId}/canales/${channelId}`);
                } else {
                    toast.error(response.message || 'Error al actualizar el canal');
                }
            } else {
                const response = await createChannel(formData);                
                if (response.success) {
                    toast.success(response.message);
                    navigate(`/panel/dataloggers/${dataloggerId}/canales/${channelId}`);
                } else {
                    toast.error(response.message || 'Error al crear el canal');
                }
            }
        } catch (error) {
            toast.error('Error al procesar el canal');
            console.error('Error al procesar el canal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isEditing && channelData) {
            setChannel({
                nombre: channelData.nombre || "",
                descripcion: channelData.descripcion || "",
                nombre_columna: channelData.nombre_columna || "",
                tiempo_a_promediar: channelData.tiempo_a_promediar || "",
                foto: channelData.foto || "",
                multiplicador: channelData.multiplicador || "",
            });
            setProfileImage(channelData.foto || "default_channel.webp");
        }
        
    }, [channelData, isEditing])
    
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
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        value={channel.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>            
                <div className={stylesForms.formInput}>
                    <label htmlFor="nombre_columna">Nombre de Columna:</label>
                    <input
                        type="text"
                        name="nombre_columna"
                        id="nombre_columna"
                        value={channel.nombre_columna}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="tiempo_a_promediar">Tiempo a Promediar (minutos):</label>
                    <input
                        type="number"
                        name="tiempo_a_promediar"
                        id="tiempo_a_promediar"
                        value={channel.tiempo_a_promediar}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="multiplicador">Multiplicador:</label>
                    <input
                        type="number"
                        name="multiplicador"
                        id="multiplicador"
                        value={channel.multiplicador}
                        onChange={handleChange}
                        required
                    />
                </div>               
            </div>
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea
                        className={stylesForms.formInputTextarea}
                        name="descripcion"
                        id="descripcion"
                        value={channel.descripcion}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <button type="submit" className={stylesForms.formBtn}>
                Guardar Canal
            </button>
        </form>
    );
};



