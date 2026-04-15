import { useRef, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useReportStore } from '../../../store/reportStore';
import { useChannelsStore } from '../../../store/channelsStore';
import { useUsersStore } from '../../../store/usersStore';
import { LoadingSpinner } from '../../../components/LoadingSpinner/LoadingSpinner';
import BreadcrumbAuto from '../../../components/Breadcrumb/BreadcrumbAuto';
import { Title1 } from '../../../components/Title1/Title1';
import ReportPreview from '../../../components/ReportPreview/ReportPreview';
import ReportExportButton from '../../../components/ReportPreview/ReportExportButton';
import { GetUserCurrentRole } from '../../../utils/userRoles';
import styles from './CreateReport.module.css';

const DATE_PRESETS = [
  { label: 'Hoy', value: 'today' },
  { label: 'Última semana', value: 'week' },
  { label: 'Último mes', value: 'month' },
  { label: 'Últimos 3 meses', value: '3months' },
  { label: 'Últimos 6 meses', value: '6months' },
  { label: 'Último año', value: 'year' }
];

const SECTIONS = [
  { key: 'totalUsageHours', label: 'Resumen de Uso' },
  { key: 'maintenance', label: 'Mantenimientos (tareas y observaciones)' },
  { key: 'alarmTriggers', label: 'Funcionamientos fuera de rango' },
  { key: 'energyFailures', label: 'Fallos de energía' }
];

const CreateReport = () => {
  const { businessUuid, dataloggerId, channelId } = useParams();
  const reportRef = useRef(null);

  const user = useAuthStore(state => state.user);
  const userCurrentRole = GetUserCurrentRole(user, businessUuid);
  const canGenerateReport = ['Owner', 'Administrator'].includes(userCurrentRole?.name);

  const {
    dateRange,
    selectedSections,
    loadingStates,
    generateReport,
    setDateRange,
    toggleSection,
    clearReport
  } = useReportStore();

  const {
    fetchChannelById,
    selectedChannel,
    loadingStates: { fetchChannel: isLoadingChannel }
  } = useChannelsStore();

  const {
    users,
    fetchUsers
  } = useUsersStore();

  const channelFirstDate = selectedChannel?.totalData?.first_date;
  
  const getMinDate = () => {
    if (!channelFirstDate) return undefined;
    return channelFirstDate.split('T')[0];
  };

  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    if (businessUuid && channelId) {
      fetchChannelById(channelId, businessUuid);
      fetchUsers(user, businessUuid);
    }
    return () => clearReport();
  }, [businessUuid, channelId]);

  const getPresetDates = (preset) => {
    const end = new Date();
    let start = new Date();

    switch (preset) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case '3months':
        start.setMonth(start.getMonth() - 3);
        break;
      case '6months':
        start.setMonth(start.getMonth() - 6);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        return { start: null, end: null };
    }

    return { start: start.toISOString(), end: end.toISOString() };
  };

  const handlePresetClick = (preset) => {
    setActivePreset(preset);
    if (preset === null) {
      setDateRange(null, null);
    } else {
      const dates = getPresetDates(preset);
      setDateRange(dates.start, dates.end);
    }
  };

  const handleDateChange = (type, value) => {
    setActivePreset(null);
    if (value) {
      const date = new Date(value);
      date.setHours(23, 59, 59, 999);
      setDateRange(
        type === 'start' ? date.toISOString() : dateRange.start,
        type === 'end' ? date.toISOString() : dateRange.end
      );
    } else {
      setDateRange(
        type === 'start' ? null : dateRange.start,
        type === 'end' ? null : dateRange.end
      );
    }
  };

  const handleGenerateReport = async () => {
    const data = await generateReport(
      businessUuid,
      channelId,
      selectedChannel?.datalogger?.uuid,
      dateRange.start,
      dateRange.end
    );
    if (data) {
      setReportData(data);
      setReportGenerated(true);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  if (!canGenerateReport) {
    return (
      <div className={styles.accessDenied}>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para generar informes.</p>
        <Link to={`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${channelId}`}>
          Volver al canal
        </Link>
      </div>
    );
  }

  if (isLoadingChannel) {
    return <LoadingSpinner message="Cargando datos del canal..." />;
  }

  const admins = users
    ?.filter(us => us?.businesses_roles?.some(
      br => br.uuid === businessUuid && (br.role === 'Administrator' || br.role === 'Owner')
    ))
    ?.map(us => `${us.first_name} ${us.last_name}`);

  return (
    <div className={styles.container}>
      <BreadcrumbAuto />

      <Title1 text="Generar Informe" type="reportes" />

      <div className={styles.content}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Configuración del Informe</h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>Período</label>
            <div className={styles.dateInputs}>
              <input
                type="date"
                className={styles.dateInput}
                value={formatDateForInput(dateRange.start)}
                onChange={(e) => handleDateChange('start', e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
              />
              <span className={styles.dateSeparator}>hasta</span>
              <input
                type="date"
                className={styles.dateInput}
                value={formatDateForInput(dateRange.end)}
                onChange={(e) => handleDateChange('end', e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
              />
            </div>
            <div className={styles.presets}>
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`${styles.presetBtn} ${activePreset === preset.value ? styles.presetBtnActive : ''}`}
                  onClick={() => handlePresetClick(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                className={`${styles.presetBtn} ${activePreset === null && !dateRange.start ? styles.presetBtnActive : ''}`}
                onClick={() => handlePresetClick(null)}
              >
                Todo el período
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Seleccionar datos a incluir</label>
            <div className={styles.checkboxGrid}>
              {SECTIONS.map((section) => (
                <label key={section.key} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedSections[section.key]}
                    onChange={() => toggleSection(section.key)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>{section.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={loadingStates.generateReport}
            className={styles.generateBtn}
          >
            {loadingStates.generateReport ? (
              'Generando...'
            ) : (
              <>
                <img src="/icons/chart-line-solid.svg" alt="" className={styles.btnIcon} />
                Generar Informe
              </>
            )}
          </button>
        </div>

        {reportGenerated && reportData && (
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <h2 className={styles.sectionTitle}>Previsualización</h2>
              <ReportExportButton reportRef={reportRef} />
            </div>
            <div className={styles.previewContainer}>
              <div ref={reportRef}>
                <ReportPreview
                  reportData={reportData}
                  selectedSections={selectedSections}
                  dateRange={dateRange}
                  admins={admins}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateReport;
