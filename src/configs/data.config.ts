import { WorkflowStateData } from '../interfaces/state-language.interface';

export const data: WorkflowStateData = {
  StartAt: 'StartEvent',
  States: {
    StartEvent: {
      Type: 'Task',
      Next: 'SendEmail10',
      Parameters: {
        taskType: 'calendar',
        taskIcon: 'calendar-icon',
        stateKey: 'StartEvent',
      },
      Comment: 'Calendar',
    },
    SendEmail10: {
      Type: 'Task',
      Next: 'SendEmail11',
      Parameters: {
        taskType: 'sendEmail',
        taskIcon: 'email-icon',
        stateKey: 'SendEmail10',
      },
      Comment: 'Send some Email',
    },
    SendEmail11: {
      Type: 'Task',
      Next: 'AssignATask2',
      Parameters: {
        taskType: 'sendDirectMessage',
        taskIcon: 'slack-icon',
        stateKey: 'SendEmail11',
      },
      Comment: 'Send direct Message',
    },
    AssignATask2: {
      Type: 'Task',
      Next: 'Complete',
      Parameters: {
        taskType: 'assignTask',
        taskIcon: 'assign-task-icon',
        stateKey: 'AssignATask2',
      },
      Comment: 'Assign Approval task to Manager',
    },
    Complete: {
      Type: 'Task',
      End: true,
      Parameters: {
        taskType: 'assignTask',
        taskIcon: 'assign-task-icon',
        stateKey: 'Complete',
      },
      Comment: 'Assign a Task to HR team',
    },
  },
};
