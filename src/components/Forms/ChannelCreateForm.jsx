import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useChannelsStore } from '../../store/channelsStore';
import CardImageLoadingPreview from '../../components/CardImageLoadingPreview/CardImageLoadingPreview.jsx';
import { PATTERNS, validateField, sanitizeInput } from '../../utils/validation';

export const ChannelCreateForm = ({ locationData, channelData, isEditing }) => {
    const { dataloggerId, channelId, businessUuid } = useParams();
    const { user: userStore } = useAuthStore();
    const [profileImage, setProfileImage] = useState("default_channel.png");
    const [newImage, setNewImage] = useState("");
    
    const [errors, setErrors] = useState({});

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
        setErrors(prev => ({ ...prev, [name]: '' }));
        setChannel({
            ...channel,
            [name]:  value,
        });
    };

    const navigate = useNavigate();
    const { createChannel, updateChannel } = useChannelsStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const errs = {};
        const fields = [
            { name: 'name', rules: [{ required: true, message: 'El nombre es obligatorio' }, { minLength: 2, message: 'Mínimo 2 caracteres' }] },
            { name: 'averaging_period', rules: [{ required: true, message: 'El período es obligatorio' }, { min: 1, message: 'Mínimo 1 minuto' }, { max: 1440, message: 'Máximo 1440 minutos' }] },
            { name: 'factor', rules: [{ required: true, message: 'El factor es obligatorio' }, { min: 0.01, message: 'Mínimo 0.01' }] },
            { name: 'description', rules: [{ required: true, message: 'La descripción es obligatoria' }, { minLength: 3, message: 'Mínimo 3 caracteres' }] },
        ];
        fields.forEach(({ name, rules }) => {
            const error = validateField(channel[name], rules);
            if (error) errs[name] = error;
        });
        if (!isEditing) {
            const colError = validateField(channel.column_name, [
                { required: true, message: 'El nombre de columna es obligatorio' },
                { pattern: PATTERNS.alphanumeric, message: 'Solo letras, números y guión bajo' },
            ]);
            if (colError) errs.column_name = colError;
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        const formData = new FormData();

        formData.append("name", sanitizeInput(channel.name || ""));
        formData.append("description", sanitizeInput(channel.description || ""));
        formData.append("averaging_period", sanitizeInput(channel.averaging_period || ""));
        formData.append("factor", sanitizeInput(channel.factor || ""));
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
                    navigate(`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${response?.item?.uuid}`);
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
                        className={errors.name ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.name || ''}</span>
                </div>            
                <div className={stylesForms.formInput}>
                    <label htmlFor="column_name">Nombre de Columna:</label>
                    <input
                        type="text"
                        name="column_name"
                        id="column_name"
                        value={channel.column_name}
                        onChange={handleChange}
                        className={errors.column_name ? stylesForms.formInputError : ''}
                        required
                        disabled={isEditing}
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.column_name || ''}</span>
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="averaging_period">Tiempo a Promediar (Minutos):</label>
                    <input
                        type="number"
                        name="averaging_period"
                        id="averaging_period"
                        value={channel.averaging_period}
                        onChange={handleChange}
                        className={errors.averaging_period ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.averaging_period || ''}</span>
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
                        className={errors.factor ? stylesForms.formInputError : ''}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.factor || ''}</span>
                </div>

            </div>
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="description">Descripción:</label>
                    <textarea
                        className={`${stylesForms.formInputTextarea}${errors.description ? ` ${stylesForms.formInputError}` : ''}`}
                        name="description"
                        id="description"
                        value={channel.description}
                        onChange={handleChange}
                        required
                    />
                    <span className={stylesForms.formErrorMessage}>{errors.description || ''}</span>
                </div>
            </div>

            <button type="submit" className={stylesForms.formBtn}>
                Guardar Canal
            </button>
        </form>
    );
};
