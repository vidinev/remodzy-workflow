export const data: any = {
  StartAt: 'StartEvent',
  States: {
    StartEvent: {
      Type: 'Pass',
      Next: 'SendEmail10',
      Parameters: {
        taskType: 'start',
        taskIcon: 'start-icon',
        current: 'StartEvent'
      },
      Comment: 'Start Event',
    },
    SendEmail10: {
      Type: 'Task',
      Next: 'AssignATask2',
      Parameters: {
        taskType: 'sendEmail',
        taskIcon: 'email-icon',
        current: 'SendEmail10'
      },
      Comment: 'Send some Email',
    },
    AssignATask2: {
      Type: 'Task',
      Next: 'Complete',
      Parameters: {
        taskType: 'assignTask',
        taskIcon: 'assign-task-icon',
        current: 'AssignATask2'
      }
    },
    Complete: {
      Type: 'Pass',
      End: true
    }
  }
};
