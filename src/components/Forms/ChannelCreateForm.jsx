import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useChannelsStore } from '../../store/channelsStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';

export const ChannelCreateForm = ({ locationData, channelData, isEditing }) => {
    const { dataloggerId, channelId, businessUuid } = useParams();
    const { user: userStore } = useAuthStore();
    const [profileImage, setProfileImage] = useState("default_channel.png");
    const [newImage, setNewImage] = useState("");
    
    const [channel, setChannel] = useState({ 
        datalogger_id: dataloggerId, 
        name: "", 
        description: "", 
        column_name: "", 
        averaging_period: "60", 
        factor: "1.0",
        is_active: 1,
        image: ""
    }); 
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setChannel({
            ...channel,
            [name]:  value,
        });
    };

    const navigate = useNavigate();
    const { createChannel, updateChannel } = useChannelsStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();    
        setIsSubmitting(true);
        const formData = new FormData();

        formData.append("name", channel.name || "");
        formData.append("description", channel.description || "");
        formData.append("averaging_period", channel.averaging_period || "");
        formData.append("factor", channel.factor || "");
        formData.append("is_active", channel.is_active);
        formData.append("businessUuid", businessUuid || "");

        if (newImage) {
            formData.append("image", newImage);
        }

        try {
            if (isEditing) {
                const response = await updateChannel(channelId, formData);
                if (response.success) {
                    toast.success('Canal actualizado exitosamente!');
                    navigate(`/panel/ubicaciones/${channelData.business_uuid}/dataloggers/${dataloggerId}/canales/${channelId}`);
                } else {
                    toast.error(response.message || 'Error al actualizar el canal');
                }
            } else {
                formData.append("datalogger_id", channel.datalogger_id || "");
                formData.append("column_name", channel.column_name || "");
                const response = await createChannel(businessUuid, formData);                
                if (response.success) {
                    toast.success('Canal creado exitosamente!');
                    navigate(`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}`);
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
        if (isEditing ) {
            setChannel({
                name: channelData?.name || "",
                description: channelData?.description || "",
                column_name: channelData?.column_name || "",
                averaging_period: channelData?.averaging_period || "",
                factor: channelData?.factor || "",
                is_active: channelData?.is_active,
                image: channelData?.image || "",
            });
            setProfileImage(channelData?.img || "default_channel.webp");
        }
        
    }, [channelData, isEditing])
    
    if (isSubmitting) {
        return <div>Guardando cambios...</div>;
    }
/*
    console.log('channelData create form', channelData);
    console.log('dataloggerId, channelId, businessUuid', dataloggerId, channelId, businessUuid);
    console.log('locationData create form', locationData);
  */
    
    
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
                        value={channel.name}
                        onChange={handleChange}
                        required
                    />
                </div>            
                <div className={stylesForms.formInput}>
                    <label htmlFor="column_name">Nombre de Columna:</label>
                    <input
                        type="text"
                        name="column_name"
                        id="column_name"
                        value={channel.column_name}
                        onChange={handleChange}
                        required
                        disabled={isEditing}
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="averaging_period">Tiempo a Promediar (segundos):</label>
                    <input
                        type="number"
                        name="averaging_period"
                        id="averaging_period"
                        value={channel.averaging_period}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="factor">Factor:</label>
                    <input
                        type="number"
                        step="0.01"
                        name="factor"
                        id="factor"
                        value={channel.factor}
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
                        value={channel.description}
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
