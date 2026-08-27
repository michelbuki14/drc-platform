export const AGE_CATEGORIES = [
  { value: 'adult',   label: 'Adult',   desc: '12 years and older' },
  { value: 'child',   label: 'Child',   desc: '2 – 11 years' },
  { value: 'infant',  label: 'Infant',  desc: 'Under 2 years (lap infant)' },
  { value: 'senior',  label: 'Senior',  desc: '65 years and older' },
] as const;

export const ACCESSIBILITY_OPTIONS = [
  { value: 'none',                  label: 'No special assistance' },
  { value: 'wheelchair',            label: 'Wheelchair assistance' },
  { value: 'visual_assistance',     label: 'Visual assistance' },
  { value: 'hearing_assistance',    label: 'Hearing assistance' },
  { value: 'unaccompanied_minor',   label: 'Unaccompanied minor' },
  { value: 'medical_equipment',     label: 'Medical equipment / oxygen' },
  { value: 'reduced_mobility',      label: 'Reduced mobility (no wheelchair)' },
  { value: 'psychological_support', label: 'Psychological / anxiety support' },
] as const;

export type AgeCategoryValue = typeof AGE_CATEGORIES[number]['value'];
export type AccessibilityValue = typeof ACCESSIBILITY_OPTIONS[number]['value'];

export const INFANT_AGE_MAX = 2;   // years
export const CHILD_AGE_MAX = 11;   // years
export const SENIOR_AGE_MIN = 65;  // years
