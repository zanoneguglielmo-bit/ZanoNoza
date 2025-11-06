# Novastar Door Capacity Checker — MVP

Client-only web app per verificare la capienza (pixel) delle porte di controller Novastar.

Come usare (MVP):

1. Apri `index.html` nel browser (nessun server richiesto).
2. Imposta il numero di porte e la capacità per porta (in pixel) oppure carica un preset.
3. Aggiungi pannelli manualmente (width, height, porta) o incolla un CSV (width,height,port per riga).
4. La tabella "Risultato per porta" mostrerà i totali e segnalerà le porte sovraccariche.
5. Puoi esportare l'elenco pannelli in CSV.

Note:
- Questo è un MVP client-only. Presets in `presets.json` sono esemplificativi: inserisci i valori reali per i tuoi controller Novastar.
- Miglioramenti possibili: validazione avanzata, salvataggio progetti, UI più ricca, report PDF.

