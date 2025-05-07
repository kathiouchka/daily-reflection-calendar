type Translations = {
  [key: string]: {
    [key: string]: string | string[];
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
    "responseSavedSuccess": "Response saved successfully!",
    "signInToSaveYourResponse": "Sign in to save your response and build your memory calendar.",
    "processing": "Processing...",
    "saveAndSignIn": "Save & Sign In",
    "submitAnswer": "Submit Answer",
    "signInToSavePrompt": "Sign in to save your answer.",
    "confirmOverwriteTitle": "Confirm Change",
    "confirmOverwriteResponse": "You are about to modify your saved response. The previous version will be overwritten. Continue?",
    "modalConfirmButton": "Confirm",
    "modalCancelButton": "Cancel",
    
    // Calendar
    "calendar": "Calendar",
    "today": "Today",
    "dailyPhrase": "Daily Phrase",
    "yourResponseCal": "Your Response",
    "noResponse": "No response for this date.",
    "addResponse": "Add a response",
    "loadingCalendar": "Loading calendar data...",
    "calendarPageTitle": "Question of the Day",
    "calendarPreviousDay": "Previous day",
    "calendarNextDay": "Next day",
    "calendarViewButton": "Calendar",
    "calendarLoadingQuestion": "Loading question...",
    "calendarNoQuestion": "No question found for this day.",
    "calendarQuestionOfTheDay": "QUESTION OF THE DAY",
    "calendarLoadingAnswers": "Loading answers...",
    "calendarLoadingResponse": "Loading response...",
    "calendarFutureDate": "This date is in the future.",
    "calendarNoResponseForYear": "No response recorded for this day in {year}.",
    "calendarAddTodaysMemory": "Add today's memory",
    "calendarAddMemoryForThisDay": "Add a memory for this day",
    "calendarModalPreviousMonth": "Previous month in modal",
    "calendarModalNextMonth": "Next month in modal",
    "calendarModalLoadingCalendar": "Loading calendar...",
    "calendarDayHasResponseSuffix": ", has response",
    "calendarModalCloseButton": "Close",
    "calendarPastNoResponseFunny": [
      "The dog ate my homework... I mean, my memory!",
      "Lost in the sands of time, or maybe just misplaced.",
      "This day's memory is playing hide and seek. It's winning.",
      "An enigma wrapped in a mystery, this day remains silent.",
      "Perhaps this was the day the aliens visited? No record left."
    ],
    "calendarFutureDateRandom": [
      "The future is unwritten... but it might involve cats.",
      "Shhh... Spoilers for this day are not allowed!",
      "Loading future memories... please wait (indefinitely).",
      "Ask again later, my crystal ball is fuzzy for this date.",
      "This day is currently under construction. Check back in {years} years!"
    ],
    
    // Auth
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "user": "User",
    
    // Days of week
    "sun": "Dim",
    "mon": "Lun",
    "tue": "Mar",
    "wed": "Mer",
    "thu": "Jeu",
    "fri": "Ven",
    "sat": "Sam",

    // Months
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
  },
  fr: {
    // Page d'accueil
    "todaysPhrase": "Ma petite question du jour",
    "todaysQuestion": "Ma petite question du jour",
    "mainPageTitle": "Ma Petite Question",
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
    "responseSavedSuccess": "Réponse enregistrée avec succès !",
    "signInToSaveYourResponse": "Connectez-vous pour sauvegarder votre réponse et construire votre calendrier de souvenirs.",
    "processing": "Traitement en cours...",
    "saveAndSignIn": "Sauvegarder & Se connecter",
    "submitAnswer": "Soumettre la réponse",
    "signInToSavePrompt": "Connectez-vous pour sauvegarder votre réponse.",
    "confirmOverwriteTitle": "Confirmer la modification",
    "confirmOverwriteResponse": "Vous êtes sur le point de modifier votre réponse enregistrée. La version précédente sera écrasée. Continuer ?",
    "modalConfirmButton": "Confirmer",
    "modalCancelButton": "Annuler",
    
    // Calendrier
    "calendar": "Calendrier",
    "today": "Aujourd'hui",
    "dailyPhrase": "Ma petite question du jour",
    "yourResponseCal": "Votre réponse",
    "noResponse": "Pas de réponse pour cette date.",
    "addResponse": "Ajouter une réponse",
    "loadingCalendar": "Chargement des données du calendrier...",
    "calendarPageTitle": "Question du Jour",
    "calendarPreviousDay": "Jour précédent",
    "calendarNextDay": "Jour suivant",
    "calendarViewButton": "Calendrier",
    "calendarLoadingQuestion": "Chargement de la question...",
    "calendarNoQuestion": "Aucune question trouvée pour ce jour.",
    "calendarQuestionOfTheDay": "QUESTION DU JOUR",
    "calendarLoadingAnswers": "Chargement des réponses...",
    "calendarLoadingResponse": "Chargement de la réponse...",
    "calendarFutureDate": "Cette date est dans le futur.",
    "calendarNoResponseForYear": "Aucune réponse enregistrée pour ce jour en {year}.",
    "calendarAddTodaysMemory": "Ajouter le souvenir d'aujourd'hui",
    "calendarAddMemoryForThisDay": "Ajouter un souvenir pour ce jour",
    "calendarModalPreviousMonth": "Mois précédent (calendrier)",
    "calendarModalNextMonth": "Mois suivant (calendrier)",
    "calendarModalLoadingCalendar": "Chargement du calendrier...",
    "calendarDayHasResponseSuffix": ", a une réponse",
    "calendarModalCloseButton": "Fermer",
    "calendarPastNoResponseFunny": [
      "Le chien a mangé mes devoirs... enfin, ma mémoire !",
      "Perdu dans les sables du temps, ou peut-être juste égaré.",
      "Le souvenir de ce jour joue à cache-cache. Et il gagne.",
      "Une énigme enveloppée de mystère, ce jour reste silencieux.",
      "Peut-être le jour où les extraterrestres sont venus ? Aucune trace."
    ],
    "calendarFutureDateRandom": [
      "Le futur n'est pas écrit... mais il pourrait impliquer des chats.",
      "Chut... Les spoilers pour ce jour ne sont pas autorisés !",
      "Chargement des souvenirs futurs... veuillez patienter (indéfiniment).",
      "Demandez à nouveau plus tard, ma boule de cristal est floue pour cette date.",
      "Ce jour est actuellement en construction. Revenez dans {years} ans !"
    ],
    
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

export function getTranslation(key: string, locale: string = defaultLocale): string | string[] {
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