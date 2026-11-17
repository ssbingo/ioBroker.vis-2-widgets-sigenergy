# ioBroker.vis-2-widgets-sigenergy

## Mindestanforderungen (gültig bis auf Widerruf, gesetzt am 2026-08-05; admin-Abhängigkeit am 2026-09-07 entfernt; vis-2 ≥ 2.20.0 seit 2.0.0)

| Komponente | Minimum | Ort |
| --- | --- | --- |
| js-controller | `>=6.0.11` | `io-package.json` → `common.dependencies` |
| vis-2 | `>=2.20.0` | `io-package.json` → `common.dependencies` |
| Node.js | `>=22` | `package.json` → `engines.node`, CI-Matrix |

Ältere Versionen werden nicht mehr unterstützt — keine Rückwärtskompatibilitäts-
Workarounds für js-controller < 6.0.11, vis-2 < 2.20 oder Node < 22 einbauen.

Stand des Repos: `engines.node` ist auf `">= 22"`, CI testet mit 22/24/26.
`globalDependencies` ist leer. Eine admin-Abhängigkeit wird für Widget-Sets nicht
benötigt (kein Admin-UI, `adminUI.config: "none"`; Repochecker S1091) und darf nicht
wieder eingetragen werden.

## Architektur seit 2.0.0 — React 19 + MUI 9 (vis-2-React-Widget-Set)

Die Widgets sind seit 2.0.0 ein vis-2-React-Widget-Set mit Module Federation (Vorbild:
`/home/ssternitzke/ioBroker.vis-2-widgets-automatic-feeder`). Quellcode in
`src-widgets-ts/src/`, gebaut mit `npm run build` (`tasks.js` → Vite) nach
`widgets/vis-2-widgets-sigenergy/` (`customWidgets.js`, `assets/`, `img/`, `mf-manifest.json`).
**Das Build-Ergebnis in `widgets/` wird eingecheckt** und auch im CI/Deploy neu gebaut.

- Widget-IDs (`tplVis-2-widgets-sigenergy…`) und Attributnamen (`oid_*`, `sig_*`,
  `micro_*`) sind dieselben wie im früheren vis-1-Set → bestehende Views laufen ohne
  Neuanlage weiter. Nicht umbenennen.
- React 19 + MUI 9 sind verbindlich: kein `defaultProps` an Funktionskomponenten, `ref` als
  normale Prop statt `forwardRef`, `sx`/`styled()` statt `makeStyles`/`withStyles`, MUI-
  `slotProps` statt `componentsProps`. React/MUI kommen vom Host
  (`moduleFederationShared` aus `@iobroker/types-vis-2`) — nicht mitbundeln.
- Basisklasse `SigWidget.tsx`: Attribut-OIDs (Typ `id`) abonniert vis-2 selbst (Werte in
  `state.values`); abgeleitete OIDs (SigenMicro-Geräte, DC-Charger-State/Protokoll) über
  `extraIds()` → `socket.subscribeState` (liefert den Anfangswert mit), Werte in `state.extra`.
  Schreiben nur über `write()` (→ `context.setValue`, im Editor gesperrt).
- UI-Texte ausschließlich über i18n (`src/i18n/*.json`, alle 11 Sprachen, keine
  englischen Kopien; vis-2 setzt das Präfix `vis-2-widgets-sigenergy_`).
- CSS: `src/style.css` wird als String gebündelt und einmal injiziert (`styles.ts`).
  vis-2 ≥ 2.20 lädt kein `CssBaseline` mehr → `border-box` setzt das CSS selbst
  (`.sig-w *`) — nicht entfernen.
- Skalierung: `Scaled.tsx` (Port von `_applyScale`, nicht-uniform + Text-Gegenskalierung).

Lokaler Test im echten vis-2: isolierter Dev-Server unter `.dev-server/` (gitignored).
