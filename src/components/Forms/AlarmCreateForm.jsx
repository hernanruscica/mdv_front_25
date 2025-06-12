import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useAlarmsStore } from '../../store/alarmsStore';

export const AlarmCreateForm = ({ alarmData, isEditing, channelData }) => {
    const { channelId, alarmId, dataloggerId } = useParams();
    const { user } = useAuthStore();
    const { createAlarm, updateAlarm } = useAlarmsStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    //deberia traerlo de la api
    const alarmTypes = [ 
        { id: 0, type: "PORCENTAJE_ENCENDIDO", variables: "porcentaje_encendido", defaultValue: "50" }, 
        { id: 1, type: "FALLO_COMUNICACION", variables: "minutos_sin_conexion", defaultValue: "15" } 
    ]; 

    const [comparsionOperator, setComparsionOperator] = useState(">");
    const [comparsionValue, setComparsionValue] = useState(alarmTypes[0].defaultValue);
    const [comparsionVariable, setComparsionVariable] = useState(alarmTypes[0].variables);

    const [alarm, setAlarm] = useState({ 
        canal_id: channelId, 
        nombre: "", 
        descripcion: "", 
        periodo_tiempo: "15", 
        nombre_variables: comparsionVariable, 
        condicion: `${comparsionVariable} ${comparsionOperator} ${comparsionValue}`, 
        estado: "1", 
        usuario_id: user.id, 
        tipo_alarma: alarmTypes[0].type || "" 
    });

    useEffect(() => {
        if (isEditing && alarmData) {
            // Extraer el operador y el valor de la condición
            const condicionParts = alarmData.condicion.split(' ');
            const operator = condicionParts[1] || ">";
            const value = condicionParts[2] || alarmTypes[0].defaultValue;
            
            setComparsionOperator(operator);
            setComparsionValue(value);
            setComparsionVariable(alarmData.nombre_variables || alarmTypes[0].variables);
            
            setAlarm({
                canal_id: alarmData.canal_id || channelId,
                nombre: alarmData.nombre || "",
                descripcion: alarmData.descripcion || "",
                periodo_tiempo: alarmData.periodo_tiempo || "15",
                nombre_variables: alarmData.nombre_variables || alarmTypes[0].variables,
                condicion: alarmData.condicion || `${comparsionVariable} ${operator} ${value}`,
                estado: alarmData.estado || "1",
                usuario_id: alarmData.usuario_id || user.id,
                tipo_alarma: alarmData.tipo_alarma || alarmTypes[0].type
            });
        }
    }, [alarmData, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "tipo_alarma") {
            const selectedAlarmType = alarmTypes.find(a => a.type === value);
            const newComparsionVariable = selectedAlarmType ? selectedAlarmType.variables : comparsionVariable;
            setComparsionVariable(newComparsionVariable);
            setAlarm(prev => ({
                ...prev,
                [name]: value,
                nombre_variables: newComparsionVariable,
            }));
        } else {
            setAlarm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleChangeComparsion = (e) => {
        const { name, value } = e.target;
        if (name === "comparsion_operator") {
            setComparsionOperator(value);
            setAlarm(prev => ({
                ...prev,
                condicion: `${prev.nombre_variables} ${value} ${comparsionValue}`
            }));
        } else if (name === "comparsion_value") {
            setComparsionValue(value);
            setAlarm(prev => ({
                ...prev,
                condicion: `${prev.nombre_variables} ${comparsionOperator} ${value}`
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isEditing) {
                const response = await updateAlarm(alarmId, {
                    canal_id: alarm.canal_id,
                    nombre: alarm.nombre,
                    descripcion: alarm.descripcion,
                    periodo_tiempo: alarm.periodo_tiempo,
                    nombre_variables: alarm.nombre_variables,
                    condicion: alarm.condicion,
                    usuario_id: alarm.usuario_id,
                    tipo_alarma: alarm.tipo_alarma,
                    estado: alarm.estado
                });

                if (response.success) {
                    toast.success('Alarma actualizada exitosamente');
                    navigate(location.pathname.replace(/\/editar$/, ''));
                }
            } else {
                const response = await createAlarm({
                    canal_id: alarm.canal_id,
                    nombre: alarm.nombre,
                    descripcion: alarm.descripcion,
                    periodo_tiempo: alarm.periodo_tiempo,
                    nombre_variables: alarm.nombre_variables,
                    condicion: alarm.condicion,
                    usuario_id: alarm.usuario_id,
                    tipo_alarma: alarm.tipo_alarma
                });

                if (response.success) {
                    toast.success('Alarma creada exitosamente');
                    navigate(`/panel/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/${response.alarm.id}`);
                }
            }
        } catch (error) {
            toast.error('Error al procesar la alarma');
            console.error('Error al procesar la alarma:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) {
        return (
            <div className={stylesForms.loadingContainer}>
                <p>Procesando alarma...</p>
            </div>
        );
    }

    console.log("channelData:", channelData);

    return (
        <form onSubmit={handleSubmit} className={stylesForms.form}>
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        value={alarm.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="tipo_alarma">Tipo de Alarma:</label>
                    <select
                        name="tipo_alarma"
                        id="tipo_alarma"
                        value={alarm.tipo_alarma}
                        onChange={handleChange}
                        required
                    >
                        {alarmTypes.map((type) => (
                            <option key={type.id} value={type.type}>
                                {type.type}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea
                        className={stylesForms.formInputTextarea}
                        name="descripcion"
                        id="descripcion"
                        value={alarm.descripcion}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className={stylesForms.formInputGroup}>
                <div className={`${stylesForms.formInput} ${stylesForms.formInputSmall}`}>
                    <label>Condición resultante:</label>
                    <input
                        type="text"
                        value={alarm.condicion}
                        readOnly
                        disabled
                    />
                </div>
                <div className={`${stylesForms.formInput} ${stylesForms.formInputSmall}`}>
                    <label htmlFor="comparsion_operator">Comparación:</label>
                    <select
                        name="comparsion_operator"
                        id="comparsion_operator"
                        value={comparsionOperator}
                        onChange={handleChangeComparsion}
                        required
                    >
                        <option value=">">Mayor que</option>
                        <option value="<">Menor que</option>
                        <option value=">=">Mayor o igual que</option>
                        <option value="<=">Menor o igual que</option>
                        <option value="==">Igual a</option>
                    </select>
                </div>
                <div className={`${stylesForms.formInput} ${stylesForms.formInputSmall}`}>
                    <label htmlFor="comparsion_value">Valor:</label>
                    <input
                        type="number"
                        name="comparsion_value"
                        id="comparsion_value"
                        value={comparsionValue}
                        onChange={handleChangeComparsion}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="periodo_tiempo">Minutos a promediar, cambiar desde la edicion de canal.</label>
                    <input
                        type="number"
                        name="periodo_tiempo"
                        id="periodo_tiempo"
                        value={channelData?.tiempo_a_promediar || 15}
                        disabled
                        // onChange={handleChange}
                        // required
                    />
                </div>
            </div>

            <div className={stylesForms.formInputGroup}>
                
            </div>

            <button 
                type="submit" 
                className={stylesForms.formBtn}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Guardando...' : 'Guardar Alarma'}
            </button>
        </form>
    );
};



