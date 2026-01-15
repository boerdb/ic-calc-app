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
  flaskOutline,
  heartOutline,
  waterOutline,
  fitnessOutline,
  clipboardOutline,
  clipboardSharp,

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
   // svg icons
   'ventilation': 'assets/icons/ventilation.svg',
    'circulation': 'assets/icons/circulation.svg',
    'renal': 'assets/icons/renal.svg',
    'clipboard': clipboardOutline,       // Of hoe je ze ook noemt in je systeem
    'clipboard-outline': clipboardOutline,
    'clipboard-sharp': clipboardSharp,

    // App Component
    downloadOutline,
    close,
    peopleOutline,
    homeOutline,
    flaskOutline,
    heartOutline,
    waterOutline,
    fitnessOutline,

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
