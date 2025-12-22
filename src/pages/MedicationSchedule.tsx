import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { medicationService } from "@/services/medicationService";
import { MedicationTask } from "@/types/Medication/medication";

const MedicationSchedule = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<MedicationTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await medicationService.getTodayTasks(); 
      setTasks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load medication schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'taken' | 'skipped') => {
    try {
      await medicationService.markStatus(id, status);

      setTasks(prev => prev.map(t => 
        t.id === id ? { ...t, status: status } : t
      ));

      toast({
        title: status === 'taken' ? "Success" : "Skipped",
        description: status === 'taken' 
          ? "Medication marked as taken." 
          : "Medication skipped.",
        className: status === 'taken' ? "bg-green-100 border-green-500" : "",
      });

    } catch (error) {
      toast({ title: "Error", description: "Failed to update status" });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Pill className="text-primary w-8 h-8" />
        <h1 className="text-2xl font-bold text-foreground">Daily Medication Schedule</h1>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className={`transition-all ${task.status === 'taken' ? 'bg-green-50/50 border-green-200' : 'bg-card'}`}>
            <CardContent className="p-4 flex items-center justify-between">
              
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{task.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {task.dosage} • <span className="font-bold text-primary">{task.scheduledTime}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {task.status === 'pending' ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAction(task.id, 'skipped')}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      Skip
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleAction(task.id, 'taken')}
                      className="bg-green-600 hover:bg-green-700 text-white gap-1"
                    >
                      <CheckCircle size={16} /> Taken
                    </Button>
                  </>
                ) : (
                  <div className={`flex items-center gap-2 font-medium ${task.status === 'taken' ? 'text-green-600' : 'text-red-500'}`}>
                    {task.status === 'taken' ? <CheckCircle size={18}/> : <XCircle size={18}/>}
                    {task.status === 'taken' ? "Taken" : "Skipped"}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
      
      {tasks.length === 0 && (
        <p className="text-center text-muted-foreground mt-10">No medication scheduled for today.</p>
      )}
    </div>
  );
};

export default MedicationSchedule;