import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { 
  HiOutlineArrowDownTray, 
  HiOutlineBookmarkSquare,
  HiOutlineFunnel
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import { useChecklist, useSaveChecklist, useExportChecklist, useChecklistStatistics } from '../hooks/useChecklist';
import { useActiveAreas } from '../hooks/useAreas';
import { Button, Select, DatePicker, Toggle, Spinner, EmptyState } from '../components/common';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedArea, setSelectedArea] = useState('');
  const [localChanges, setLocalChanges] = useState({});
  const [isExporting, setIsExporting] = useState(false);

  const { data: checklist, isLoading: checklistLoading, error: checklistError } = useChecklist(selectedDate, selectedArea || null);
  const { data: statistics } = useChecklistStatistics(selectedDate);
  const { data: areas, isLoading: areasLoading } = useActiveAreas();
  const { mutate: saveChecklist, isPending: isSaving } = useSaveChecklist();
  const { exportCSV } = useExportChecklist();

  const areaOptions = useMemo(() => {
    if (!areas) return [];
    return areas.map(area => ({
      value: area._id,
      label: area.name
    }));
  }, [areas]);

  const mergedChecklist = useMemo(() => {
    if (!checklist) return [];
    return checklist.map(item => {
      const localChange = localChanges[item.task._id];
      return {
        ...item,
        entry: {
          ...item.entry,
          status: localChange?.status ?? item.entry?.status ?? false,
          staffName: localChange?.staffName ?? item.entry?.staffName ?? ''
        }
      };
    });
  }, [checklist, localChanges]);

  const handleStatusChange = useCallback((taskId, status) => {
    setLocalChanges(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        status
      }
    }));
  }, []);

  const handleStaffNameChange = useCallback((taskId, staffName) => {
    setLocalChanges(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        staffName
      }
    }));
  }, []);

  const handleSave = () => {
    const entries = mergedChecklist.map(item => ({
      taskId: item.task._id,
      status: item.entry.status,
      staffName: item.entry.staffName
    }));

    saveChecklist(
      { date: selectedDate, entries },
      {
        onSuccess: () => {
          setLocalChanges({});
        }
      }
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportCSV(selectedDate, selectedArea || null);
    } finally {
      setIsExporting(false);
    }
  };

  const hasChanges = Object.keys(localChanges).length > 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-800">
            Daily Checklist
          </h1>
          <p className="text-slate-500 mt-1">
            Track and manage daily tasks across all areas
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-xs text-emerald-600 font-medium">Completed</p>
              <p className="text-lg font-bold text-emerald-700">{statistics.completed}/{statistics.total}</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs text-amber-600 font-medium">Progress</p>
              <p className="text-lg font-bold text-amber-700">{statistics.completionRate}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
            />
            
            <div className="flex items-center gap-2">
              <HiOutlineFunnel className="w-5 h-5 text-slate-400 hidden sm:block" />
              <Select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                options={areaOptions}
                placeholder="All Areas"
                className="min-w-[180px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              icon={HiOutlineBookmarkSquare}
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!hasChanges}
            >
              Save
            </Button>

            {/* Download button - Admin only */}
            {isAdmin && (
              <Button
                variant="secondary"
                icon={HiOutlineArrowDownTray}
                onClick={handleExport}
                isLoading={isExporting}
              >
                Download
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Checklist Table */}
      <div className="card overflow-hidden">
        {checklistLoading || areasLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="large" />
          </div>
        ) : checklistError ? (
          <EmptyState
            title="Error loading checklist"
            description={checklistError.message || "Something went wrong. Please try again."}
          />
        ) : mergedChecklist.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="There are no tasks configured for this area. Contact an administrator to add tasks."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-24">Task ID</th>
                  <th className="w-40">Area</th>
                  <th className="w-36">Task Name</th>
                  <th className="min-w-[250px]">Description</th>
                  <th className="w-32 text-center">Status</th>
                  <th className="w-40">Staff Name</th>
                  <th className="w-44">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {mergedChecklist.map((item, index) => (
                  <tr 
                    key={item.task._id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td>
                      <span className="font-mono text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                        {item.task.taskId}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-slate-700">
                        {item.task.area?.name}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium text-slate-800">
                        {item.task.name}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-slate-600 line-clamp-2">
                        {item.task.description}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-center">
                        <Toggle
                          checked={item.entry.status}
                          onChange={(status) => handleStatusChange(item.task._id, status)}
                          size="small"
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.entry.staffName}
                        onChange={(e) => handleStaffNameChange(item.task._id, e.target.value)}
                        placeholder="Enter name"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 
                                   focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                                   transition-all duration-200"
                      />
                    </td>
                    <td>
                      <span className="text-sm text-slate-500">
                        {item.entry.completedAt 
                          ? format(new Date(item.entry.completedAt), 'dd MMM yyyy, HH:mm')
                          : '-'
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Save Button for Mobile */}
      {hasChanges && (
        <div className="fixed bottom-20 left-4 right-4 lg:hidden animate-slide-up">
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            className="w-full py-4 shadow-lg"
          >
            <HiOutlineBookmarkSquare className="w-5 h-5" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

