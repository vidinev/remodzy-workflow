import { WorkflowStateData } from '../interfaces/state-language.interface';

export const data: WorkflowStateData = {
  StartAt: 'StartEvent',
  States: {
    StartEvent: {
      Type: 'Pass',
      Next: 'SendEmail10',
      Parameters: {
        taskType: 'start',
        taskIcon: 'start-icon',
        stateKey: 'StartEvent',
      },
      Comment: 'Start Event',
    },
    SendEmail10: {
      Type: 'Task',
      Next: 'AssignATask2',
      Parameters: {
        taskType: 'sendEmail',
        taskIcon: 'email-icon',
        stateKey: 'SendEmail10',
      },
      Comment: 'Send some Email',
    },
    AssignATask2: {
      Type: 'Task',
      Next: 'Complete',
      Parameters: {
        taskType: 'assignTask',
        taskIcon: 'assign-task-icon',
        stateKey: 'AssignATask2',
      },
      Comment: 'Assign this task',
    },
    Complete: {
      Type: 'Pass',
      End: true,
    },
  },
};
