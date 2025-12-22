import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useAlarmsStore } from '../../store/alarmsStore';

export const AlarmCreateForm = ({ alarmData, isEditing, dataloggerData , channelData }) => {
    const { businessUuid, channelId, alarmId, dataloggerId } = useParams();
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
        businessUuid: businessUuid || "",
        channel_uuid: channelId,
        table_name: dataloggerData?.table_name ||  "",
        column_name: channelData?.column_name || "",
        name: "",
        description: "",
        time_range: "15",
        condition_logic: `${comparsionVariable} ${comparsionOperator} ${comparsionValue}`,
        condition_show: `${comparsionVariable} ${comparsionOperator} ${comparsionValue}`,
        var01: null,
        is_active: true,
        userId: user.id,
        alarm_type: alarmTypes[0].type || ""
    });

    useEffect(() => {
        // Update condition fields whenever comparison parts change
        const newCondition = `${comparsionVariable} ${comparsionOperator} ${comparsionValue}`;
        setAlarm(prev => ({
            ...prev,
            condition_logic: newCondition,
            condition_show: newCondition,
            var01: comparsionValue
        }));
    }, [comparsionVariable, comparsionOperator, comparsionValue]);

    useEffect(() => {
        if (isEditing && alarmData) {
            // Extraer el operador y el valor de la condición
            const conditionParts = alarmData.condition_show.split(' ');
            const variable = conditionParts[0] || alarmTypes[0].variables;
            const operator = conditionParts[1] || ">";
            const value = conditionParts[2] || alarmTypes[0].defaultValue;

            setComparsionVariable(variable);
            setComparsionOperator(operator);
            setComparsionValue(value);

            setAlarm({
                businessUuid: alarmData.businessUuid || businessUuid,
                channel_uuid: alarmData.channel_uuid || channelId,
                name: alarmData.name || "",
                description: alarmData.description || "",
                time_range: alarmData.time_range || "15",
                condition_logic: alarmData.condition_logic || `${variable} ${operator} ${value}`,
                condition_show: alarmData.condition_show || `${variable} ${operator} ${value}`,
                is_active: alarmData.is_active !== undefined ? alarmData.is_active : true,
                userId: user.id,
                alarm_type: alarmData.alarm_type || alarmTypes[0].type
            });
        }
    }, [alarmData, isEditing, channelId, businessUuid, user.id]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "alarm_type") {
            const selectedAlarmType = alarmTypes.find(a => a.type === value);
            if (selectedAlarmType) {
                setComparsionVariable(selectedAlarmType.variables);
                setComparsionValue(selectedAlarmType.defaultValue);
                setAlarm(prev => ({
                    ...prev,
                    [name]: value,
                }));
            }
        } else {
            setAlarm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleChangeComparsion = (e) => {
        const { name, value } = e.target;
        if (name === "comparsion_operator") {
            setComparsionOperator(value);
        } else if (name === "comparsion_value") {
            setComparsionValue(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const alarmPayload = {
            ...alarm,
            time_range: channelData?.time_range || alarm.time_range,
        };

        try {
            if (isEditing) {
                const response = await updateAlarm(alarmId, alarmPayload);
                if (response.success) {
                    toast.success('Alarma actualizada exitosamente');
                    navigate(location.pathname.replace(/\/editar$/, ''));
                }
            } else {
                const response = await createAlarm(alarmPayload);
                if (response.success) {
                    toast.success('Alarma creada exitosamente');
                    navigate(`/panel/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/`);
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

    // console.log('comparsionVariable',comparsionVariable);
    // console.log('comparsionOperator', comparsionOperator);
    // console.log('comparsionValue', comparsionValue);
    
    
    

    return (
        <form onSubmit={handleSubmit} className={stylesForms.form}>
            <div className={stylesForms.formInputGroup}>
                <div className={stylesForms.formInput}>
                    <label htmlFor="name">Nombre:</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={alarm.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="alarm_type">Tipo de Alarma:</label>
                    <select
                        name="alarm_type"
                        id="alarm_type"
                        value={alarm.alarm_type}
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
                    <label htmlFor="description">Descripción:</label>
                    <textarea
                        className={stylesForms.formInputTextarea}
                        name="description"
                        id="description"
                        value={alarm.description}
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
                        value={alarm.condition_show}
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
                    <label htmlFor="time_range">Minutos a promediar (del canal):</label>
                    <input
                        type="number"
                        name="time_range"
                        id="time_range"
                        value={channelData?.tiempo_a_promediar || alarm.time_range}
                        disabled
                    />
                </div>
            </div>

            <button
                type="submit"
                className={stylesForms.formBtn}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Alarma' : 'Crear Alarma')}
            </button>
        </form>
    );
};
