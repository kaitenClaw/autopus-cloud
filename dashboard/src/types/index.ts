export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  port: number;
  currentTask?: string;
  taskProgress?: number;
  lastHeartbeat: Date;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    tasksCompleted: number;
    uptime: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  deliverables: string[];
}

export interface CommunicationEvent {
  id: string;
  timestamp: Date;
  from: string;
  to: string;
  type: 'task_assignment' | 'status_update' | 'completion' | 'error';
  message: string;
  taskId?: string;
}

export interface SystemStatus {
  agents: Agent[];
  activeTasks: Task[];
  recentEvents: CommunicationEvent[];
  systemHealth: {
    overall: 'healthy' | 'warning' | 'critical';
    issues: string[];
  };
}
