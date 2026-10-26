# ShiningBulbs Studio

Un gestionale per Riccardo e Stefano, pensato prima di tutto per Mac e PC. Interfaccia in italiano, ispirata alla semplicità delle app Apple. HTML, CSS e JavaScript senza build, compatibili con GitHub Pages.

## Prima di iniziare

**L’anteprima è una dimostrazione, non un database condiviso già attivo.** Il pulsante “Esplora l’anteprima” apre esempi modificabili conservati solo in memoria. Ricaricando la pagina, tornano i dati di esempio. Non contiene account reali, non salva dati e non comunica tra computer.

La modalità reale usa **Supabase Auth + PostgreSQL + Realtime**. Il progetto Supabase deve essere creato dal proprietario e collegato come spiegato sotto. Non è necessario condividere password o chiavi segrete con ChatGPT. Il codice non usa localStorage, sessionStorage o IndexedDB. Anche la sessione di login resta solo in memoria: dopo una ricarica è necessario accedere di nuovo.

## Cosa comprende

- **Progetti:** creazione, modifica ed eliminazione; responsabile Riccardo, Stefano o entrambi; piattaforma, descrizione, colore, icona e scadenza indicativa.
- **Roadmap:** le tre fasi e tutte le 11 attività richieste, generate insieme al progetto. Ogni attività può essere completata o riaperta e avere responsabile e scadenza propri.
- **Calendario:** settimana con tutti gli orari e mese; incontri con agenda, progetto e link della call. Click su giorno/orario per creare, click su incontro per modificarlo. Gli incontri coinvolgono entrambi i founder. Gli orari vengono mostrati nel fuso del dispositivo. Esportazione `.ics` per Apple Calendar, Google Calendar o Outlook; non è una sincronizzazione bidirezionale con questi servizi.
- **Idee:** fogli bianchi in blocchi, firma dell’autore, ultima firma di modifica, filtri per autore e progetto. Salvataggio dopo circa 650 ms di pausa nella scrittura. Le modifiche a blocchi diversi sono indipendenti. Se scrivete nello stesso blocco sulla stessa versione, la seconda scrittura non sovrascrive la prima: il testo locale resta disponibile e può essere salvato come nuova idea. Non è un editor con cursori condivisi o fusione di caratteri come Google Docs.
- **Revenues:** ricavi per app e spese generali o per progetto; categorie, data, importo in EUR e chi ha pagato/incassato. Totali, risultato netto, margine, storico degli ultimi sei mesi, ripartizione costi e confronto tra anticipi dei founder. Filtri tutto/anno/mese, modifica/eliminazione e CSV.
- **Studio:** ricerca, scorciatoie, profili, esportazione JSON dei dati. L’esportazione è un’istantanea; non è incluso un import automatico.

Il calendario non genera automaticamente link Meet/Teams né notifiche; permette di annotare i link già disponibili. Revenues registra importi effettivi inseriti manualmente: non legge App Store Connect, non importa transazioni bancarie e non calcola imposte. Un abbonamento si registra a ogni addebito; non genera spese future in automatico.

## 1. Crea il database

