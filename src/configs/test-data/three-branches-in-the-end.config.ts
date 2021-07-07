import { WorkflowStateData } from '../../interfaces/state-language.interface';

export const threeBranchesInTheEnd: WorkflowStateData = {
  'StartAt': 'StartEvent', 'States': {
    'StartEvent': {
      'Comment': 'Calendar',
      'Type': 'Task',
      'Parameters': { 'taskIcon': 'calendar-icon', 'taskType': 'calendar' },
      'Next': 'SendEmail10',
    },
    'SendEmail10': {
      'Comment': 'Send some Email',
      'Type': 'Task',
      'Parameters': { 'taskIcon': 'email-icon', 'taskType': 'sendEmail' },
      'Next': 'BranchByCondition',
    },
    'BranchByCondition': {
      'Comment': 'Branch By Condition',
      'Type': 'Parallel',
      'Parameters': { 'taskIcon': 'by-condition-icon', 'taskType': 'byCondition' },
      'Next': 'SendEmail11',
      'Branches': [{
        'StartAt': 'Reject',
        'States': {
          'Reject': {
            'Comment': 'Reject',
            'Type': 'Pass',
            'Parameters': { 'taskType': 'pass' },
            'End': true,
          },
        },
      }, {
        'StartAt': 'Approve', 'States': {
          'Approve': {
            'Comment': 'Approve',
            'Type': 'Pass',
            'Parameters': { 'taskType': 'pass' },
            'Next': 'TestingSubState2',
          }, 'TestingSubState2': {
            'Comment': 'Testing Sub State2',
            'Type': 'Parallel',
            'Parameters': { 'taskType': 'task' },
            'End': true,
            'Branches': [{
              'StartAt': 'TestingSubLevel',
              'States': {
                'TestingSubLevel': {
                  'Comment': 'Testing Sub Level',
                  'Type': 'Pass',
                  'Parameters': { 'taskType': 'pass' },
                  'Next': 'FirstTest',
                },
                'FirstTest': {
                  'Comment': 'First Test',
                  'Type': 'Task',
                  'Parameters': { 'taskType': 'pass' },
                  'End': true,
                },
              },
            }, {
              'StartAt': 'TestingSubLevel2', 'States': {
                'TestingSubLevel2': {
                  'Comment': 'Testing Sub Level 2',
                  'Type': 'Pass',
                  'Parameters': { 'taskType': 'pass' },
                  'Next': 'RejectTypes',
                }, 'RejectTypes': {
                  'Comment': 'Reject types',
                  'Type': 'Parallel',
                  'Parameters': { 'taskIcon': 'email-icon', 'taskType': 'sendEmail' },
                  'End': true,
                  'Branches': [{
                    'StartAt': 'RejectOne',
                    'States': {
                      'RejectOne': {
                        'Comment': 'Reject One',
                        'Type': 'Pass',
                        'Parameters': { 'taskType': 'pass' },
                        'Next': 'TestingSubState1',
                      },
                      'TestingSubState1': {
                        'Comment': 'Testing Sub State1',
                        'Type': 'Task',
                        'Parameters': { 'taskType': 'task' },
                        'End': true,
                      },
                    },
                  }, {
                    'StartAt': 'RejectTwo',
                    'States': {
                      'RejectTwo': {
                        'Comment': 'Reject Two',
                        'Type': 'Pass',
                        'Parameters': { 'taskType': 'pass' },
                        'Next': 'TestingSubStateEnd',
                      },
                      'TestingSubStateEnd': {
                        'Comment': 'Testing Sub State End',
                        'Type': 'Task',
                        'Parameters': { 'taskType': 'task' },
                        'End': true,
                      },
                    },
                  }, {
                    'StartAt': 'RejectThree',
                    'States': {
                      'RejectThree': {
                        'Comment': 'Reject three',
                        'Type': 'Pass',
                        'Parameters': { 'taskType': 'pass' },
                        'Next': 'TestingSubState',
                      },
                      'TestingSubState': {
                        'Comment': 'Testing Sub State',
                        'Type': 'Task',
                        'Parameters': { 'taskType': 'task' },
                        'Next': 'ApproveTypes',
                      },
                      'ApproveTypes': {
                        'Comment': 'Approve types',
                        'Type': 'Parallel',
                        'Parameters': { 'taskIcon': 'email-icon', 'taskType': 'sendEmail' },
                        'End': true,
                        'Branches': [{
                          'StartAt': 'ApproveTypeOne',
                          'States': {
                            'ApproveTypeOne': {
                              'Comment': 'Approve Type One',
                              'Type': 'Pass',
                              'Parameters': { 'taskType': 'pass' },
                              'Next': 'ApproveSubType',
                            },
                            'ApproveSubType': {
                              'Comment': 'Approve Sub Type',
                              'Type': 'Task',
                              'Parameters': { 'taskType': 'pass' },
                              'End': true,
                            },
                          },
                        }, {
                          'StartAt': 'ApproveTypeTwo',
                          'States': {
                            'ApproveTypeTwo': {
                              'Comment': 'Approve Type Two',
                              'Type': 'Pass',
                              'Parameters': { 'taskType': 'pass' },
                              'End': true,
                            },
                          },
                        }],
                      },
                    },
                  }],
                },
              },
            }],
          },
        },
      }, {
        'StartAt': 'Test',
        'States': { 'Test': { 'Comment': 'Test', 'Type': 'Pass', 'Parameters': { 'taskType': 'pass' }, 'End': true } },
      }],
    },
    'SendEmail11': {
      'Comment': 'Send direct Message',
      'Type': 'Task',
      'Parameters': { 'taskIcon': 'slack-icon', 'taskType': 'sendDirectMessage' },
      'Next': 'Complete',
    },
    'Complete': {
      'Comment': 'Assign a Task to HR team',
      'Type': 'Task',
      'Parameters': { 'taskIcon': 'assign-task-icon', 'taskType': 'assignTask' },
      'End': true,
    },
  },
};
