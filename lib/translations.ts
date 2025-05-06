type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  en: {
    // Homepage
    "todaysPhrase": "Today's Phrase",
    "todaysQuestion": "Today's Question",
    "mainPageTitle": "My Little Question",
    "yourResponse": "Your Response",
    "writeYourThoughts": "Write your thoughts about today's question...",
    "writePlaceholder": "Write your thoughts about today's phrase...",
    "submit": "Submit",
    "submitResponse": "Submit Response",
    "submitting": "Submitting...",
    "viewCalendar": "View Calendar",
    "pleaseSignIn": "Please sign in to record your response and view your calendar.",
    "responseSubmitted": "Response submitted successfully!",
    "shiftEnterToSubmit": "Press Shift+Enter to submit",
    "loadingPhrase": "Loading today's question...",
    "characters": "characters",
    "loadingErrorPhrase": "Unable to load today's question. Please try again later.",
    "pleaseEnterResponse": "Please enter a response.",
    "responseTooLong": "Response exceeds maximum length.",
    "unsafeContentError": "Response contains potentially unsafe content.",
    "responseSubmittedSuccess": "Response submitted successfully!",
    "submitFailedError": "Failed to submit. Please try again.",
    "pleaseEnterResponseToSave": "Please enter a response to save.",
    "signInFailedError": "Failed to initiate sign-in. Please try again.",
    "unsavedChangesConfirm": "You have unsaved changes. Are you sure you want to leave?",
    "unsavedResponseConfirmUnauth": "You have an unsaved response. Sign in to save it, or leave?",
    "loading": "Loading...",
    "writeYourThoughtsHere": "Write your thoughts here...",
    "signInToSaveYourResponse": "Sign in to save your response and build your memory calendar.",
    "processing": "Processing...",
    "saveAndSignIn": "Save & Sign In",
    "submitAnswer": "Submit Answer",
    "signInToSavePrompt": "Sign in to save your answer.",
    
    // Calendar
    "calendar": "Calendar",
    "today": "Today",
    "dailyPhrase": "Daily Phrase",
    "yourResponseCal": "Your Response",
    "noResponse": "No response for this date.",
    "addResponse": "Add a response",
    "loadingCalendar": "Loading calendar data...",
    
    // Auth
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "user": "User",
    
    // Days of week
    "sun": "Sun",
    "mon": "Mon",
    "tue": "Tue",
    "wed": "Wed",
    "thu": "Thu",
    "fri": "Fri",
    "sat": "Sat",

    // Months
    "january": "January",
    "february": "February",
    "march": "March",
    "april": "April",
    "may": "May",
    "june": "June",
    "july": "July",
    "august": "August",
    "september": "September",
    "october": "October",
    "november": "November",
    "december": "December",
  },
  fr: {
    // Page d'accueil
    "todaysPhrase": "Ma petite question du jour",
    "todaysQuestion": "Ma petite question du jour",
    "mainPageTitle": "Ma petite question",
    "yourResponse": "Votre réponse",
    "writeYourThoughts": "Écrivez vos réflexions sur la question du jour...",
    "writePlaceholder": "Écrivez vos réflexions sur la question du jour...",
    "submit": "Soumettre",
    "submitResponse": "Soumettre la réponse",
    "submitting": "Soumission en cours...",
    "viewCalendar": "Voir le calendrier",
    "pleaseSignIn": "Veuillez vous connecter pour enregistrer votre réponse et consulter votre calendrier.",
    "responseSubmitted": "Réponse soumise avec succès !",
    "shiftEnterToSubmit": "Appuyez sur Maj+Entrée pour soumettre",
    "loadingPhrase": "Chargement de la question du jour...",
    "characters": "caractères",
    "loadingErrorPhrase": "Impossible de charger la question du jour. Veuillez réessayer plus tard.",
    "pleaseEnterResponse": "Veuillez entrer une réponse.",
    "responseTooLong": "La réponse dépasse la longueur maximale.",
    "unsafeContentError": "La réponse contient du contenu potentiellement dangereux.",
    "responseSubmittedSuccess": "Réponse soumise avec succès !",
    "submitFailedError": "Échec de la soumission. Veuillez réessayer.",
    "pleaseEnterResponseToSave": "Veuillez entrer une réponse à sauvegarder.",
    "signInFailedError": "Échec de l'initialisation de la connexion. Veuillez réessayer.",
    "unsavedChangesConfirm": "Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?",
    "unsavedResponseConfirmUnauth": "Vous avez une réponse non enregistrée. Connectez-vous pour la sauvegarder, ou quitter ?",
    "loading": "Chargement...",
    "writeYourThoughtsHere": "Écrivez vos pensées ici...",
    "signInToSaveYourResponse": "Connectez-vous pour sauvegarder votre réponse et construire votre calendrier de souvenirs.",
    "processing": "Traitement en cours...",
    "saveAndSignIn": "Sauvegarder & Se connecter",
    "submitAnswer": "Soumettre la réponse",
    "signInToSavePrompt": "Connectez-vous pour sauvegarder votre réponse.",
    
    // Calendrier
    "calendar": "Calendrier",
    "today": "Aujourd'hui",
    "dailyPhrase": "Ma petite question du jour",
    "yourResponseCal": "Votre réponse",
    "noResponse": "Pas de réponse pour cette date.",
    "addResponse": "Ajouter une réponse",
    "loadingCalendar": "Chargement des données du calendrier...",
    
    // Authentification
    "signIn": "Connexion",
    "signOut": "Déconnexion",
    "user": "Utilisateur",
    
    // Jours de la semaine
    "sun": "Dim",
    "mon": "Lun",
    "tue": "Mar",
    "wed": "Mer",
    "thu": "Jeu",
    "fri": "Ven",
    "sat": "Sam",

    // Mois
    "january": "Janvier",
    "february": "Février",
    "march": "Mars",
    "april": "Avril",
    "may": "Mai",
    "june": "Juin",
    "july": "Juillet",
    "august": "Août",
    "september": "Septembre",
    "october": "Octobre",
    "november": "Novembre",
    "december": "Décembre",
  }
};

export const defaultLocale = 'fr';

export function getTranslation(key: string, locale: string = defaultLocale): string {
  if (!translations[locale] || !translations[locale][key]) {
    // Fallback to default locale if translation not found
    if (locale !== defaultLocale && translations[defaultLocale] && translations[defaultLocale][key]) {
      return translations[defaultLocale][key];
    }
    // Return the key itself if no translation found
    return key;
  }
  return translations[locale][key];
} 