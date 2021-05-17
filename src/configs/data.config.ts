import { WorkflowStateData } from '../interfaces/state-language.interface';

export const workflowTestData: WorkflowStateData = {
  StartAt: 'StartEvent',
  States: {
    StartEvent: {
      Type: 'Task',
      Next: 'SendEmail10',
      Parameters: {
        taskType: 'calendar',
        taskIcon: 'calendar-icon',
      },
      Comment: 'Calendar',
    },
    SendEmail10: {
      Type: 'Task',
      Next: 'BranchByCondition',
      Parameters: {
        taskType: 'sendEmail',
        taskIcon: 'email-icon',
      },
      Comment: 'Send some Email',
    },
    BranchByCondition: {
      Type: 'Parallel',
      Comment: 'Branch By Condition',
      Next: 'SendEmail11',
      Parameters: {
        taskType: 'byCondition',
        taskIcon: 'by-condition-icon',
      },
      Branches: [
        {
          StartAt: 'Reject',
          States: {
            Reject: {
              Type: 'Pass',
              Next: 'RejectTypes',
              Comment: 'Reject',
              Parameters: {
                taskType: 'pass',
              },
            },
            RejectTypes: {
              Type: 'Parallel',
              End: true,
              Parameters: {
                taskType: 'sendEmail',
                taskIcon: 'email-icon',
              },
              Comment: 'Reject types',
              Branches: [
                {
                  StartAt: 'RejectOne',
                  States: {
                    RejectOne: {
                      Type: 'Pass',
                      End: true,
                      Comment: 'Reject One',
                      Parameters: {
                        taskType: 'pass',
                      },
                    },
                  },
                },
                {
                  StartAt: 'RejectTwo',
                  States: {
                    RejectTwo: {
                      Type: 'Pass',
                      End: true,
                      Comment: 'Reject Two',
                      Parameters: {
                        taskType: 'pass',
                      },
                    },
                  },
                },
                // TODO check all variants
                // {
                //   StartAt: 'RejectTen',
                //   States: {
                //     RejectTen: {
                //       Type: 'Pass',
                //       End: true,
                //       Comment: 'Reject Ren',
                //       Parameters: {
                //         taskType: 'pass'
                //       },
                //     }
                //   }
                // }
              ],
            },
          },
        },
        {
          StartAt: 'Approve',
          States: {
            Approve: {
              Type: 'Pass',
              End: true,
              Comment: 'Approve',
              Parameters: {
                taskType: 'pass',
              },
            },
          },
        },
        {
          StartAt: 'Test',
          States: {
            Test: {
              Type: 'Pass',
              End: true,
              Comment: 'Test',
              Parameters: {
                taskType: 'pass',
              },
            },
          },
        },
      ],
    },
    SendEmail11: {
      Type: 'Task',
      Next: 'Complete',
      Parameters: {
        taskType: 'sendDirectMessage',
        taskIcon: 'slack-icon',
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
  },
};
