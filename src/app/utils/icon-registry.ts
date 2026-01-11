/**
 * Centralized Icon Registry
 * All Ionicons used throughout the application should be registered here.
 * This ensures icons are registered once and available globally.
 */
import { addIcons } from 'ionicons';
import {
  // App Component
  downloadOutline,
  close,
  peopleOutline,
  homeOutline,

  // Tab 1
  maleOutline,
  femaleOutline,
  trashOutline,
  bedOutline,
  chevronDownOutline,
  informationCircleOutline,
  closeOutline,
  logoAndroid,
  logoApple,

  // Tab 2
  chevronForwardOutline,
  cloudOutline,
  calculatorOutline,

  // Tab 3 (already covered above: informationCircleOutline, chevronForwardOutline)

  // Tab 4
  alertCircleOutline,
  pulseOutline,

  // Tab 5
  warning,
  bulbOutline,

  // Tab 6
  reorderTwoOutline,
  analyticsOutline,
  chevronForward,
  stopCircleOutline,
  medkitOutline,

  // Tabs
  flash,
  flask,
  cloud,
  heart,
  medkit,
  settings,

  // PV Wizard Component
  checkmarkCircle,
  alertCircle,
  stopCircle,
  chevronBack,
  arrowForward


} from 'ionicons/icons';


/**
 * Initialize all icons for the application.
 * Call this function once during app initialization.
 */
export function registerAppIcons(): void {
  addIcons({
    // App Component
    downloadOutline,
    close,
    peopleOutline,
    homeOutline,

    // Tab 1
    maleOutline,
    femaleOutline,
    trashOutline,
    bedOutline,
    chevronDownOutline,
    informationCircleOutline,
    closeOutline,
    logoAndroid,
    logoApple,


    // Tab 2
    chevronForwardOutline,
    cloudOutline,
    calculatorOutline,

    // Tab 4
    alertCircleOutline,
    pulseOutline,

    // Tab 5
    warning,
    bulbOutline,

    // Tab 6
    reorderTwoOutline,
    analyticsOutline,
    chevronForward,
    stopCircleOutline,
    medkitOutline,

    // Tabs
    flash,
    flask,
    cloud,
    heart,
    medkit,
    settings,

    // PV Wizard Component
    checkmarkCircle,
    alertCircle,
    stopCircle,
    chevronBack,
    arrowForward
  });
}