1. Vai su [Supabase](https://supabase.com) e crea un progetto dedicato a ShiningBulbs. Controlla i limiti e le condizioni del piano scelto prima di confermare. Non serve attivare servizi a pagamento per provare il codice se il piano disponibile copre il vostro utilizzo.
2. Apri **SQL Editor**, incolla tutto `database.sql` ed eseguilo una volta su un progetto nuovo. Lo script crea le tabelle, i vincoli, la funzione per i progetti, le policy RLS e la pubblicazione Realtime. Non carica gli esempi dell’anteprima.
3. In **Authentication → Users**, crea i vostri due utenti email/password con le email reali. Se la console permette “auto confirm”, abilitalo per gli account creati dall’amministratore; altrimenti completate la conferma tramite il flusso email del servizio. Usate credenziali personali diverse. Non inserite password nel repository.
4. Copia i loro **User UID**, quindi esegui separatamente questo comando sostituendo i segnaposto con gli UUID reali:

```sql
insert into public.members (id, display_name) values
  ('UUID_REALE_DI_RICCARDO', 'Riccardo'),
  ('UUID_REALE_DI_STEFANO', 'Stefano');
```

5. Disabilita la registrazione pubblica degli utenti nelle impostazioni Auth. L’app offre solo l’accesso, senza registrazione. Anche un account Auth diverso dai due autorizzati resta escluso dai dati grazie alle policy del database.
6. Controlla nelle impostazioni Realtime che `projects`, `tasks`, `ideas`, `events` e `transactions` siano nella pubblicazione `supabase_realtime`: lo script lo configura già.

La tabella `members` può contenere soltanto i due nomi, una volta ciascuno. Il browser può leggerla, ma non può aggiungere membri o modificare le autorizzazioni. Questa scelta è intenzionalmente limitata al vostro studio a due persone.

## 2. Collega il sito

Nella finestra **Connect** del progetto, oppure nelle impostazioni **API Keys**, recupera Project URL e **publishable key**. Modifica `config.js`:

```js
window.SHININGBULBS_CONFIG = Object.freeze({
  supabaseUrl: "https://IL-VOSTRO-PROGETTO.supabase.co",
  supabasePublishableKey: "sb_publishable_LA_VOSTRA_CHIAVE_PUBBLICABILE"
});
```

La chiave pubblicabile è prevista per il frontend; gli accessi sono protetti dalle policy RLS e dalla sessione autenticata. **Non usare `sb_secret_`, `service_role`, password del database o JWT secret.** Non disattivare RLS per risolvere un problema di accesso.

Il client ufficiale Supabase viene caricato da jsDelivr solo quando si tenta il login reale. Serve quindi accesso anche al CDN. Non sono usati font, tracker o altre librerie esterne nell’anteprima.

## 3. Carica su GitHub Pages

Nel pacchetto ZIP la cartella `ShiningBulbs` contiene direttamente i file da caricare. Non serve npm.

1. Crea un repository GitHub e carica nella sua radice i file contenuti nella cartella `ShiningBulbs`, senza cambiare i nomi:

| File | Funzione |
| --- | --- |
| `index.html` | Schermata iniziale e struttura |
| `style.css` | Interfaccia desktop e adattamento a schermi piccoli |
| `script.js` | Flussi, dati, calcoli, accesso e Realtime |
| `config.js` | URL e chiave pubblicabile del vostro database |
| `manifest.json` | Installazione come web app |
| `service-worker.js` | Worker senza cache e senza intercettazione delle API |
| `icon-192.png` | Icona 192 px |
| `icon-512.png` | Icona 512 px |
| `database.sql` | Preparazione del database |
| `README.md` | Questa guida |

2. Apri **Settings → Pages** del repository. Scegli la pubblicazione dal branch che hai caricato e dalla cartella radice. Attendi l’indirizzo restituito da GitHub.
3. Apri l’indirizzo HTTPS da entrambi i PC e accedete ciascuno con il proprio account.

I percorsi degli asset sono relativi: funzionano anche su `https://utente.github.io/nome-repository/`. Il sorgente di un sito statico è scaricabile dai visitatori; il contenuto privato risiede nel database e richiede un account autorizzato.

Per lavorare sul checkout Sites, i file web si trovano invece in `dist/`; `database.sql` e questa guida sono alla radice. Il pacchetto ZIP li riunisce per semplificare l’upload a GitHub. Non caricare `.openai`, credenziali di repository o file `.env` su GitHub.

## 4. Prova con i due account

1. Riccardo crea un progetto. Stefano deve vederlo apparire senza ricaricare.
2. Stefano completa una task. Riccardo deve vedere la casella e la percentuale aggiornate.
3. Scrivete in due idee diverse: ognuna deve aggiornarsi nell’altra finestra. Poi provate a modificare lo stesso blocco prima che l’altro abbia finito: nessuna scrittura deve andare persa silenziosamente.
4. Aggiungete una call e un movimento da ciascun account e controllate calendario e totali nell’altra finestra.
5. Uscite e rientrate: i dati reali devono essere ancora presenti. L’anteprima, invece, rimane sempre separata e temporanea.
6. Verificate che un terzo account Auth, senza riga in `members`, non possa leggere o modificare nessuna tabella dello studio.

La dicitura “Sincronizzato” indica una sottoscrizione Realtime connessa, non certifica una latenza massima. Se manca la connessione non c’è una coda offline persistente. Le idee non salvate restano nella finestra aperta, con avviso prima della chiusura e possibilità di ritentare. Per progetti, task, incontri e movimenti, un errore lascia visibile il problema e richiede di ripetere il salvataggio.

## Come leggere i numeri

- **Ricavi totali:** somma dei ricavi registrati nel periodo selezionato.
- **Costi totali:** somma dei costi registrati nello stesso periodo.
- **Risultato netto:** ricavi meno costi registrati; non è un utile fiscale.
- **Margine:** risultato netto / ricavi × 100; se i ricavi sono zero compare “—”.
- **Anticipi dei founder:** costi pagati da ciascuno. La differenza divisa per due indica il riequilibrio ipotizzando costi al 50%. Incassi, rimborsi precedenti e trasferimenti tra founder sono esclusi: il numero non è un debito contabile aggiornato automaticamente.
- **Risultato per app:** ricavi meno costi assegnati al progetto. Non distribuisce automaticamente i costi generali dello studio.

Eliminando un progetto si eliminano soltanto progetto e task. Le idee, gli incontri e i movimenti già associati restano nello studio e perdono l’associazione al progetto, preservando i totali.

## Verifiche e stato della consegna

Sono stati provati in browser nell’anteprima: creazione progetto e roadmap, completamento/riapertura task, scadenze e responsabili, inserimento incontro, cambio settimana/mese, creazione e scrittura idea, inserimento movimento e aggiornamento dei totali. I controlli automatici coprono anche centesimi, margine senza ricavi, conflitti di versione, bozze, esportazioni e sovrapposizione degli incontri.

**L’accesso reale, le policy su un server Supabase e la propagazione tra due computer non sono stati eseguiti contro un database di vostra proprietà, perché non è ancora collegato.** Lo schema e il collegamento frontend sono predisposti; la prova del punto 4 va effettuata dopo la configurazione. Non sono stati creati account o password reali per voi.

Documentazione ufficiale: [Supabase Auth](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [Realtime](https://supabase.com/docs/guides/realtime/postgres-changes), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [chiavi API](https://supabase.com/docs/guides/getting-started/api-keys).
