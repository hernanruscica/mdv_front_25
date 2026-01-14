import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, data } from 'react-router-dom';
import toast from 'react-hot-toast';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';
import { useAlarmsStore } from '../../store/alarmsStore';

export const AlarmCreateForm = ({ alarmData, isEditing, dataloggerData, channelData }) => {
    const { businessUuid, channelId, alarmId, dataloggerId } = useParams();
    const { user } = useAuthStore();
    const { 
        selectedAlarm, 
        fetchAlarmById,
        createAlarm, 
        loadingStates : { fetchAlarm : isLoadingAlarm },
        updateAlarm 
    } = useAlarmsStore();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // CONFIGURACIÓN DE TIPOS DE ALARMA
    // label: Nombre bonito para el selector.
    // variableLabels: Nombres bonitos para mostrar en la condición (ej: "Lectura" en vez de "value")
    const alarmTypes = [
        { 
            id: 0, 
            type: "porcentage_on", 
            label: "Porcentaje de Encendido", 
            variables: ["value"], 
            variableLabels: ["Lectura"], 
            defaultValue: "50" 
        },
        { 
            id: 1, 
            type: "comunication_failure", 
            label: "Fallo de Comunicación", 
            variables: ["value"], 
            variableLabels: ["Minutos sin señal"], 
            defaultValue: "5" 
        },
        { 
            id: 2, 
            type: "simultaneous_on", 
            label: "Encendido Simultáneo", 
            variables: ["value01", "value02"], 
            variableLabels: ["Canal 1", "Canal 2"], 
            defaultValue: "5" 
        },
    ];

    // ESTADOS UI
    const [comparsionOperator, setComparsionOperator] = useState(">");
    const [comparsionValue, setComparsionValue] = useState(alarmTypes[0].defaultValue);
    
    // Estado auxiliar para tener siempre a mano la configuración del tipo seleccionado
    const [selectedTypeObj, setSelectedTypeObj] = useState(alarmTypes[0]);

    // ESTADO DEL FORMULARIO
    const [alarm, setAlarm] = useState({
        businessUuid: businessUuid || "",
        datalogger_uuid : dataloggerId || "",
        channel_uuid: channelId,
        table_name: dataloggerData?.table_name || "",
        column_name: channelData?.column_name || "",
        name: "",
        description: "",
        time_range: "15",
        condition_logic: "", // Se genera automáticamente
        condition_show: "",  // Se genera automáticamente
        var01: null,         // Guardará el threshold (valor umbral)
        is_active: true,
        userId: user.id,
        alarm_type: alarmTypes[0].type
    });

    // 1. SOLUCIÓN ASÍNCRONA (F5 - Props del Padre)
    // Actualiza table_name y column_name cuando las props terminan de cargar
    useEffect(() => {
        setAlarm(prev => ({
            ...prev,
            table_name: dataloggerData?.table_name || prev.table_name,
            column_name: channelData?.column_name || prev.column_name
        }));
    }, [dataloggerData, channelData]);

    // 1.5. SOLUCIÓN ASÍNCRONA (F5 - Alarma ID) -> NUEVO
    // Si estamos editando, no hay alarmData (reload), pero tenemos IDs, buscamos en el store.
    useEffect(() => {
        if (isEditing && !alarmData && businessUuid && alarmId) {
            fetchAlarmById(businessUuid, alarmId);
        }
    }, [isEditing, alarmData, businessUuid, alarmId, fetchAlarmById]);


    // 2. CONSTRUCTOR DE LÓGICA (condition_logic y condition_show)
    // Se ejecuta cada vez que cambia el tipo, el operador o el valor
    useEffect(() => {
        let newLogic = "";
        let newShow = "";
        
        // Obtenemos las variables crudas y sus etiquetas humanas
        const vLabels = selectedTypeObj.variableLabels || ["Valor"]; 
        const vRaw = selectedTypeObj.variables;

        if (selectedTypeObj.type === "simultaneous_on") {
            // Caso especial: Dos variables
            // Lógica INTERNA (MathJS): value01 > 5 and value02 > 5
            newLogic = `${vRaw[0]} ${comparsionOperator} ${comparsionValue} and ${vRaw[1]} ${comparsionOperator} ${comparsionValue}`;
            
            // Lógica VISUAL (Humano): Canal 1 > 5 y Canal 2 > 5
            newShow = `${vLabels[0]} ${comparsionOperator} ${comparsionValue} y ${vLabels[1]} ${comparsionOperator} ${comparsionValue}`;
        } else {
            // Caso estándar: Una variable
            // Lógica INTERNA: value > 50
            newLogic = `${vRaw[0]} ${comparsionOperator} ${comparsionValue}`;
            
            // Lógica VISUAL: Lectura > 50
            newShow = `${vLabels[0]} ${comparsionOperator} ${comparsionValue}`;
        }

        setAlarm(prev => ({
            ...prev,
            condition_logic: newLogic,
            condition_show: newShow,
            var01: comparsionValue // Guardamos el threshold aquí
        }));
    }, [selectedTypeObj, comparsionOperator, comparsionValue]);

    // 3. CARGA DE DATOS PARA EDICIÓN
    useEffect(() => {
        // Definimos la fuente de datos: O viene por props (navegación interna) o del store (F5/fetch)
        const dataToLoad = alarmData || selectedAlarm;

        if (isEditing && dataToLoad) {
            // Encontrar el objeto de configuración basado en el tipo guardado
            const currentTypeObj = alarmTypes.find(t => t.type === dataToLoad.alarm_type) || alarmTypes[0];
            setSelectedTypeObj(currentTypeObj);

            // Recuperar operador (asumimos formato estricto: "var op valor")
            const conditionParts = dataToLoad.condition_logic ? dataToLoad.condition_logic.split(' ') : [];
            const recoveredOperator = conditionParts[1] || ">";
            
            // Recuperar Valor desde var01 (fuente de verdad segura)
            const recoveredValue = dataToLoad.var01 || currentTypeObj.defaultValue;

            setComparsionOperator(recoveredOperator);
            setComparsionValue(recoveredValue);

            setAlarm({
                businessUuid: dataToLoad.businessUuid || businessUuid,
                datalogger_uuid : dataToLoad.datalogger_uuid || dataloggerId,
                channel_uuid: dataToLoad.channel_uuid || channelId,
                table_name: dataloggerData?.table_name || "", 
                column_name: channelData?.column_name || "",
                name: dataToLoad.name || "",
                description: dataToLoad.description || "",
                time_range: dataToLoad.time_range || "15",
                condition_logic: dataToLoad.condition_logic,
                condition_show: dataToLoad.condition_show,
                var01: recoveredValue,
                is_active: dataToLoad.is_active !== undefined ? dataToLoad.is_active : true,
                userId: user.id,
                alarm_type: dataToLoad.alarm_type
            });
        }
    }, [alarmData, selectedAlarm, isEditing, channelId, businessUuid, user.id]); // Agregado selectedAlarm a dependencias

    // MANEJADORES DE EVENTOS

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "alarm_type") {
            const typeFound = alarmTypes.find(a => a.type === value);
            if (typeFound) {
                setSelectedTypeObj(typeFound);
                setComparsionValue(typeFound.defaultValue); // Resetear valor por defecto al cambiar tipo
                setAlarm(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setAlarm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleChangeComparsion = (e) => {
        const { name, value } = e.target;
        if (name === "comparsion_operator") setComparsionOperator(value);
        if (name === "comparsion_value") setComparsionValue(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const alarmPayload = {
            ...alarm,
            time_range: channelData?.time_range || alarm.time_range,
            var01: comparsionValue // Aseguramos envío del threshold
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
                    navigate(`/panel/dataloggers/${dataloggerId}/canales/${channelId}/`);
                }
            }
        } catch (error) {
            toast.error('Error al procesar la alarma');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) {
        return <div className={stylesForms.loadingContainer}><p>Procesando...</p></div>;
    }

    // Si estamos editando, no hay datos aún y estamos cargando del store:
    if (isEditing && !alarmData && isLoadingAlarm) {
        return <div className={stylesForms.loadingContainer}><p>Cargando datos de la alarma...</p></div>;
    }

    return (
        <form onSubmit={handleSubmit} className={stylesForms.form}>
            {/* GRUPO 1: Nombre y Tipo */}
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
                        placeholder="Ej: Alerta alta temperatura"
                    />
                </div>
                <div className={stylesForms.formInput}>
                    <label htmlFor="alarm_type">Tipo de Alarma:</label>
                    <select
                        name="alarm_type"
                        id="alarm_type"
                        value={alarm.alarm_type}
                        onChange={handleChange}
                        disabled={isEditing} // No permitir cambiar tipo al editar
                        required
                    >
                        {alarmTypes.map((type) => (
                            <option key={type.id} value={type.type}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* GRUPO 2: Descripción */}
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
                        placeholder="Breve descripción de cuándo se dispara esta alarma..."
                    />
                </div>
            </div>

            {/* GRUPO 3: Lógica y Valores */}
            <div className={stylesForms.formInputGroup}>
                {/* Visualización amigable de la condición */}
                <div className={`${stylesForms.formInput} ${stylesForms.formInputSmall}`}>
                    <label>Resumen Condición:</label>
                    <input
                        type="text"
                        value={alarm.condition_show}
                        readOnly
                        disabled
                        style={{ background: '#f8f9fa', color: '#333', fontWeight: '500' }}
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
                        <option value=">">Mayor que ({'>'})</option>
                        <option value="<">Menor que ({'<'})</option>
                        <option value=">=">Mayor o igual ({'>='})</option>
                        <option value="<=">Menor o igual ({'<='})</option>
                        <option value="==">Igual a (==)</option>
                    </select>
                </div>

                <div className={`${stylesForms.formInput} ${stylesForms.formInputSmall}`}>
                    <label htmlFor="comparsion_value">Valor (Umbral):</label>
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
                    <label htmlFor="time_range">Minutos a promediar:</label>
                    <input
                        type="number"
                        name="time_range"
                        id="time_range"
                        value={channelData?.tiempo_a_promediar || alarm.time_range}
                        disabled
                        title="Heredado de la configuración del canal"
                    />
                </div>
            </div>

            <button type="submit" className={stylesForms.formBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Alarma' : 'Crear Alarma')}
            </button>
        </form>
    );
};