import { useColorScheme } from 'react-native'

const light = {
  bg:              '#ffffff',
  card:            '#f5f5f5',
  cardInner:       '#ffffff',
  text:            '#111111',
  subtext:         '#999999',
  muted:           '#bbbbbb',
  border:          '#f0f0f0',
  divider:         '#e8e8e8',
  accent:          '#e53935',
  primary:         '#111111',
  primaryText:     '#ffffff',
  secondary:       '#f5f5f5',
  secondaryText:   '#111111',
  infoBox:         '#f8f8f8',
  drumBar:         '#e0e0e0',
  placeholder:     '#e8e8e8',
  historyChip:     '#f0f0f0',
  historyChipText: '#555555',
  cellToday:       '#f0f0f0',
  incompleteChip:  { bg: '#fce8e8', text: '#e53935' },
  warmupChip:      { bg: '#e8f5e9', text: '#2e7d32' },
  pickRow:         '#ffffff',
  dot:             '#111111',
  dotSelected:     '#ffffff',
}

const dark = {
  bg:              '#000000',
  card:            '#1c1c1e',
  cardInner:       '#2c2c2e',
  text:            '#ffffff',
  subtext:         '#8e8e93',
  muted:           '#3a3a3c',
  border:          '#38383a',
  divider:         '#38383a',
  accent:          '#e53935',
  primary:         '#ffffff',
  primaryText:     '#000000',
  secondary:       '#2c2c2e',
  secondaryText:   '#ffffff',
  infoBox:         '#1c1c1e',
  drumBar:         '#3a3a3c',
  placeholder:     '#2c2c2e',
  historyChip:     '#2c2c2e',
  historyChipText: '#aeaeb2',
  cellToday:       '#2c2c2e',
  incompleteChip:  { bg: '#3d1010', text: '#e53935' },
  warmupChip:      { bg: '#1b3a1e', text: '#66bb6a' },
  pickRow:         '#2c2c2e',
  dot:             '#ffffff',
  dotSelected:     '#000000',
}

export function useTheme() {
  return useColorScheme() === 'dark' ? dark : light
}
