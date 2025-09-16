import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit, FileText, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  due_date?: string;
  files?: Array<{
    id: number;
    filename: string;
    filepath: string;
  }>;
}

interface TaskCardProps {
  task: Task;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (id: number, status: Task['status']) => void;
}

const TaskCard = ({ task, onDelete, onEdit, onStatusChange }: TaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in_progress':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'To Do';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card 
      className={cn(
        "glass-card transition-smooth hover:shadow-glow cursor-pointer group",
        "border-border/50 hover:border-primary/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              {task.title}
            </CardTitle>
            <Badge className={cn("text-xs", getStatusColor(task.status))}>
              {getStatusText(task.status)}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                  isHovered && "opacity-100"
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {task.description}
        </CardDescription>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Created {formatDate(task.created_at)}</span>
          </div>
          
          {task.files && task.files.length > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{task.files.length} file{task.files.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {task.status !== 'todo' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(task.id, 'todo')}
              className="flex-1 text-xs"
            >
              Mark as To Do
            </Button>
          )}
          {task.status !== 'in_progress' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(task.id, 'in_progress')}
              className="flex-1 text-xs"
            >
              In Progress
            </Button>
          )}
          {task.status !== 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(task.id, 'completed')}
              className="flex-1 text-xs"
            >
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;