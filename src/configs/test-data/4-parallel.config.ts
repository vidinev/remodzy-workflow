import { WorkflowStateData } from '../../interfaces/state-language.interface';

export const data4Parallel: WorkflowStateData = {
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
                {
                  StartAt: 'RejectThree',
                  States: {
                    RejectThree: {
                      Type: 'Pass',
                      Next: 'TestingSubState',
                      Comment: 'Reject three',
                      Parameters: {
                        taskType: 'pass',
                      },
                    },
                    TestingSubState: {
                      Type: 'Task',
                      End: true,
                      Comment: 'Testing Sub State',
                      Parameters: {
                        taskType: 'task',
                      },
                    },
                  },
                },
                {
                  StartAt: 'RejectFour',
                  States: {
                    RejectFour: {
                      Type: 'Pass',
                      End: true,
                      Comment: 'Reject Four',
                      Parameters: {
                        taskType: 'pass',
                      },
                    },
                  },
                },
                // {
                //   StartAt: 'RejectFive',
                //   States: {
                //     RejectFive: {
                //       Type: 'Pass',
                //       End: true,
                //       Comment: 'Reject Five',
                //       Parameters: {
                //         taskType: 'pass',
                //       },
                //     },
                //   },
                // },
              ],
            },
          },
        },
        {
          StartAt: 'Approve',
          States: {
            Approve: {
              Type: 'Pass',
              Next: 'ApproveTypes',
              Comment: 'Approve',
              Parameters: {
                taskType: 'pass',
              },
            },
            ApproveTypes: {
              Type: 'Parallel',
              End: true,
              Parameters: {
                taskType: 'sendEmail',
                taskIcon: 'email-icon',
              },
              Comment: 'Approve types',
              Branches: [
                {
                  StartAt: 'ApproveTypeOne',
                  States: {
                    ApproveTypeOne: {
                      Type: 'Pass',
                      Next: 'ApproveSubType',
                      Comment: 'Approve Type One',
                      Parameters: {
                        taskType: 'pass',
                      },
                    },
                    ApproveSubType: {
                      Type: 'Task',
                      End: true,
                      Comment: 'Approve Sub Type',
                      Parameters: {
                        taskType: 'pass',
                      },
                    },
                  },
                },
                {
                  StartAt: 'ApproveTypeTwo',
                  States: {
                    ApproveTypeTwo: {
                      Type: 'Pass',
                      End: true,
                      Comment: 'Approve Type Two',
                      Parameters: {
                        taskType: 'pass',
                      },
                    },
                  },
                },
              ],
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
