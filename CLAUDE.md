# ioBroker.vis-2-widgets-sigenergy

## Mindestanforderungen (gültig bis auf Widerruf, gesetzt am 2026-08-05, admin am 2026-09-04 auf 7.8.23 gesenkt)

| Komponente | Minimum | Ort |
| --- | --- | --- |
| js-controller | `>=6.0.11` | `io-package.json` → `common.dependencies` |
| admin | `>=7.8.23` | `io-package.json` → `common.globalDependencies` |
| Node.js | `>=22` | `package.json` → `engines.node`, CI-Matrix |

Ältere Versionen werden nicht mehr unterstützt — keine Rückwärtskompatibilitäts-
Workarounds für js-controller < 6.0.11, admin < 7.8.23 oder Node < 22 einbauen.

Stand des Repos: `engines.node` ist auf `">= 22"`, CI testet mit `24.x`.
`common.dependencies` führt `js-controller: >=6.0.11` und `vis-2: >=2.0.0`,
`globalDependencies` führt `admin: >=7.8.23`. Die admin-Abhängigkeit bleibt bewusst
bestehen, obwohl der Repochecker sie wegen `adminUI.config: "none"` als entbehrlich
meldet (S1091).

## Admin ab 8.0.0 — React 19 + MUI 9

`iobroker.admin` > 8.0.0 basiert auf React 19 und MUI 9. **Für dieses Repo aktuell ohne
Auswirkung:** das Widget ist reines Vanilla-JS (`widgets/vis-2-widgets-sigenergy/js/`),
es gibt keinen React-/MUI-Code und keine Admin-Config-UI (`adminUI.config: "none"`).

Sollte hier jemals React-/MUI-Code entstehen (z. B. Portierung auf ein vis-2-React-Widget
oder eine Admin-Config), gilt React 19 + MUI 9 als verbindliches Ziel: kein `defaultProps`
an Funktionskomponenten, `ref` als normale Prop statt `forwardRef`, `createRoot` statt
`ReactDOM.render`, `sx`/`styled()` statt `makeStyles`/`withStyles`, Grid mit `size`-Prop.
React und MUI kommen dabei vom Host — als externals/peerDependencies führen, nicht mitbundeln.
