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
                      Next: 'TestingSubState1',
                      Comment: 'Reject One',
                      Parameters: {
                        taskType: 'pass',
                      },
                    },
                    TestingSubState1: {
                      Type: 'Task',
                      End: true,
                      Comment: 'Testing Sub State1',
                      Parameters: {
                        taskType: 'task',
                      },
                    },
                  },
                },
                {
                  StartAt: 'RejectTwo',
                  States: {
                    RejectTwo: {
                      Type: 'Pass',
                      Next: 'TestingSubState2',
                      Comment: 'Reject Two',
                      Parameters: {
                        taskType: 'pass',
                      },
                    },
                    TestingSubState2: {
                      Type: 'Parallel',
                      Next: 'TestingSubStateEnd',
                      Comment: 'Testing Sub State2',
                      Parameters: {
                        taskType: 'task',
                      },
                      Branches: [
                        {
                          StartAt: 'TestingSubLevel',
                          States: {
                            TestingSubLevel: {
                              Type: 'Pass',
                              Next: 'FirstTest',
                              Comment: 'Testing Sub Level',
                              Parameters: {
                                taskType: 'pass',
                              },
                            },
                            FirstTest: {
                              Type: 'Task',
                              End: true,
                              Comment: 'First Test',
                              Parameters: {
                                taskType: 'pass',
                              },
                            },
                          },
                        },
                        {
                          StartAt: 'TestingSubLevel2',
                          States: {
                            TestingSubLevel2: {
                              Type: 'Pass',
                              End: true,
                              Comment: 'Testing Sub Level 2',
                              Parameters: {
                                taskType: 'pass',
                              },
                            },
                          },
                        },
                      ],
                    },
                    TestingSubStateEnd: {
                      Type: 'Task',
                      End: true,
                      Comment: 'Testing Sub State End',
                      Parameters: {
                        taskType: 'task',
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
                // {
                //   StartAt: 'RejectFour',
                //   States: {
                //     RejectFour: {
                //       Type: 'Pass',
                //       End: true,
                //       Comment: 'Reject four',
                //       Parameters: {
                //         taskType: 'pass',
                //       },
                //     },
                //   },
                // },
                // {
                //   StartAt: 'RejectFive',
                //   States: {
                //     RejectFive: {
                //       Type: 'Pass',
                //       End: true,
                //       Comment: 'Reject five',
                //       Parameters: {
                //         taskType: 'pass'
                //       },
                //     }
                //   }
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
                // {
                //   StartAt: 'ApproveTypeThree',
                //   States: {
                //     ApproveTypeThree: {
                //       Type: 'Pass',
                //       End: true,
                //       Comment: 'Approve Type Three',
                //       Parameters: {
                //         taskType: 'pass',
                //       },
                //     },
                //   },
                // }
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
