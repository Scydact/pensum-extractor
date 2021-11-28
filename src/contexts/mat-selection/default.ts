export const matSelectionModeTypes: MatSelection.TrackerModeTypes = [
  'passed',
  'course',
];

/** Creates a default MatSelection object, with all predefined values. */
export default (): MatSelection.Payload => ({
  mode: 'passed',
  tracker: {
    course: new Set(),
    passed: new Set(),
  },
  currentName: null,
  storage: {},
  filter: new Set(),
});