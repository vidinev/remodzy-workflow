## Setup

* `git clone https://github.com/remodzy/roxFlow-dnd.git`
* `npm install`

## Run

* `npm run watch`
* Then run `npm start` (in separate terminal)

## Use
* Open asl-workflow-builder.ts

```
const builder = new RemodzyWorkflowBuilder({
  elementId: 'main-canvas',
  data: data.dataLargeInheritance, // Select test data
  direction: RemodzyWfDirection.horizontal, // Select orientation
});
```

