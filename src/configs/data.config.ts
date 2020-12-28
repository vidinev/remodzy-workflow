import { WorkflowStateData } from '../interfaces/state-language.interface';

export const data: WorkflowStateData = {
  StartAt: 'StartEvent',
  States: {
    StartEvent: {
      Type: 'Task',
      Next: 'SendEmail10',
      Parameters: {
        taskType: 'calendar',
        taskIcon: 'calendar-icon'
      },
      Comment: 'Calendar',
    },
    SendEmail10: {
      Type: 'Task',
      Next: 'BranchByCondition',
      Parameters: {
        taskType: 'sendEmail',
        taskIcon: 'email-icon'
      },
      Comment: 'Send some Email',
    },
    BranchByCondition: {
      Type: 'Parallel',
      Comment: 'Branch By Condition',
      Next: 'SendEmail11',
      Parameters: {
        taskType: 'byCondition',
        taskIcon: 'by-condition-icon'
      },
      Branches: [
        {
          StartAt: 'Reject',
          States: {
            Reject: {
              Type: 'Pass',
              Next: 'RejectChildState',
              Comment: 'Reject',
              Parameters: {
                taskType: 'pass'
              },
            },
            RejectChildState: {
              Type: 'Task',
              End: true,
              Parameters: {
                taskType: 'sendEmail',
                taskIcon: 'email-icon'
              },
              Comment: 'Reject child state',
            },
          }
        },
        {
          StartAt: 'Approve',
          States: {
            Approve: {
              Type: 'Pass',
              End: true,
              Comment: 'Approve',
              Parameters: {
                taskType: 'pass'
              },
            }
          }
        },
        {
          StartAt: 'Test',
          States: {
            Test: {
              Type: 'Pass',
              End: true,
              Comment: 'Test',
              Parameters: {
                taskType: 'pass'
              },
            }
          }
        }
      ]
    },
    SendEmail11: {
      Type: 'Task',
      Next: 'Complete',
      Parameters: {
        taskType: 'sendDirectMessage',
        taskIcon: 'slack-icon'
      },
      Comment: 'Send direct Message',
    },
    Complete: {
      Type: 'Task',
      End: true,
      Parameters: {
        taskType: 'assignTask',
        taskIcon: 'assign-task-icon',
      },
      Comment: 'Assign a Task to HR team',
    },
  }
};
