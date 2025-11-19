import { Task, Note } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Upload, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DataExportProps {
  tasks: Task[];
  onImport?: (tasks: Task[]) => void;
}

export function DataExport({ tasks, onImport }: DataExportProps) {
  const handleExportJSON = async () => {
    try {
      // Get all related data
      const { data: notes } = await supabase.from('notes').select('*');
      const { data: tags } = await supabase.from('tags').select('*');
      const { data: timeSessions } = await supabase.from('task_time_sessions').select('*');
      const { data: aiAnalysis } = await supabase.from('ai_analysis').select('*');

      const exportData = {
        exportDate: new Date().toISOString(),
        tasks,
        notes: notes || [],
        tags: tags || [],
        timeSessions: timeSessions || [],
        aiAnalysis: aiAnalysis || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homework-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Title', 'Description', 'Category', 'Priority', 'Progress', 'Status', 'Due Date', 'Time Spent (hours)'];
      const rows = tasks.map(task => [
        task.title,
        task.description || '',
        task.category,
        task.priority,
        task.progress,
        task.completed ? 'Completed' : 'In Progress',
        task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
        task.totalTimeSpent ? (task.totalTimeSpent / 3600).toFixed(2) : '0',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homework-tracker-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.tasks && Array.isArray(data.tasks)) {
          onImport?.(data.tasks);
          toast.success(`Imported ${data.tasks.length} tasks!`);
        } else {
          toast.error('Invalid file format');
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import data');
      }
    };
    reader.readAsText(file);
  };

  const handleArchiveCompleted = () => {
    const completed = tasks.filter(t => t.completed);
    if (completed.length === 0) {
      toast.info('No completed tasks to archive');
      return;
    }

    const blob = new Blob([JSON.stringify(completed, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `completed-tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Archived ${completed.length} completed tasks!`);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Management</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Export</h4>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-2" />
                Export as JSON (Full Backup)
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export as CSV (Tasks Only)
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleArchiveCompleted}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Completed Tasks
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Import</h4>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <label>
                  <Upload className="h-4 w-4 mr-2" />
                  Import from JSON
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </label>
              </Button>
              <p className="text-xs text-muted-foreground">
                Import previously exported JSON files to restore your data
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-md">
          <strong>Note:</strong> JSON exports include all your data (tasks, notes, tags, time tracking, AI analysis). 
          CSV exports only include basic task information and are useful for spreadsheets.
        </div>
      </div>
    </Card>
  );
}
