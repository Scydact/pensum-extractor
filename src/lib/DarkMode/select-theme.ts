/**
 * Dark mode support styles for react-select components.
 */

import { StylesConfig, ThemeConfig } from "react-select";
import './theme.scss';

/** Include this to allow dark mode toggling. */
const selectTheme: ThemeConfig = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: 'var(--bs-primary)',   // Focus border
    primary75: 'rgba(var(--bs-primary-rgb), 0.75)',
    primary50: 'rgba(var(--bs-primary-rgb), 0.50)',
    primary25: 'rgba(var(--bs-primary-rgb), 0.25)', // Selected Option color
    danger: 'var(--bs-danger)',
    dangerLight: 'rgba(var(--bs-danger-rgb), 0.25)',
    neutral0: 'var(--bs-body-bg)',  // Background
    neutral5: 'var(--th-gray-50)',
    neutral10: 'var(--th-gray-100)',
    neutral20: 'var(--th-gray-200)',  // Border
    neutral30: 'var(--th-gray-300)',  // Border hover/focus
    neutral40: 'var(--th-gray-400)',
    neutral50: 'var(--th-gray-500)',  // Nothing selected
    neutral60: 'var(--th-gray-600)',  // dropdown arrow (focus)
    neutral70: 'var(--th-gray-700)',
    neutral80: 'var(--th-gray-800)',  // Something selected
    neutral90: 'var(--th-gray-900)',
  }
})

/** Style override to make selected value visible on dark mode. */
export const optionStyle: StylesConfig = {
  option: (provided, state) => ({
    ...provided, 
    color: (state.isSelected) ? 'white' : undefined,
  }),

  placeholder: (provided, state) => ({
    ...provided,
    opacity: 0.6,
  })
  
}

export default selectTheme;