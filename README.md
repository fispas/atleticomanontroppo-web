# ⚽ Atletico ma non troppo

Web app per le presenze del calcetto del mercoledì: iscrizioni con lista d'attesa, squadre bilanciate, risultati, MVP, voti ai campi, statistiche, classifiche e badge.

Statica su **GitHub Pages**, dati su **Firebase** (Auth + Firestore), piano gratuito Spark, nessuna Cloud Function.

## Struttura

```
index.html          app completa (HTML, CSS e JS inline)
firebase-config.js  configurazione del progetto Firebase (da compilare)
manifest.json       PWA installabile
sw.js               service worker (funziona offline in lettura)
assets/             stemma e icone
firestore.rules     regole di sicurezza da pubblicare su Firestore
```

## Setup

### 1. Progetto Firebase

1. Vai su <https://console.firebase.google.com> e crea un progetto (Google Analytics non serve).
2. **Authentication > Metodo di accesso**: abilita **Google** e **Anonimo**.
3. **Firestore Database > Crea database**: modalità produzione, località `eur3` (Europa).
4. **Impostazioni progetto > Le tue app > Aggiungi app web**: copia l'oggetto `firebaseConfig` dentro `firebase-config.js`.
5. **Firestore > Regole**: incolla il contenuto di `firestore.rules` e premi **Pubblica**.

### 2. GitHub Pages

1. Crea un repository (es. `fispas/calcetto`) e carica tutti i file di questa cartella.
2. **Settings > Pages**: sorgente `Deploy from a branch`, branch `main`, cartella `/ (root)`.
3. L'app sarà su `https://<utente>.github.io/<repo>/`.
4. In Firebase, **Authentication > Impostazioni > Domini autorizzati**: aggiungi `<utente>.github.io`.

### 3. Primo admin

1. Apri l'app e accedi con Google. Comparirà il form "Benvenuto in squadra": **non** inviarlo ancora.
2. In Firebase, **Authentication > Utenti**: copia l'**UID** del tuo account.
3. **Firestore > Avvia raccolta** `admins` > ID documento = il tuo UID > campo `nome` (stringa) = il tuo nome.
4. Ricarica l'app: ora vedi "Crea il tuo profilo" come admin. Compilalo.

### 4. Primo avvio da admin

Dal tab **Profilo > Area admin**:

1. **Campi > + Nuovo campo**: nome, indirizzo, posizione, servizi. Spunta **Campo predefinito del mercoledì**.
2. **Configurazione > Modifica**: controlla giorno, ora, minimo giocatori, chiusura iscrizioni, nomi squadre. Salva (anche se va bene così: la configurazione viene scritta nel database).
3. **Giocatori**: approva le richieste che arrivano, crea profili gestiti per chi non usa Google, imposta i livelli (1–5, visibili solo agli admin).

La partita del prossimo mercoledì viene creata automaticamente alla prima apertura dell'app.

#### Posizione del campo

- Se incolli un link Google Maps completo, le coordinate vengono lette in automatico.
- I link brevi (`maps.app.goo.gl`) non si possono leggere dal browser: in Google Maps tieni premuto sul campo, copia i numeri che compaiono (es. `37.5079, 15.0830`) e incollali in **Coordinate**.
- Oppure, stando al campo, tocca **Usa la mia posizione attuale**.

Le coordinate servono per il pulsante "Portami lì" e per il meteo (solo campi scoperti).

## Come funziona

### Accesso

| Metodo | Per chi | Come |
|---|---|---|
| Google | tutti, metodo principale | "Accedi con Google", crea il profilo, un admin approva |
| Link personale | chi non vuole Google | l'admin genera il link dal giocatore e lo invia in privato |
| Profilo gestito | chi non usa l'app | l'admin lo crea e ne segna le presenze |

- Chi entra con il link può poi **collegare Google** dal Profilo, così non perde l'accesso cambiando telefono.
- Rigenerando un link, quello vecchio smette di funzionare; i dispositivi già collegati si scollegano da **Giocatori > Gestisci > Scollega**.
- Google blocca l'accesso nei browser interni di WhatsApp, Instagram e simili: l'app lo rileva e chiede di aprire il link in Chrome o Safari.

### Presenze

- Chiunque può segnare chiunque: ogni modifica fatta per conto di altri mostra "segnato da…" e finisce nel **registro modifiche** (Area admin), con ripristino rapido.
- I primi N iscritti (ospiti compresi) sono titolari, gli altri in lista d'attesa. Se un titolare si toglie, sale il primo in attesa.
- Dopo la chiusura iscrizioni solo gli admin possono modificare.

### Dopo la partita

1. Admin: **Gestisci > Registra risultato** (gol, autogol, pali, assenti). La partita passa in post-partita.
2. Giocatori: votano **MVP** (segreto, non modificabile) e **campo** per 48 ore (configurabile).
3. Allo scadere, alla prima apertura dell'app da parte di un admin, la partita viene archiviata, l'MVP calcolato e le statistiche ricalcolate. Si può anche archiviare a mano.

### Statistiche e badge

- Calcolate **solo** da dati confermati dall'admin (squadre, risultato, eventi); le presenze dichiarate contano solo per affidabilità e badge di iscrizione.
- Il ricalcolo gira sul dispositivo dell'admin ed è completo e idempotente: dopo una correzione usa **Area admin > Ricalcola tutto**.
- I badge si configurano nella costante `BADGES` dentro `index.html` (nome, emoji, soglie). I badge ironici si disattivano dalla configurazione.
- Le statistiche sono per **anno solare** e carriera; l'albo d'oro di un anno si chiude da solo il 1° gennaio.

## Aggiornamenti

Dopo aver modificato `index.html`, aumenta `VERSIONE` in `sw.js` (es. `atletico-v2`) così i telefoni scaricano la nuova versione.

## Sicurezza

- La `apiKey` di Firebase nel client è pubblica per design: la protezione sta in `firestore.rules`.
- Solo account approvati e attivi leggono i dati; i token dei link non sono mai leggibili dai giocatori; il registro modifiche non si può cancellare.
- Facoltativo: **App Check** con reCAPTCHA v3 (Firebase > App Check) per limitare le chiamate da script esterni. Richiede di aggiungere l'inizializzazione di App Check in `index.html`.

## Guida rapida per i giocatori

1. Apri il link dell'app **in Chrome o Safari** (se si apre dentro WhatsApp: tre puntini > Apri nel browser).
2. Tocca **Accedi con Google**, crea il profilo e aspetta l'approvazione.
3. Installa l'app: su Android menu > *Aggiungi a schermata Home*; su iPhone Condividi > *Aggiungi alla schermata Home*.
4. Ogni settimana: tab **Partita** > **Ci sono / Forse / Non vengo**. Puoi portare fino a 3 ospiti.
5. Dopo la partita: vota l'**MVP** e il **campo** dalla card "Com'è andata".
6. Nel **Profilo** trovi statistiche, forma, record, testa a testa e la bacheca dei badge.
