import { useEffect, useState, useCallback } from 'react';
import { Title1 } from '../../components/Title1/Title1';
import BreadcrumbAuto from '../../components/Breadcrumb/BreadcrumbAuto';
import { useAuthStore } from '../../store/authStore';
import { useBackendLogsStore } from '../../store/backendLogsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './BackendLogs.module.css';
import Table from '../../components/Table/Table';
import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';
import { BACKEND_LOGS_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole } from '../../utils/userRoles';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import ModalViewBackendLog from '../../components/ModalViewBackendLog/ModalViewBackendLog';

const LOG_TYPE_LABELS = {
  cronjob: 'Cronjob',
  user: 'Login',
  system: 'Sistema',
  data: 'Datos',
  users: 'Usuarios',
  businesses: 'Ubicaciones',
  alarms: 'Alarmas',
  channels: 'Canales',
  dataloggers: 'Dataloggers',
  solutions: 'Soluciones',
};

const LOG_TYPE_OPTIONS = [
  { value: '', label: 'Todos' },
  ...Object.entries(LOG_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const LOG_LEVEL_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Advertencia' },
  { value: 'error', label: 'Error' },
];

const ACTION_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'create', label: 'Crear' },
  { value: 'update', label: 'Actualizar' },
  { value: 'delete', label: 'Eliminar' },
];

const BackendLogs = () => {
  const user = useAuthStore(state => state.user);
  const {
    backendLogs,
    loadingStates: { fetchLogs: isLoading },
    error,
    filters,
    fetchBackendLogs,
    fetchBackendLogById,
    setFilters,
    clearSelectedLog,
    selectedLog,
  } = useBackendLogsStore();

  const [localFilters, setLocalFilters] = useState(filters);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const userCurrentRole = GetUserCurrentRole(user);
  const infoData = userCurrentRole?.name === 'Owner' ? BACKEND_LOGS_INFO.Owner : null;

  const loadLogs = useCallback(async (filtros) => {
    await fetchBackendLogs(filtros);
  }, [fetchBackendLogs]);

  useEffect(() => {
    loadLogs(filters);
  }, []);

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetDates = () => {
    setLocalFilters(prev => ({ ...prev, start_date: '', end_date: '' }));
  };

  const handleSearch = () => {
    setFilters(localFilters);
    loadLogs(localFilters);
  };

  const handleRowClick = async (row) => {
    setLoadingDetail(true);
    setModalIsOpen(true);
    await fetchBackendLogById(row.uuid);
    setLoadingDetail(false);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    clearSelectedLog();
  };

  const getLogLevelLabel = (level) => {
    switch (level) {
      case 'error': return 'Error';
      case 'warn': return 'Advertencia';
      case 'info': return 'Info';
      default: return level || 'N/A';
    }
  };

  const columns = [
    { label: 'FECHA / HORA', accessor: 'fecha', icon: '/icons/clock-regular.svg' },
    { label: 'TIPO', accessor: 'tipo', icon: '/icons/folder-open-regular.svg' },
    { label: 'NIVEL', accessor: 'nivel', icon: '/icons/triangle-exclamation.svg' },
    { label: 'ACCIÓN', accessor: 'accion', icon: '/icons/code-branch-solid.svg' },
    { label: 'DETALLE', accessor: 'detalle', icon: '/icons/info.svg' },
  ];

  const preparedData = backendLogs.length > 0
    ? backendLogs.map(log => ({
        uuid: log.uuid,
        fecha: FormatearFechaCompleta(log.created_at),
        tipo: LOG_TYPE_LABELS[log.log_type] || log.log_type,
        nivel: getLogLevelLabel(log.log_level),
        accion: log.action || '—',
        detalle: log.details?.length > 80 ? log.details.substring(0, 80) + '…' : log.details || '—',
        log_level: log.log_level,
      }))
    : [];

  if (!userCurrentRole || userCurrentRole?.name !== 'Owner') {
    return (
      <>
        <Title1 type="historial" text="Historial del servidor" />
        <p className={styles.noAccess}>No tienes permisos para acceder a esta sección.</p>
      </>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <>
      <Title1 type="historial" text="Historial del servidor" />
      {infoData && <InfoAccordion data={infoData} />}
      <BreadcrumbAuto />

      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Tipo</label>
          <select
            className={styles.filterSelect}
            value={localFilters.log_type}
            onChange={(e) => handleFilterChange('log_type', e.target.value)}
          >
            {LOG_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Nivel</label>
          <select
            className={styles.filterSelect}
            value={localFilters.log_level}
            onChange={(e) => handleFilterChange('log_level', e.target.value)}
          >
            {LOG_LEVEL_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Acción</label>
          <select
            className={styles.filterSelect}
            value={localFilters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
          >
            {ACTION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Resultados</label>
          <input
            type="number"
            className={styles.filterInput}
            value={localFilters.limit}
            onChange={(e) => handleFilterChange('limit', e.target.value)}
            min={1}
            max={500}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Entre fechas</label>
          <div className={styles.dateRangeContainer}>
            <input
              type="date"
              className={styles.filterDate}
              value={localFilters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
            />
            <span className={styles.dateSeparator}>a</span>
            <input
              type="date"
              className={styles.filterDate}
              value={localFilters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
            />
            <button
              type="button"
              className={styles.resetDatesBtn}
              onClick={handleResetDates}
              title="Limpiar fechas"
            >
              ✕
            </button>
          </div>
        </div>

        <div className={styles.filterButtonContainer}>
          <BtnCallToAction
            text="Buscar"
            icon="search-solid-grey.svg"
            onClick={handleSearch}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Cargando historial..." />
      ) : (
        <div className={styles.tableContainer}>
          <Table
            columns={columns}
            data={preparedData}
            onRowClick={handleRowClick}
            showAddButton={false}
            getRowClassName={(row) => {
              if (row.log_level === 'error') return styles.rowError;
              if (row.log_level === 'warn') return styles.rowWarn;
              return '';
            }}
          />
        </div>
      )}

      <ModalViewBackendLog
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        log={selectedLog}
        isLoading={loadingDetail}
      />
    </>
  );
};

export default BackendLogs;
