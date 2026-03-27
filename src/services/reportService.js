import { dataService } from './dataService';
import { maintenanceLogsService } from './maintenanceLogsService';
import { alarmLogsService } from './alarmLogsService';

const filterByDateRange = (items, start, end) => {
  if (!start && !end) return items;

  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  return items.filter(item => {
    const itemDate = new Date(item.triggered_at || item.created_at);
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  });
};

export const reportService = {
  getReportData: async (businessUuid, channelUuid, dataloggerUuid, start, end) => {
    try {
      const [channelData, maintenanceResponse, alarmLogs, periodResponse] = await Promise.all([
        dataService.getChannelUsage(businessUuid, dataloggerUuid, channelUuid),
        maintenanceLogsService.getAllByChannel(businessUuid, dataloggerUuid, channelUuid),
        alarmLogsService.getByDataloggerId(businessUuid, dataloggerUuid),
        dataService.getTotalOnTime(businessUuid, channelUuid, start, end)
      ]);

      const filteredMaintenanceLogs = filterByDateRange(
        maintenanceResponse?.items || [],
        start, end
      );

      const filteredAlarmLogs = filterByDateRange(alarmLogs, start, end);

      const comunicationFailures = filteredAlarmLogs.filter(
        log => log.alarm_type === 'comunication_failure'
      );

      const alarmTriggers = filteredAlarmLogs.filter(log => log.triggered === 1);

      const maintenanceByType = {
        tasks: filteredMaintenanceLogs.filter(log => log.type === 'task'),
        observations: filteredMaintenanceLogs.filter(log => log.type === 'observation')
      };

      const hasPeriodData = periodResponse?.success && periodResponse.data !== null;
      const periodData = hasPeriodData ? periodResponse.data : null;

      return {
        channelData,
        maintenanceLogs: filteredMaintenanceLogs,
        maintenanceByType,
        alarmLogs: filteredAlarmLogs,
        periodData,
        hasPeriodData,
        summary: {
          totalUsageHours: channelData?.totalData?.total_time_on_hours || 0,
          avgFunctioning: channelData?.totalData?.average_usage_percentage || 0,
          firstDate: channelData?.totalData?.first_date || null,
          lastDate: channelData?.totalData?.last_date || null,
          periodUsageHours: periodData?.total_time_on_hours || null,
          periodAvgFunctioning: periodData?.average_usage_percentage || null,
          periodFirstDate: periodData?.first_date || null,
          periodLastDate: periodData?.last_date || null,
          periodRegistersQuantity: periodData?.registers_quantity || 0,
          comunicationFailuresCount: comunicationFailures.length,
          alarmTriggersCount: alarmTriggers.length,
          energyFailuresCount: null,
          energyFailuresPlaceholder: true
        },
        details: {
          comunicationFailures,
          alarmTriggers,
          maintenanceLogs: filteredMaintenanceLogs
        }
      };
    } catch (error) {
      console.error('Error in reportService.getReportData:', error);
      throw error;
    }
  }
};
