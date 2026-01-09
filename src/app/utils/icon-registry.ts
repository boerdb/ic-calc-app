import { addIcons } from 'ionicons';
import {
  // Common icons used across the app
  informationCircleOutline,
  closeOutline,
  chevronForwardOutline,
  chevronDownOutline,
  chevronBack,
  // Patient/medical icons
  maleOutline,
  femaleOutline,
  bedOutline,
  pulseOutline,
  medkitOutline,
  // Action icons
  trashOutline,
  alertCircleOutline,
  warning,
  stopCircle,
  stopCircleOutline,
  checkmarkCircle,
  // Calculation/analysis icons
  calculatorOutline,
  cloudOutline,
  analyticsOutline,
  bulbOutline,
  // Navigation icons
  arrowForward,
  reorderTwoOutline,
  // Platform icons
  logoAndroid,
  logoApple
} from 'ionicons/icons';

/**
 * Centralized icon registration utility.
 * Register all icons used in the app in one place to avoid duplication.
 */
export function registerAppIcons(): void {
  addIcons({
    // Common
    informationCircleOutline,
    closeOutline,
    chevronForwardOutline,
    chevronDownOutline,
    chevronBack,
    // Patient/medical
    maleOutline,
    femaleOutline,
    bedOutline,
    pulseOutline,
    medkitOutline,
    // Actions
    trashOutline,
    alertCircleOutline,
    warning,
    stopCircle,
    stopCircleOutline,
    checkmarkCircle,
    // Calculations
    calculatorOutline,
    cloudOutline,
    analyticsOutline,
    bulbOutline,
    // Navigation
    arrowForward,
    reorderTwoOutline,
    // Platform
    logoAndroid,
    logoApple
  });
}
