import React,{ useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import stylesForms from './Forms.module.css';
import { useAuthStore } from '../../store/authStore';

export const AlarmCreateForm = ({ alarmData, isEditing}) => {
    const { channelId, alarmId } = useParams();
    const { user } = useAuthStore();

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
        } else if (name === "comparsion_value") { 
            setComparsionValue(value); 
        } 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();    
        const formData = new FormData();
        formData.append("canal_id", alarm.canal_id || "");
        formData.append("nombre", alarm.nombre || "");
        formData.append("descripcion", alarm.descripcion || "");
        formData.append("periodo_tiempo", alarm.periodo_tiempo || "");
        formData.append("nombre_variables", alarm.nombre_variables || "");       
        formData.append("condicion", alarm.condicion || "");    
        formData.append("estado", alarm.estado || "");   
        formData.append("usuario_id", alarm.usuario_id || "");   
        formData.append("tipo_alarma", alarm.tipo_alarma || "");   

        if (isEditing) {
            formData.append("id", alarmData.id);
            console.log("enviando datos EDITADOS de la alarma", formData);
        } else {
            console.log("enviando datos para CREAR la alarma", formData);
        }
    };
    
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
                    <label htmlFor="periodo_tiempo">Minutos hacia atrás:</label>
                    <input
                        type="number"
                        name="periodo_tiempo"
                        id="periodo_tiempo"
                        value={alarm.periodo_tiempo}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className={stylesForms.formInputGroup}>
                
            </div>

            <button type="submit" className={stylesForms.formBtn}>
                Guardar Alarma
            </button>
        </form>
    );
};



