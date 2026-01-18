import { addIcons } from 'ionicons';
import {
  // ... je bestaande imports ...
  downloadOutline, close, peopleOutline, homeOutline, flaskOutline,
  heartOutline, waterOutline, fitnessOutline, clipboardOutline, clipboardSharp,
  maleOutline, femaleOutline, trashOutline, bedOutline, chevronDownOutline,
  informationCircleOutline, closeOutline, logoAndroid, logoApple,
  chevronForwardOutline, cloudOutline, calculatorOutline,
  alertCircleOutline, pulseOutline, warning, bulbOutline,
  reorderTwoOutline, analyticsOutline, chevronForward, stopCircleOutline, medkitOutline,
  flash, flask, cloud, heart, medkit, settings,
  checkmarkCircle, alertCircle, stopCircle, chevronBack, arrowForward,

  // NIEUW: Voor Reanimatie & Navigatie
  timer,
  stopwatch,
  play,
  pause,
  refresh,
  refreshCircle,
  volumeHigh,
  volumeMute,
  layersOutline,
  documentTextOutline,
  documentText


} from 'ionicons/icons';

export function registerAppIcons(): void {
  addIcons({
    // svg icons (Custom)
    'ventilation': 'assets/icons/ventilation.svg',
    'circulation': 'assets/icons/circulation.svg',
    'renal': 'assets/icons/renal.svg',
    'defibrillator': 'assets/icons/defibrillator.svg',

    // NIEUW: Reanimatie tool
    'timer': timer,
    'stopwatch': stopwatch,
    'play': play,
    'pause': pause,
    'refresh': refresh,
    'refresh-circle': refreshCircle,
    'volume-high': volumeHigh,
    'volume-mute': volumeMute,

    // NIEUW: Menu
    'layers-outline': layersOutline,
    'document-text-outline': documentTextOutline,
    'document-text': documentText,
    // ... De rest van je bestaande iconen ...
    'clipboard': clipboardOutline,
    'clipboard-outline': clipboardOutline,
    'clipboard-sharp': clipboardSharp,
    'download-outline': downloadOutline,
    'close': close,
    'people-outline': peopleOutline,
    'home-outline': homeOutline,
    'flask-outline': flaskOutline,
    'heart-outline': heartOutline,
    'water-outline': waterOutline,
    'fitness-outline': fitnessOutline,
    'male-outline': maleOutline,
    'female-outline': femaleOutline,
    'trash-outline': trashOutline,
    'bed-outline': bedOutline,
    'chevron-down-outline': chevronDownOutline,
    'information-circle-outline': informationCircleOutline,
    'close-outline': closeOutline,
    'logo-android': logoAndroid,
    'logo-apple': logoApple,
    'chevron-forward-outline': chevronForwardOutline,
    'cloud-outline': cloudOutline,
    'calculator-outline': calculatorOutline,
    'alert-circle-outline': alertCircleOutline,
    'pulse-outline': pulseOutline,
    'warning': warning,
    'bulb-outline': bulbOutline,
    'reorder-two-outline': reorderTwoOutline,
    'analytics-outline': analyticsOutline,
    'chevron-forward': chevronForward,
    'stop-circle-outline': stopCircleOutline,
    'medkit-outline': medkitOutline,
    'flash': flash,
    'flask': flask,
    'cloud': cloud,
    'heart': heart,
    'medkit': medkit,
    'settings': settings,
    'checkmark-circle': checkmarkCircle,
    'alert-circle': alertCircle,
    'stop-circle': stopCircle,
    'chevron-back': chevronBack,
    'arrow-forward': arrowForward

  });
}
