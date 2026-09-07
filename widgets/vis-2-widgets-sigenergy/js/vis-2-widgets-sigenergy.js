/*
    ioBroker.vis vis-2-widgets-sigenergy — Widget-Set
    4 Widgets: Energiefluss · Akku-Status · Echtzeit-Leistung · Statistiken

    version: "1.8.9"
    Copyright 2026 ssbingo s.sternitzke@online.de
*/
"use strict";

/* global $, vis, systemDictionary */

// add translations for edit mode
if (typeof systemDictionary !== "undefined") {
    $.extend(
        true,
        systemDictionary,
        {
        "sig_title":    { "en": "Title",             "de": "Titel" },
        "sig_darkmode": { "en": "Dark mode",         "de": "Dunkelmodus" },
        "sig_animation":{ "en": "Animation",         "de": "Animation" },
        "oid_pv":       { "en": "PV Power OID",      "de": "PV-Leistung OID" },
        "oid_bat":      { "en": "Battery Power OID", "de": "Batterie-Leistung OID" },
        "oid_grid":     { "en": "Grid Power OID",    "de": "Netz-Leistung OID" },
        "oid_house":    { "en": "House Power OID",   "de": "Haus-Leistung OID" },
        "oid_soc":      { "en": "Battery SOC OID",   "de": "Batterie SOC OID" },
        "oid_soh":      { "en": "Battery SOH OID",   "de": "Batterie SOH OID" },
        "oid_ttf":      { "en": "Time to Full OID",  "de": "Zeit bis Voll OID" },
        "oid_ttr":      { "en": "Time Remaining OID","de": "Restlaufzeit OID" },
        "oid_sc":       { "en": "Self Consumption OID","de": "Eigenverbrauch OID" },
        "oid_aut":      { "en": "Autarky Rate OID",  "de": "Autarkierate OID" },
        "oid_maxsoc":   { "en": "Day Max SOC OID",   "de": "Tages Max SOC OID" },
        "oid_minsoc":   { "en": "Day Min SOC OID",   "de": "Tages Min SOC OID" },
        "oid_charg":    { "en": "Daily Charge OID",  "de": "Tages-Ladung OID" },
        "oid_discharg": { "en": "Daily Discharge OID","de": "Tages-Entladung OID" },
        "oid_covtime":  { "en": "Battery Coverage OID","de": "Batteriedeckung OID" },
        "oid_chargt":   { "en": "Daily Charge Time OID","de": "Tages-Ladezeit OID" },
        "oid_pv1":      { "en": "PV String 1 Power OID",  "de": "PV String 1 Leistung OID" },
        "oid_pv2":      { "en": "PV String 2 Power OID",  "de": "PV String 2 Leistung OID" },
        "oid_pv3":      { "en": "PV String 3 Power OID",  "de": "PV String 3 Leistung OID" },
        "oid_pvtotal":  { "en": "Total PV Power OID",     "de": "PV Gesamtleistung OID" },
        "sig_name1":    { "en": "Name String 1",         "de": "Name String 1" },
        "sig_name2":    { "en": "Name String 2",         "de": "Name String 2" },
        "sig_name3":    { "en": "Name String 3",         "de": "Name String 3" },
        "oid_ev_soc":   { "en": "Vehicle SOC OID",        "de": "Fahrzeug SOC OID" },
        "oid_charging": { "en": "Charging State OID",     "de": "Lade-Status OID" },
        "sig_car_image":{ "en": "Car Image",               "de": "Fahrzeug-Bild" }
        }
    );
}

vis.binds["vis-2-widgets-sigenergy"] = {
    version: "1.8.9",

    showVersion: function () {
        if (vis.binds["vis-2-widgets-sigenergy"].version) {
            console.log("Version vis-2-widgets-sigenergy: " + vis.binds["vis-2-widgets-sigenergy"].version);
            vis.binds["vis-2-widgets-sigenergy"].version = null;
        }
    },

    // ── Helfer ──────────────────────────────────────────────────────────────
    _fmtKW: function (v) {
        var n = parseFloat(v);
        return isNaN(n) ? "-- kW" : (Math.abs(n) >= 10 ? n.toFixed(1) : n.toFixed(2)) + " kW";
    },
    _fmtPct: function (v) {
        var n = parseFloat(v);
        return isNaN(n) ? "--%"    : Math.round(n) + "%";
    },
    _fmtKWh: function (v) {
        var n = parseFloat(v);
        return isNaN(n) ? "-- kWh" : n.toFixed(2) + " kWh";
    },
    _fmtMin: function (v) {
        var m = Math.round(Math.abs(parseFloat(v) || 0));
        if (!m) return "0 min";
        return m < 60 ? m + " min" : Math.floor(m / 60) + "h " + (m % 60) + "m";
    },
    _socCol: function (p) {
        return parseFloat(p) > 60 ? "#27ae60" : parseFloat(p) > 25 ? "#f39c12" : "#e74c3c";
    },
    _el: function (id) { return document.getElementById(id); },
    _txt: function (id, v) {
        var e = vis.binds["vis-2-widgets-sigenergy"]._el(id);
        if (e) e.textContent = v;
    },
    _css: function (id, p, v) {
        var e = vis.binds["vis-2-widgets-sigenergy"]._el(id);
        if (e) e.style[p] = v;
    },

    // State-Zugriff: vis.states[key + '.val']
    _val: function (data, attr) {
        var oid = data.attr(attr);
        if (!oid) return undefined;
        return vis.states[oid + ".val"];
    },

    // ── Tooltip-Popup ────────────────────────────────────────────────────────
    // Wird als eigenes Element an document.body gehängt und per position:fixed
    // am Anker ausgerichtet. Damit liegt es außerhalb des skalierten Widget-
    // Baums (_applyScale) und über allen Widget-Inhalten: keine Verdeckung
    // durch transformierte Text-Elemente, kein Abschneiden durch overflow:hidden
    // und eine feste, lesbare Schriftgröße unabhängig vom Widget-Maßstab.
    _tip: null,
    _tipAnchor: null,
    _tipDark: true,
    _showTip: function (anchor, text, dark) {
        var B = vis.binds["vis-2-widgets-sigenergy"];
        if (!anchor || !text) { B._hideTip(); return; }
        var tip = B._tip;
        if (!tip) {
            tip = document.createElement("div");
            document.body.appendChild(tip);
            B._tip = tip;
            // Bei Scroll/Resize neu ausrichten; ausblenden nur, wenn der Anker
            // nicht mehr im Dokument ist (Widget entfernt / View gewechselt).
            var reposition = function () {
                var a = B._tipAnchor;
                if (!a) return;
                if (!document.body.contains(a)) { B._hideTip(); return; }
                B._showTip(a, a.getAttribute("data-tip"), B._tipDark);
            };
            window.addEventListener("scroll", reposition, true);
            window.addEventListener("resize", reposition);
        }
        tip.className   = "sig-tip-popup" + (dark ? "" : " light");
        tip.textContent = text;
        tip.style.display = "block";
        B._tipAnchor = anchor;
        B._tipDark   = !!dark;

        var r  = anchor.getBoundingClientRect();
        var tw = tip.offsetWidth, th = tip.offsetHeight;
        var vw = window.innerWidth, vh = window.innerHeight;
        var left = r.right - tw;                       // rechtsbündig unter dem Anker
        if (left + tw > vw - 8) left = vw - 8 - tw;
        if (left < 8) left = 8;
        var top = r.bottom + 6;
        if (top + th > vh - 8) top = r.top - th - 6;   // kein Platz unten → oberhalb
        if (top < 8) top = 8;
        tip.style.left = left + "px";
        tip.style.top  = top  + "px";
    },
    _hideTip: function () {
        var B = vis.binds["vis-2-widgets-sigenergy"];
        if (B._tip) B._tip.style.display = "none";
        B._tipAnchor = null;
    },
    // Anker-Element mit Tooltip verknüpfen: Text kommt aus dem data-tip-Attribut
    // (kann per update() jederzeit geändert werden), Anzeige bei Hover oder
    // Fokus (Tastatur / Tippen auf Touch-Geräten, dazu tabindex="0").
    _bindTip: function (anchor, dark) {
        var B = vis.binds["vis-2-widgets-sigenergy"];
        if (!anchor || anchor._sigTipBound) return;
        anchor._sigTipBound = true;
        var show = function () { B._showTip(anchor, anchor.getAttribute("data-tip"), dark); };
        anchor.addEventListener("mouseenter", show);
        anchor.addEventListener("focus",      show);
        anchor.addEventListener("mouseleave", function () { if (document.activeElement !== anchor) B._hideTip(); });
        anchor.addEventListener("blur",       B._hideTip);
    },

    // Darkmode-Checkbox: VIS-2 liefert Boolean true/false ODER String "true"/"false"
    // Diese Funktion normalisiert beide Varianten zuverlaessig.
    _isDark: function (data) {
        var v = data.attr("sig_darkmode");
        return (v === true || v === "true" || v === "1" || v === 1);
    },

    // Subscription mit VIS-konformem $div.data()-Muster
    _subscribe: function (wid, data, attrs, onChange) {
        var $div  = $("#" + wid);
        var bound = [];
        for (var i = 0; i < attrs.length; i++) {
            var oid = data.attr(attrs[i]);
            if (oid) {
                var key = oid + ".val";
                bound.push(key);
                vis.states.bind(key, onChange);
            }
        }
        $div.data("bound",       bound);
        $div.data("bindHandler", onChange);
    },

    // ── Skalierungs-Helper ──────────────────────────────────────────────────
    // Wrappt den aktuellen Content von $div in einen Scale-Container mit
    // fester Design-Breite (designWidth). Skaliert non-uniform per
    //    transform: scale(sx, sy)
    // wobei sx und sy unabhängig aus der aktuellen Widget-Breite bzw. -Höhe
    // berechnet werden. Breite und Höhe reagieren dadurch separat auf
    // Container-Änderungen; der Inhalt füllt immer die komplette Widget-
    // Fläche. Bei stark abweichendem Seitenverhältnis ggü. dem Design kann
    // dabei eine Verzerrung entstehen — das ist der Preis dafür, dass beide
    // Achsen einzeln skalierbar bleiben.
    // Die natürliche Design-Höhe wird dynamisch per inner.offsetHeight
    // gelesen (nicht durch transform beeinflusst) — Content-Updates wie
    // Tab-Wechsel im Inverter/SigenMicro-Widget werden automatisch erfasst.
    _applyScale: function ($div, designWidth) {
        var el = $div[0];
        if (!el || !designWidth) return;

        var outer, inner;
        var existing = el.querySelector(":scope > .sig-scale-outer");
        if (existing) {
            outer = existing;
            inner = outer.firstChild;
            inner.style.width = designWidth + "px";
        } else {
            outer = document.createElement("div");
            outer.className = "sig-scale-outer";
            inner = document.createElement("div");
            inner.className = "sig-scale-inner";
            inner.style.width = designWidth + "px";
            while (el.firstChild) {
                inner.appendChild(el.firstChild);
            }
            outer.appendChild(inner);
            el.appendChild(outer);
        }

        var apply = function () {
            var w = el.clientWidth;
            var h = el.clientHeight;
            if (!w) return;
            /* offsetHeight ist die Layout-Höhe OHNE transform-scale
               → bleibt stabil und liefert die "natürliche" Design-Höhe,
                  auch nach Content-Änderungen (Tab-Wechsel, Updates). */
            var innerH = inner.offsetHeight;
            var sx = w / designWidth;
            var sy = (h > 0 && innerH > 0) ? (h / innerH) : sx;
            inner.style.transform = "scale(" + sx + ", " + sy + ")";
            inner.style.left = "0";
            inner.style.top  = "0";

            /* Text-Kompensation: Text-Elemente bekommen eine Gegen-Skalierung,
               sodass Buchstaben-Proportionen erhalten bleiben (keine Verzerrung),
               während Container/Boxen die Widget-Fläche füllen.

               Generischer Selector: alle Elemente mit Namens-Konventionen für
               Text-Träger in den 9 Widgets:
                 *-title, *-lbl, *-label, *-val, *-value, *-name,
                 *-big, *-sub, *-soh, *-head, *-badge, *-btn, *-tab,
                 *-toggle, *-startstop, plus .sig-text Marker-Klasse. */
            var textCompensation;
            if (sx >= sy) {
                textCompensation = "scaleX(" + (sy / sx) + ")";
            } else {
                textCompensation = "scaleY(" + (sx / sy) + ")";
            }
            if (!el._sigTextSelector) {
                el._sigTextSelector = [
                    ".sig-text",
                    "[class*='-title']", "[class*='-lbl']", "[class*='-label']",
                    "[class*='-val']",   "[class*='-value']", "[class*='-name']",
                    "[class*='-big']",   "[class*='-sub']",   "[class*='-soh']",
                    "[class*='-head']",  "[class*='-badge']", "[class*='-btn']",
                    "[class*='-tab']",   "[class*='-toggle']","[class*='-startstop']",
                    "[class*='-oid']",   "[class*='-nr']",    "[class*='-unit']",
                    "[class*='-model']", "[class*='-serial']","[class*='-fw']",
                    /* SigenMicro Label-Sektion */
                    ".sig-sm-label-id", ".sig-sm-label-pwr", ".sig-sm-label-st",
                    ".sig-soc-labels span"
                ].join(",");
            }
            var texts = inner.querySelectorAll(el._sigTextSelector);
            for (var i = 0; i < texts.length; i++) {
                /* Flex/Grid-Container nicht kompensieren — sonst verschieben sich
                   deren Kind-Elemente. Layout-Container behalten sx,sy,
                   nur echte Text-Blöcke bekommen die Gegen-Skalierung. */
                var d = getComputedStyle(texts[i]).display;
                if (d === "flex" || d === "grid" ||
                    d === "inline-flex" || d === "inline-grid") {
                    continue;
                }
                texts[i].style.transform = textCompensation;
                texts[i].style.transformOrigin = "0 50%";
            }
        };
        apply();

        if (el._sigScaleObs) {
            try { el._sigScaleObs.disconnect(); } catch (e) {}
        }
        if (window.ResizeObserver) {
            el._sigScaleObs = new ResizeObserver(apply);
            el._sigScaleObs.observe(el);    /* Outer-Container-Resize */
            el._sigScaleObs.observe(inner); /* Inner-Layout (z.B. Tab-Wechsel) */
        } else if (!el._sigScaleListener) {
            el._sigScaleListener = apply;
            window.addEventListener("resize", apply);
        }
    },

    // ── Widget 1: Energiefluss-Diagramm ─────────────────────────────────────
    //
    // SVG-Koordinaten (viewBox 0 0 300 248):
    //   Solar PV   oben-links  (58, 42)
    //   Batterie   oben-rechts (242, 42)
    //   Netz       unten-links (58, 208)
    //   Haus       unten-rechts(242, 208)
    //   Hub ⚡     Mitte       (150, 125)
    //
    // Pfade:
    //   PV   → Hub  M58,63   Q58,125  142,125
    //   Bat  → Hub  M242,63  Q242,125 158,125
    //   Netz → Hub  M58,191  Q58,125  142,125
    //   Hub  → Haus M158,125 Q242,125 242,191
    //
    createEnergyFlow: function (widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-sigenergy"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function () { B.createEnergyFlow(widgetID, view, data, style); }, 100);
        }

        var dark  = B._isDark(data);
        var title = data.attr("sig_title") || "Energiefluss";
        var cls   = dark ? "sig-ef-wrap" : "sig-ef-wrap light";
        var tc    = dark ? "#e0e6ef" : "#2c3e50";  // text colour
        var w     = widgetID;

        // ── Einheitliches SVG: Pfeile + Icons + Labels + Werte ──────────────
        // Alle 5 Knoten liegen im selben Koordinatenraum wie die Pfade,
        // daher zeigen Pfeile immer exakt auf die Icons.

        var svg =
            '<svg viewBox="0 0 300 248" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +

            // ── Pfeil-Marker ─────────────────────────────────────────────
            '<defs>' +
            '<marker id="mPv_'   + w + '" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0,0 6,3 0,6" fill="#f39c12"/></marker>' +
            '<marker id="mBat_'  + w + '" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0,0 6,3 0,6" fill="#9b59b6"/></marker>' +
            '<marker id="mGrid_'   + w + '" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0,0 6,3 0,6" fill="#3498db"/></marker>' +
                        '<marker id="mHouse_'  + w + '" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0,0 6,3 0,6" fill="#27ae60"/></marker>' +
            '</defs>' +

            // ── Animierte Flusspfade ──────────────────────────────────────
            '<path id="sig_path_pv_'   + w + '" class="sig-flow-path pv-color"    d="M58,63  Q58,125  142,125" marker-end="url(#mPv_'   + w + ')"/>' +
            '<path id="sig_path_bat_dis_' + w + '" class="sig-flow-path bat-color"   d="M242,71 Q242,125 158,125" marker-end="url(#mBat_' + w + ')"/>' +
            '<path id="sig_path_bat_chg_' + w + '" class="sig-flow-path bat-color"   d="M158,125 Q242,125 242,71"  marker-end="url(#mBat_' + w + ')"/>' +
            '<path id="sig_path_grid_buy_' + w + '" class="sig-flow-path grid-color"  d="M58,191 Q58,125  142,125" marker-end="url(#mGrid_' + w + ')"/>' +
            '<path id="sig_path_grid_exp_' + w + '" class="sig-flow-path grid-color"  d="M142,125 Q58,125  58,191"  marker-end="url(#mGrid_' + w + ')"/>' +
            '<path id="sig_path_house_'+ w + '" class="sig-flow-path house-color" d="M158,125 Q242,125 242,191" marker-end="url(#mHouse_'+ w + ')"/>' +

            // ── Hub-Kreis Mitte ───────────────────────────────────────────
            '<circle cx="150" cy="125" r="18" fill="' + (dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)') + '"/>' +
            '<text x="150" y="125" text-anchor="middle" dominant-baseline="central" font-size="18" fill="' + tc + '" opacity="0.85">&#9889;</text>' +

            // ── Solar PV  (oben-links, Knotenmitte 58, 42) ───────────────
            '<text x="58" y="28"  text-anchor="middle" dominant-baseline="central" font-size="20" fill="#f39c12">&#9728;</text>' +
            '<text x="58" y="45"  text-anchor="middle" dominant-baseline="central" font-size="8.5" fill="' + tc + '" opacity="0.65">Solar PV</text>' +
            '<text id="sig_ef_pv_'   + w + '" x="58" y="57" text-anchor="middle" dominant-baseline="central" font-size="12.5" font-weight="700" fill="#f39c12">-- kW</text>' +

            // ── Batterie  (oben-rechts, Knotenmitte 242, 42) ─────────────
            // SOC-Anzeige links neben dem Batterie-Icon
            '<text x="202" y="18" text-anchor="middle" dominant-baseline="central" font-size="8" fill="' + tc + '" opacity="0.65">SOC</text>' +
            '<text id="sig_ef_socval_'+ w + '" x="202" y="31" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="700" fill="#9b59b6">--%</text>' +
            // Batterie-Icon als SVG: Rahmen + dynamische Füllung + Pol
            '<rect x="229" y="21" width="22" height="14" rx="2" fill="none" stroke="#9b59b6" stroke-width="1.5"/>' +
            '<rect x="251" y="24" width="3" height="8" rx="1" fill="#9b59b6"/>' +
            '<rect id="sig_ef_batfill_'+ w + '" x="230" y="22" width="11" height="12" rx="1" fill="#9b59b6"/>' +
            '<text x="242" y="45" text-anchor="middle" dominant-baseline="central" font-size="8.5" fill="' + tc + '" opacity="0.65">Batterie</text>' +
            '<text id="sig_ef_bat_'  + w + '" x="242" y="57" text-anchor="middle" dominant-baseline="central" font-size="12.5" font-weight="700" fill="#9b59b6">-- kW</text>' +

            // ── Netz  (unten-links, Knotenmitte 58, 208) ─────────────────
            '<text x="58" y="197" text-anchor="middle" dominant-baseline="central" font-size="20" fill="#3498db">&#128268;</text>' +
            '<text x="58" y="214" text-anchor="middle" dominant-baseline="central" font-size="8.5" fill="' + tc + '" opacity="0.65">Netz</text>' +
            '<text id="sig_ef_grid_' + w + '" x="58" y="226" text-anchor="middle" dominant-baseline="central" font-size="12.5" font-weight="700" fill="#3498db">-- kW</text>' +

            // ── Haus  (unten-rechts, Knotenmitte 242, 208) ───────────────
            '<text x="242" y="197" text-anchor="middle" dominant-baseline="central" font-size="20" fill="#27ae60">&#127968;</text>' +
            '<text x="242" y="214" text-anchor="middle" dominant-baseline="central" font-size="8.5" fill="' + tc + '" opacity="0.65">Haus</text>' +
            '<text id="sig_ef_house_'+ w + '" x="242" y="226" text-anchor="middle" dominant-baseline="central" font-size="12.5" font-weight="700" fill="#27ae60">-- kW</text>' +

            '</svg>';

        $div.html(
            '<div class="sig-w"><div class="' + cls + '">' +
            '<div class="sig-ef-title">&#9889; ' + title + '</div>' +
            '<div class="sig-ef-svg-wrap">' + svg + '</div>' +
            '</div></div>'
        );
        B._applyScale($div, 300);

        function update() {
            var pv   = parseFloat(B._val(data, "oid_pv"))    || 0;
            var bat  = parseFloat(B._val(data, "oid_bat"))   || 0;
            var grid = parseFloat(B._val(data, "oid_grid"))  || 0;
            var hous = parseFloat(B._val(data, "oid_house")) || 0;
            var soc  = parseFloat(B._val(data, "oid_soc"))   || 0;

            // Werte setzen (SVG-Text-Knoten)
            B._txt("sig_ef_pv_"    + w, B._fmtKW(pv));
            B._txt("sig_ef_bat_"   + w, B._fmtKW(bat));
            B._txt("sig_ef_grid_"  + w, B._fmtKW(grid));
            B._txt("sig_ef_house_" + w, B._fmtKW(hous));

            // Netz-Farbe: grün = Einspeisung, rot = Bezug
            B._css("sig_ef_grid_"    + w, "fill", grid < 0 ? "#27ae60" : "#e74c3c");
            // Batterie-SOC: Wert links + Icon-Füllung dynamisch
            B._txt("sig_ef_socval_" + w, Math.round(soc) + " %");
            B._css("sig_ef_socval_" + w, "fill", B._socCol(soc));
            var batfill = B._el("sig_ef_batfill_" + w);
            if (batfill) {
                var fw = Math.max(1, Math.round(soc / 100 * 20));
                batfill.setAttribute("width", String(fw));
                batfill.setAttribute("fill", B._socCol(soc));
            }

            // Pfade aktivieren/deaktivieren → startet/stoppt CSS-Dash-Animation
            var paths = ["pv", "house"];
            var vals  = [pv, hous];
            for (var i = 0; i < paths.length; i++) {
                var el = B._el("sig_path_" + paths[i] + "_" + w);
                if (el) {
                    if (Math.abs(vals[i]) > 0.05) el.classList.add("active");
                    else                           el.classList.remove("active");
                }
            }
            // Batterie – zwei separate Pfade je Richtung:
            // sig_path_bat_dis: Battery→Mitte (Entladen, bat < 0)
            // sig_path_bat_chg: Mitte→Battery (Laden,    bat > 0)
            var batDis = B._el("sig_path_bat_dis_" + w);
            var batChg = B._el("sig_path_bat_chg_" + w);
            if (batDis && batChg) {
                if (bat < -0.05) {
                    // Entladen: Entlade-Pfad aktiv, Lade-Pfad inaktiv
                    batDis.classList.add("active");
                    batChg.classList.remove("active");
                } else if (bat > 0.05) {
                    // Laden: Lade-Pfad aktiv, Entlade-Pfad inaktiv
                    batChg.classList.add("active");
                    batDis.classList.remove("active");
                } else {
                    // Inaktiv: beide aus
                    batDis.classList.remove("active");
                    batChg.classList.remove("active");
                }
            }
            // Netz – zwei separate Pfade je Richtung:
            // sig_path_grid_buy: Netz→Mitte  (Netzbezug,    grid > 0)
            // sig_path_grid_exp: Mitte→Netz  (Einspeisung,  grid < 0)
            var gridBuy = B._el("sig_path_grid_buy_" + w);
            var gridExp = B._el("sig_path_grid_exp_" + w);
            if (gridBuy && gridExp) {
                if (grid > 0.05) {
                    // Netzbezug: Netz→Mitte aktiv
                    gridBuy.classList.add("active");
                    gridExp.classList.remove("active");
                } else if (grid < -0.05) {
                    // Einspeisung: Mitte→Netz aktiv
                    gridExp.classList.add("active");
                    gridBuy.classList.remove("active");
                } else {
                    // Inaktiv: beide aus
                    gridBuy.classList.remove("active");
                    gridExp.classList.remove("active");
                }
            }
        }
        B._subscribe(widgetID, data, ["oid_pv", "oid_bat", "oid_grid", "oid_house", "oid_soc"], update);
        update();
    },

    // ── Widget 2: Akku-Status & Prognosen ───────────────────────────────────
    createBatteryStatus: function (widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-sigenergy"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function () { B.createBatteryStatus(widgetID, view, data, style); }, 100);
        }

        var dark = B._isDark(data);
        var cls  = "sig-bat-wrap" + (dark ? "" : " light");
        var w    = widgetID;

        $div.html(
            '<div class="sig-w"><div class="' + cls + '">' +
            '<div class="sig-bat-head"><span class="icon">&#128267;</span><span class="title">Batterie Status</span>' +
            '<span class="sig-bat-soh" id="sig_bat_soh_' + w + '">SOH: --%</span></div>' +
            '<div class="sig-soc-big" id="sig_bat_soc_' + w + '">--%</div>' +
            '<div class="sig-soc-bar-bg"><div class="sig-soc-bar-fill" id="sig_bat_bar_' + w + '" style="width:0%"></div></div>' +
            '<div class="sig-soc-labels"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>' +
            '<div class="sig-bat-stats">' +
            '<div class="sig-stat-box"><div class="sig-stat-label">&#9889; Leistung</div><div class="sig-stat-val" id="sig_bat_pow_' + w + '">--</div></div>' +
            '<div class="sig-stat-box"><div class="sig-stat-label">&#8987; Bis Voll</div><div class="sig-stat-val" id="sig_bat_ttf_' + w + '">--</div></div>' +
            '<div class="sig-stat-box"><div class="sig-stat-label">&#9203; Restlaufzeit</div><div class="sig-stat-val" id="sig_bat_ttr_' + w + '">--</div></div>' +
            '<div class="sig-stat-box"><div class="sig-stat-label">&#9728; Eigenverbrauch</div><div class="sig-stat-val" id="sig_bat_sc_' + w + '">--</div></div>' +
            '<div class="sig-stat-box"><div class="sig-stat-label">&#127969; Autarkierate</div><div class="sig-stat-val" id="sig_bat_aut_' + w + '">--</div></div>' +
            '</div></div></div>'
        );
        B._applyScale($div, 300);

        function update() {
            var soc = parseFloat(B._val(data, "oid_soc")) || 0;
            var col = B._socCol(soc);
            B._txt("sig_bat_soh_" + w, "SOH: " + B._fmtPct(B._val(data, "oid_soh")));
            B._txt("sig_bat_soc_" + w, B._fmtPct(soc));
            B._css("sig_bat_soc_" + w, "color", col);
            var bar = B._el("sig_bat_bar_" + w);
            if (bar) { bar.style.width = Math.min(100, soc) + "%"; bar.style.background = col; }
            var bat = parseFloat(B._val(data, "oid_bat")) || 0;
            B._txt("sig_bat_pow_" + w, B._fmtKW(bat));
            B._css("sig_bat_pow_" + w, "color", bat >= 0 ? "#27ae60" : "#e74c3c");
            B._txt("sig_bat_ttf_" + w, B._fmtMin(B._val(data, "oid_ttf")));
            B._txt("sig_bat_ttr_" + w, B._fmtMin(B._val(data, "oid_ttr")));
            B._txt("sig_bat_sc_"  + w, B._fmtPct(B._val(data, "oid_sc")));
            B._txt("sig_bat_aut_" + w, B._fmtPct(B._val(data, "oid_aut")));
        }
        B._subscribe(widgetID, data, ["oid_soc", "oid_soh", "oid_bat", "oid_ttf", "oid_ttr", "oid_sc", "oid_aut"], update);
        update();
    },

    // ── Widget 3: Echtzeit-Leistung ─────────────────────────────────────────
    createPowerOverview: function (widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-sigenergy"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function () { B.createPowerOverview(widgetID, view, data, style); }, 100);
        }

        var dark  = B._isDark(data);
        var title = data.attr("sig_title") || "Live Leistung";
        var cls   = "sig-pow-wrap" + (dark ? "" : " light");
        var w     = widgetID;

        $div.html(
            '<div class="sig-w"><div class="' + cls + '">' +
            '<div class="sig-pow-title"><div class="sig-live-dot"></div>' + title + '</div>' +
            '<div class="sig-pow-row"><div class="sig-pow-left"><div class="sig-dot" style="background:#f39c12"></div>&#9728; Solar PV</div><div class="sig-pow-val" id="sig_pow_pv_'    + w + '">-- kW</div></div>' +
            '<div class="sig-pow-row"><div class="sig-pow-left"><div class="sig-dot" style="background:#9b59b6"></div>&#128267; Batterie</div><div class="sig-pow-val" id="sig_pow_bat_'   + w + '">-- kW</div></div>' +
            '<div class="sig-pow-row"><div class="sig-pow-left"><div class="sig-dot" style="background:#3498db"></div>&#128268; Netz</div><div class="sig-pow-val" id="sig_pow_grid_'  + w + '">-- kW</div></div>' +
            '<div class="sig-pow-row"><div class="sig-pow-left"><div class="sig-dot" style="background:#27ae60"></div>&#127968; Haus</div><div class="sig-pow-val" id="sig_pow_house_' + w + '">-- kW</div></div>' +
            '<div class="sig-pow-row" style="border-top:1px solid rgba(128,128,128,.15);margin-top:6px;padding-top:6px;">' +
            '<div class="sig-pow-left"><div class="sig-dot" style="background:#8e44ad"></div>&#128267; SOC</div>' +
            '<div class="sig-pow-val" id="sig_pow_soc_' + w + '">--%</div></div>' +
            '</div></div>'
        );
        B._applyScale($div, 300);

        function update() {
            var bat  = parseFloat(B._val(data, "oid_bat"))  || 0;
            var grid = parseFloat(B._val(data, "oid_grid")) || 0;
            var soc  = B._val(data, "oid_soc");
            B._txt("sig_pow_pv_"    + w, B._fmtKW(B._val(data, "oid_pv")));
            B._txt("sig_pow_bat_"   + w, B._fmtKW(bat));
            B._css("sig_pow_bat_"   + w, "color", bat  < 0 ? "#e74c3c" : "#27ae60");
            B._txt("sig_pow_grid_"  + w, B._fmtKW(grid));
            B._css("sig_pow_grid_"  + w, "color", grid < 0 ? "#27ae60" : "#e74c3c");
            B._txt("sig_pow_house_" + w, B._fmtKW(B._val(data, "oid_house")));
            B._txt("sig_pow_soc_"   + w, B._fmtPct(soc));
            B._css("sig_pow_soc_"   + w, "color", B._socCol(soc));
        }
        B._subscribe(widgetID, data, ["oid_pv", "oid_bat", "oid_grid", "oid_house", "oid_soc"], update);
        update();
    },

    // ── Widget 4: Energiestatistiken ────────────────────────────────────────
    createStatistics: function (widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-sigenergy"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function () { B.createStatistics(widgetID, view, data, style); }, 100);
        }

        var dark  = B._isDark(data);
        var title = data.attr("sig_title") || "Tagesstatistik";
        var cls   = "sig-stats-wrap" + (dark ? " dark" : "");
        var w     = widgetID;

        $div.html(
            '<div class="sig-w"><div class="' + cls + '">' +
            '<div class="sig-stats-title">&#128202; ' + title + '</div>' +
            '<div class="sig-stats-grid">' +
            '<div class="sig-stats-item"><div class="s-label">&#127969; Autarkierate</div><div class="s-value" style="color:#27ae60" id="sig_st_aut_'    + w + '">--</div></div>' +
            '<div class="sig-stats-item"><div class="s-label">&#8635; Eigenverbrauch</div><div class="s-value" style="color:#9b59b6" id="sig_st_sc_'     + w + '">--</div></div>' +
            '<div class="sig-stats-item"><div class="s-label">&#8593; Max SOC heute</div><div class="s-value" style="color:#f39c12" id="sig_st_maxsoc_'  + w + '">--</div></div>' +
            '<div class="sig-stats-item"><div class="s-label">&#8595; Min SOC heute</div><div class="s-value" style="color:#3498db" id="sig_st_minsoc_'  + w + '">--</div></div>' +
            '<div class="sig-stats-item"><div class="s-label">&#11014; Tages-Ladung</div><div class="s-value" style="color:#16a085" id="sig_st_chg_'    + w + '">--</div></div>' +
            '<div class="sig-stats-item"><div class="s-label">&#11015; Tages-Entladung</div><div class="s-value" style="color:#e74c3c" id="sig_st_dchg_' + w + '">--</div></div>' +
            '<div class="sig-stats-item"><div class="s-label">&#8987; Batteriedeckung</div><div class="s-value" style="color:#8e44ad" id="sig_st_cov_'   + w + '">--</div></div>' +
            '<div class="sig-stats-item"><div class="s-label">&#9889; Ladezeit heute</div><div class="s-value" style="color:#c0392b" id="sig_st_cht_'    + w + '">--</div></div>' +
            '</div></div></div>'
        );
        B._applyScale($div, 300);

        function update() {
            B._txt("sig_st_aut_"    + w, B._fmtPct(B._val(data, "oid_aut")));
            B._txt("sig_st_sc_"     + w, B._fmtPct(B._val(data, "oid_sc")));
            B._txt("sig_st_maxsoc_" + w, B._fmtPct(B._val(data, "oid_maxsoc")));
            B._txt("sig_st_minsoc_" + w, B._fmtPct(B._val(data, "oid_minsoc")));
            B._txt("sig_st_chg_"    + w, B._fmtKWh(B._val(data, "oid_charg")));
            B._txt("sig_st_dchg_"   + w, B._fmtKWh(B._val(data, "oid_discharg")));
            B._txt("sig_st_cov_"    + w, B._fmtMin(B._val(data, "oid_covtime")));
            B._txt("sig_st_cht_"    + w, B._fmtMin(B._val(data, "oid_chargt")));
        }
        B._subscribe(widgetID, data, ["oid_aut", "oid_sc", "oid_maxsoc", "oid_minsoc", "oid_charg", "oid_discharg", "oid_covtime", "oid_chargt"], update);
        update();
    },

    // ── Widget 5: AC-Charger (Sigen EVAC) ───────────────────────────────────
    //
    // Systemzustände (acCharger.systemState, Control-Pilot nach IEC 61851-1):
    //   0 = System init      Wallbox initialisiert sich
    //   1 = A1/A2            kein Fahrzeug angeschlossen
    //   2 = B1               angesteckt, keine Ladefreigabe
    //   3 = B2               angesteckt, Freigabe erteilt, Fahrzeug fordert nichts an
    //   4 = C1               Fahrzeug fordert an, keine Freigabe/kein PWM (Übergang)
    //   5 = C2               Laden aktiv
    //   6 = F                Wallbox nicht verfügbar / Fehler Ladestation
    //   7 = E                Fehler Pilotsignal / Ladekabel
    // Zustand D (Laden mit Lüftung) ist bei Sigenergy nicht vorgesehen.
    // Badge: 0 Initialisierung, 1 Frei, 2/3 Verbunden, 4/5 Lädt, 6/7 Fehler;
    // die ausführliche Erklärung erscheint als Tooltip-Popup (data-tip, _bindTip).
    //
    // Steuerung:
    //   acCharger.control.startStop   0=Start, 1=Stop  (WO)
    //   acCharger.control.outputCurrent  6..rated A    (RW)
    //
    // Der Slider-Bereich ist [6, max]. max = kleinster Wert aus dem Nennstrom des
    // Laders (oid_ratedCurrent) und der Widget-Einstellung sig_maxCurrent (0 = aus).
    // Werte über dem Nennstrom quittiert das Gerät mit einem Modbus-Fehler.
    //
    createAcCharger: function (widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-sigenergy"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function () { B.createAcCharger(widgetID, view, data, style); }, 100);
        }

        var dark  = B._isDark(data);
        var title = data.attr("sig_title") || "AC-Charger";
        var cls   = "sig-ac-wrap" + (dark ? "" : " light");
        var w     = widgetID;

        // Systemzustand → lesbarer Text, Badge-Klasse und Tooltip-Erklärung
        var STATE_INFO = {
            0: { label: "Initialisierung", badge: "idle",
                 tip: "System init (0): Wallbox startet bzw. initialisiert sich, noch kein gültiger Zustand." },
            1: { label: "Frei", badge: "idle",
                 tip: "A1/A2 (1): Kein Fahrzeug angeschlossen, Stecker frei. A1 = Wallbox nicht bereit, A2 = Wallbox bereit und wartet auf ein Fahrzeug." },
            2: { label: "Verbunden", badge: "idle",
                 tip: "B1 (2): Fahrzeug angesteckt, die Wallbox hat noch keine Ladefreigabe erteilt (z. B. App/Backend, Lastmanagement, Sperre)." },
            3: { label: "Verbunden", badge: "idle",
                 tip: "B2 (3): Fahrzeug angesteckt, Ladefreigabe erteilt, das Fahrzeug fordert (noch) keinen Strom an – z. B. Akku voll, Ladeplan im Auto, Ladepause." },
            4: { label: "Lädt", badge: "charging",
                 tip: "C1 (4): Fahrzeug fordert Ladung an, die Wallbox gibt keine Freigabe/kein PWM – Übergangszustand, z. B. beim Beenden der Ladung oder bei Sperrung während des Ladens." },
            5: { label: "Lädt", badge: "charging",
                 tip: "C2 (5): Laden aktiv – das Fahrzeug fordert Strom an, die Wallbox gibt frei, es fließt Energie." },
            6: { label: "Fehler", badge: "error",
                 tip: "F (6): Wallbox nicht verfügbar bzw. Fehler der Ladestation – z. B. interner Fehler, Übertemperatur, Abschaltung durch Lastmanagement." },
            7: { label: "Fehler", badge: "error",
                 tip: "E (7): Fehler am Pilotsignal/Ladekabel – Kurzschluss oder Unterbrechung des CP-Signals, Spannungsausfall, Kabel- oder Fahrzeugfehler." }
        };
        function stateInfo(v) {
            var n = parseInt(v);
            if (STATE_INFO.hasOwnProperty(n)) return STATE_INFO[n];
            return { label: "Unbekannt", badge: "error",
                     tip: (v === undefined || v === null || v === "")
                        ? "Kein Wert für den Systemzustand empfangen."
                        : "Unbekannter Systemzustand (Wert " + v + ")." };
        }

        // Alarm-Text: 0 = kein Alarm
        function alarmText(a1, a2, a3) {
            var v = (parseInt(a1) || 0) | (parseInt(a2) || 0) | (parseInt(a3) || 0);
            return v ? "⚠ Alarm " + v.toString(16).toUpperCase() : "OK";
        }

        // Obergrenze des Ladestrom-Sliders in A (siehe Kommentar oben)
        var MIN_CURRENT = 6;
        var DEFAULT_MAX_CURRENT = 32;
        function maxCurrent() {
            var cfg = parseFloat(data.attr("sig_maxCurrent"));
            var rc  = parseFloat(B._val(data, "oid_ratedCurrent"));
            var max = 0;
            if (cfg > 0) max = cfg;
            if (rc > 0 && (!max || rc < max)) max = rc;
            if (!max) max = DEFAULT_MAX_CURRENT;
            return Math.max(MIN_CURRENT, Math.floor(max));
        }
        function clampCurrent(v) {
            return Math.min(Math.max(Math.round(v), MIN_CURRENT), maxCurrent());
        }

        $div.html(
            '<div class="sig-w"><div class="' + cls + '">' +
            // ── Kopfzeile ──────────────────────────────────────────────
            '<div class="sig-ac-head">' +
            '<span class="icon">&#128268;</span>' +
            '<span class="title">' + title + '</span>' +
            '<span class="sig-ac-badge idle" id="sig_ac_badge_' + w + '" tabindex="0" data-tip="">Frei</span>' +
            '</div>' +
            // ── Ladeleistung groß ────────────────────────────────────
            '<div class="sig-ac-power-big" id="sig_ac_power_' + w + '">-- kW</div>' +
            '<div class="sig-ac-power-lbl">Ladeleistung</div>' +
            // ── Statistik-Kacheln ────────────────────────────────────
            '<div class="sig-ac-stats">' +
            '<div class="sig-ac-stat-box"><div class="sig-ac-stat-lbl">Nennleistung</div><div class="sig-ac-stat-val" id="sig_ac_rp_' + w + '" style="color:#f39c12">-- kW</div></div>' +
            '<div class="sig-ac-stat-box"><div class="sig-ac-stat-lbl">Nennstrom</div><div class="sig-ac-stat-val" id="sig_ac_rc_' + w + '" style="color:#f39c12">-- A</div></div>' +
            '<div class="sig-ac-stat-box"><div class="sig-ac-stat-lbl">Gesamtenergie</div><div class="sig-ac-stat-val" id="sig_ac_en_' + w + '" style="color:#27ae60">-- kWh</div></div>' +
            '<div class="sig-ac-stat-box"><div class="sig-ac-stat-lbl">Alarm</div><div class="sig-ac-stat-val" id="sig_ac_alm_' + w + '" style="color:#27ae60">--</div></div>' +
            '</div>' +
            // ── Steuerung ────────────────────────────────────────────
            '<div class="sig-ac-ctrl">' +
            '<div class="sig-ac-ctrl-lbl">Steuerung</div>' +
            '<div class="sig-ac-btn-row">' +
            '<button class="sig-ac-btn start" id="sig_ac_start_' + w + '">&#9654; Start</button>' +
            '<button class="sig-ac-btn stop"  id="sig_ac_stop_'  + w + '">&#9646;&#9646; Stop</button>' +
            '</div>' +
            '<div class="sig-ac-slider-row">' +
            '<span class="sig-ac-slider-lbl">Ladestrom:</span>' +
            '<input type="range" class="sig-ac-slider" id="sig_ac_slider_' + w + '" min="6" max="32" step="1" value="16">' +
            '<span class="sig-ac-slider-val" id="sig_ac_slider_val_' + w + '">16 A</span>' +
            '</div>' +
            '</div>' +
            '</div></div>'
        );
        B._applyScale($div, 300);

        // ── Anzeige aktualisieren ────────────────────────────────────────────
        function update() {
            var state = B._val(data, "oid_state");
            var si    = stateInfo(state);
            var badge = B._el("sig_ac_badge_" + w);
            if (badge) {
                badge.textContent = si.label;
                badge.className   = "sig-ac-badge " + si.badge;
                badge.setAttribute("data-tip", si.tip);
                if (B._tipAnchor === badge) B._showTip(badge, si.tip, dark);
            }

            var pwr   = parseFloat(B._val(data, "oid_power")) || 0;
            B._txt("sig_ac_power_"   + w, B._fmtKW(pwr));
            B._css("sig_ac_power_"   + w, "color", pwr > 0.05 ? "#3498db" : (dark ? "#e0e6ef" : "#2c3e50"));

            var rp    = parseFloat(B._val(data, "oid_ratedPower"))   || 0;
            var rc    = parseFloat(B._val(data, "oid_ratedCurrent")) || 0;
            var en    = parseFloat(B._val(data, "oid_energy"))       || 0;
            B._txt("sig_ac_rp_"      + w, rp ? rp.toFixed(1) + " kW" : "-- kW");
            B._txt("sig_ac_rc_"      + w, rc ? Math.round(rc) + " A" : "-- A");
            B._txt("sig_ac_en_"      + w, en ? en.toFixed(1) + " kWh" : "-- kWh");

            var a1 = B._val(data, "oid_alarm1");
            var a2 = B._val(data, "oid_alarm2");
            var a3 = B._val(data, "oid_alarm3");
            var alTxt = alarmText(a1, a2, a3);
            B._txt("sig_ac_alm_"     + w, alTxt);
            B._css("sig_ac_alm_"     + w, "color", alTxt === "OK" ? "#27ae60" : "#e74c3c");

            // Ladestrom-Slider: Obergrenze (Nennstrom / Einstellung) und aktuellen Wert anzeigen
            var slider = B._el("sig_ac_slider_" + w);
            if (slider) {
                var max = maxCurrent();
                if (parseInt(slider.max) !== max) slider.max = max;
                var curOid = data.attr("oid_current");
                if (curOid && !slider._dragging) {
                    var curVal = parseFloat(vis.states[curOid + ".val"]);
                    slider.value = clampCurrent(isNaN(curVal) ? 16 : curVal);
                    B._txt("sig_ac_slider_val_" + w, slider.value + " A");
                } else if (parseInt(slider.value) > max) {
                    slider.value = max;
                    B._txt("sig_ac_slider_val_" + w, slider.value + " A");
                }
            }

            // Start/Stop-Buttons: Während eines aktiven Ladevorgangs (C1/C2) ist
            // Start gesperrt und abgedunkelt, Stop wird hervorgehoben. Der Ring
            // (active-state) zeigt den zuletzt gesendeten Befehl, aber nur auf dem
            // Button, der zum aktuellen Zustand passt.
            var ssOid  = data.attr("oid_startStop");
            var ssVal  = ssOid ? parseInt(vis.states[ssOid + ".val"]) : null;
            var btnStart = B._el("sig_ac_start_" + w);
            var btnStop  = B._el("sig_ac_stop_"  + w);
            if (btnStart && btnStop) {
                var charging = si.badge === "charging" ||
                               (si.label === "Unbekannt" && pwr > 0.05);
                btnStart.disabled = charging;
                btnStart.title    = charging ? "Ladevorgang läuft – zum Beenden Stop drücken" : "";
                btnStop.classList.toggle("raised", charging);
                btnStart.classList.toggle("active-state", !charging && ssVal === 0);
                btnStop.classList.toggle("active-state",  charging && ssVal === 1);
            }
        }

        // ── Tooltip am Status-Badge ──────────────────────────────────────────
        B._bindTip(B._el("sig_ac_badge_" + w), dark);

        // ── Steuer-Events ────────────────────────────────────────────────────
        var startBtn = B._el("sig_ac_start_" + w);
        var stopBtn  = B._el("sig_ac_stop_"  + w);
        var slider   = B._el("sig_ac_slider_" + w);
        var sliderLbl= B._el("sig_ac_slider_val_" + w);

        if (startBtn) {
            startBtn.addEventListener("click", function () {
                if (startBtn.disabled) return;
                var oid = data.attr("oid_startStop");
                if (oid) vis.setValue(oid, 0);
            });
        }
        if (stopBtn) {
            stopBtn.addEventListener("click", function () {
                var oid = data.attr("oid_startStop");
                if (oid) vis.setValue(oid, 1);
            });
        }
        if (slider && sliderLbl) {
            slider.addEventListener("input", function () {
                sliderLbl.textContent = slider.value + " A";
            });
            slider.addEventListener("mousedown",  function () { slider._dragging = true;  });
            slider.addEventListener("touchstart", function () { slider._dragging = true;  });
            function sendCurrent() {
                slider._dragging = false;
                var oid = data.attr("oid_current");
                if (!oid) return;
                var v = clampCurrent(parseFloat(slider.value) || MIN_CURRENT);
                slider.value = v;
                sliderLbl.textContent = v + " A";
                vis.setValue(oid, v);
            }
            slider.addEventListener("mouseup",    sendCurrent);
            slider.addEventListener("touchend",   sendCurrent);
        }

        B._subscribe(widgetID, data,
            ["oid_state", "oid_power", "oid_energy", "oid_ratedPower", "oid_ratedCurrent",
             "oid_alarm1", "oid_alarm2", "oid_alarm3", "oid_startStop", "oid_current"],
            update);
        update();
    },

    // ── Widget 6: DC-Charger ─────────────────────────────────────────────────
    //
    // Lese-OIDs:
    //   dcCharger.outputPower                Ausgangsleistung  kW
    //   dcCharger.vehicleSoc                 Fahrzeug-SOC      %
    //   dcCharger.vehicleBatteryVoltage      Fahrzeugbatterie  V
    //   dcCharger.chargingCurrent            Ladestrom         A
    //   dcCharger.currentChargingCapacity    Sitzungsenergie   kWh
    //   dcCharger.currentChargingDuration    Sitzungsdauer     s
    //
    //   dcCharger.runningState               Betriebszustand der Säule (optional)
    //     0 Idle, 1 Occupied, 2 Preparing (Communication), 3 Charging, 4 Fault,
    //     5 Scheduled, 6 Ended, 7 Unavailable, 8 Discharging, 9 Alarm,
    //     10 Preparing (Insulation). Typischer Ablauf: 0→1→2→10→3→6→0.
    //     Badge: 0 Frei, 1/2/10 Verbunden bzw. Vorbereitung, 5 Geplant, 3 Lädt,
    //     8 Entlädt, 6 Beendet, 9 Warnung, 4/7 Fehler bzw. Nicht verfügbar.
    //     Fehlt oid_state, wird die OID aus oid_power abgeleitet (…outputPower →
    //     …runningState); liefert auch das keinen Wert, wird der Badge aus der
    //     Ausgangsleistung abgeleitet und der Tooltip erklärt den Grund – abhängig
    //     von der vom Adapter erkannten Protokollversion (info.protocolVersion /
    //     info.protocolLevel): Register 31513 gibt es erst ab Protokoll V2.8.
    //
    // Steuer-OID:
    //   dcCharger.control.startStop          0=Start, 1=Stop   WO
    //
    createDcCharger: function (widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-sigenergy"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function () { B.createDcCharger(widgetID, view, data, style); }, 100);
        }

        var dark  = B._isDark(data);
        var title = data.attr("sig_title") || "DC-Charger";
        var cls   = "sig-dc-wrap" + (dark ? "" : " light");
        var w     = widgetID;

        // Dauer in Sekunden → "Xh Ym" oder "Ym"
        function fmtDuration(sec) {
            var s = Math.round(Math.abs(parseFloat(sec) || 0));
            if (!s) return "0 min";
            var h = Math.floor(s / 3600);
            var m = Math.floor((s % 3600) / 60);
            return h ? h + "h " + m + "m" : m + " min";
        }

        // Fahrzeug-SOC → Farbe
        function vsocCol(p) {
            return parseFloat(p) > 60 ? "#27ae60" : parseFloat(p) > 25 ? "#f39c12" : "#e74c3c";
        }

        // Betriebszustand (dcCharger.runningState) → Text, Badge-Klasse, Tooltip
        var STATE_INFO = {
            0:  { label: "Frei", cls: "idle",
                  tip: "Idle (0): Leerlauf – kein Fahrzeug angeschlossen, die Säule ist betriebsbereit und wartet." },
            1:  { label: "Verbunden", cls: "idle",
                  tip: "Occupied (1): Der Ladestecker steckt im Fahrzeug, es besteht aber noch keine Verbindung bzw. Erkennung – der Handshake hat noch nicht begonnen." },
            2:  { label: "Vorbereitung", cls: "idle",
                  tip: "Preparing (2): Kommunikationsaufbau mit dem Fahrzeug – Aushandlung nach CCS/ISO 15118 bzw. DIN 70121 (Ladeparameter, Spannungs- und Stromgrenzen)." },
            3:  { label: "Lädt", cls: "charging",
                  tip: "Charging (3): Ladevorgang läuft, es wird Gleichstrom ins Fahrzeug geliefert." },
            4:  { label: "Fehler", cls: "error",
                  tip: "Fault (4): Ladevorgang wegen einer Störung abgebrochen bzw. blockiert (z. B. Isolationsfehler, Übertemperatur, Kommunikationsabbruch). Die Säule lädt erst wieder, wenn der Fehler quittiert bzw. behoben ist." },
            5:  { label: "Geplant", cls: "scheduled",
                  tip: "Scheduled (5): Geplante Ladung – Fahrzeug angeschlossen, die Ladung ist per Zeit- bzw. Ladeplan aufgeschoben und startet zum vorgesehenen Zeitpunkt." },
            6:  { label: "Beendet", cls: "idle",
                  tip: "Ended (6): Ladevorgang beendet – die Sitzung ist abgeschlossen (Akku voll, Stopp durch Nutzer/Fahrzeug oder Ziel erreicht), der Stecker steckt in der Regel noch." },
            7:  { label: "Nicht verfügbar", cls: "error",
                  tip: "Unavailable (7): Die Säule ist außer Betrieb, z. B. Wartungsmodus, gesperrt oder durch das System deaktiviert." },
            8:  { label: "Entlädt", cls: "discharging",
                  tip: "Discharging (8): Bidirektionaler Betrieb (V2H/V2G) – Energie fließt vom Fahrzeugakku zurück ins Haus- bzw. Netzsystem." },
            9:  { label: "Warnung", cls: "warning",
                  tip: "Alarm (9): Es liegt eine Warnung vor, die den Ladevorgang nicht zwingend abbricht (anders als Fault). Details stehen in den Alarm-Registern." },
            10: { label: "Vorbereitung", cls: "idle",
                  tip: "Preparing (10): Isolationsprüfung läuft – vor der Freigabe der Hochspannung wird der Isolationswiderstand der DC-Leitung zum Fahrzeug geprüft (Sicherheitsschritt direkt vor dem Ladestart)." }
        };
        // 0xFFFF ist die "Register ungültig"-Kennung des Sigenergy-Protokolls
        // ("Range:[0, 0xFFFFFFFE]. With value 0xFFFFFFFF, register is not valid.").
        // Eine Säule antwortet so für ein Register, das gerade nicht zutrifft —
        // beobachtet an einem SigenStor EC MIT DC-Charger für Register 31513,
        // während die Nachbarregister (Nennleistung, PV-Ertrag) normal lesen.
        // Adapter ab 3.3.1 liefern dafür gar keinen Wert mehr; ältere reichen die
        // rohe 65535 durch. Beide Fälle werden hier gleich behandelt.
        var STATE_INVALID = 0xffff;

        // State-OID: explizit konfiguriert oder aus der Leistungs-OID abgeleitet
        // (…dcCharger.outputPower → …dcCharger.runningState), damit auch Widgets,
        // die vor Einführung der Einstellung platziert wurden, den Zustand zeigen.
        var stateOid  = data.attr("oid_state") || "";
        var stateAuto = false;
        if (!stateOid) {
            var pwrOid = data.attr("oid_power") || "";
            if (/\.dcCharger\.outputPower$/.test(pwrOid)) {
                stateOid  = pwrOid.replace(/\.outputPower$/, ".runningState");
                stateAuto = true;
            }
        }

        // Protokollversion des Adapters: info.protocolVersion (Zahl, ab Adapter
        // 3.3) bzw. info.protocolLevel (Text ">=V2.9" / "pre-V2.6") der Instanz,
        // aus der die Leistungs-/State-OID stammt. Der DC-Charger-Betriebszustand
        // (Register 31513) existiert erst ab Sigenergy-Protokoll V2.8.
        var STATE_SINCE = 2.8;
        // Bevorzugt die konfigurierte OID (Attribut oid_protocol, /id → VIS
        // abonniert sie und füllt vis.states). Ohne Attribut — Widgets, die vor
        // dessen Einführung platziert wurden — werden die beiden info-OIDs aus
        // der Instanz abgeleitet; sie sind dann aber NICHT abonniert, weshalb
        // vis.states für sie leer bleiben kann (siehe protocolVersion()).
        var protoOid  = data.attr("oid_protocol") || "";
        var instMatch = /^([^.]+\.\d+)\./.exec(protoOid || stateOid || data.attr("oid_power") || "");
        var protoOids = protoOid
            ? [protoOid]
            : instMatch
              ? [instMatch[1] + ".info.protocolVersion", instMatch[1] + ".info.protocolLevel"]
              : [];
        // Liefert die Protokollversion oder null, wenn sie hier nicht ablesbar
        // ist. null heißt ausdrücklich "das Widget kennt sie nicht" — nicht
        // "der Adapter hat keine erkannt"; ohne abonnierte OID sind das zwei
        // verschiedene Dinge, die der Tooltip nicht verwechseln darf.
        function protocolVersion() {
            for (var i = 0; i < protoOids.length; i++) {
                var raw = vis.states[protoOids[i] + ".val"];
                if (raw === undefined || raw === null || raw === "") continue;
                var num = parseFloat(raw);
                if (num > 0) return num;
                var txt = String(raw);
                if (/pre-V2\.6/i.test(txt)) return 2.5;
                var m = /V(\d+\.\d+)/.exec(txt);
                if (m) return parseFloat(m[1]);
            }
            return null;
        }
        function protocolText(v) {
            return v === null ? "unbekannt" : (v < 2.6 ? "vor V2.6" : "V" + v);
        }

        // Ohne verwertbaren Betriebszustand: Badge aus der Leistung ableiten und
        // im Tooltip erklären, warum nur die Leistung herangezogen wird.
        function powerBadge(pwr, hint) {
            var b;
            if (pwr > 0.05)       b = { label: "Lädt",    cls: "charging",    tip: "Lädt – die Ausgangsleistung ist größer als 0." };
            else if (pwr < -0.05) b = { label: "Entlädt", cls: "discharging", tip: "Entlädt – die Ausgangsleistung ist negativ (V2H/V2G)." };
            else                  b = { label: "Bereit",  cls: "idle",        tip: "Bereit – keine Ausgangsleistung." };
            b.tip += " " + hint;
            return b;
        }
        // Erklärung, warum kein Betriebszustand vorliegt (abhängig von der Protokollversion)
        function noStateHint() {
            var pv = protocolVersion();
            if (pv !== null && pv < STATE_SINCE) {
                return "Der Betriebszustand der Säule (Register 31513) wird erst ab Sigenergy-Protokoll V2.8 geliefert, das Gerät meldet " + protocolText(pv) + ".";
            }
            if (pv !== null) {
                return "Der Adapter liefert keinen Wert für " + stateOid + ", obwohl das Gerät Protokoll " + protocolText(pv) + " meldet. Entweder kennzeichnet die Säule das Register als ungültig, oder der Adapter hat es als nicht unterstützt aussortiert — das Adapter-Log zeigt unter dem Block 31509–31518, welcher der beiden Fälle vorliegt.";
            }
            return "Der Adapter liefert keinen Wert für " + stateOid + " (Betriebszustand der Säule, benötigt Sigenergy-Protokoll V2.8). " +
                   "Die Protokollversion der Instanz ist hier nicht ablesbar — bitte in den Widget-Einstellungen die OID \u201eProtokollversion\u201c (info.protocolVersion) eintragen, dann nennt dieser Hinweis den konkreten Grund.";
        }
        // Die Säule selbst kennzeichnet das Register als ungültig — das ist weder
        // ein Adapter- noch ein Konfigurationsfehler und darf nicht so aussehen.
        function invalidStateHint() {
            return "Die Säule meldet für Register 31513 den Wert \u201eungültig\u201c (0xFFFF) und stellt damit keinen Betriebszustand bereit. " +
                   "Das ist kein Adapter- oder Konfigurationsfehler — die übrigen DC-Charger-Register (Nennleistung, PV-Ertrag, Zählerstände) werden normal gelesen. " +
                   "Adapter ab 3.3.1 liefern für solche Register keinen Wert mehr, statt die rohe 65535 durchzureichen.";
        }
        function badgeInfo(state, pwr) {
            if (!stateOid) {
                return powerBadge(pwr, "Der Zustand wird nur aus der Ausgangsleistung abgeleitet, weil in den Widget-Einstellungen keine State-OID (dcCharger.runningState) eingetragen ist.");
            }
            // Kein Wert (Adapter >= 3.3.1) oder rohe 0xFFFF (ältere Adapter):
            // beides heißt "die Säule stellt keinen Betriebszustand bereit". Der
            // Badge wird dann aus der Ausgangsleistung abgeleitet statt als rotes
            // "Unbekannt" zu erscheinen — die Säule arbeitet ja, sie meldet nur
            // dieses eine Register nicht. Der Tooltip nennt den Grund.
            var missing = (state === undefined || state === null || state === "");
            var invalid = !missing && parseInt(state) === STATE_INVALID;
            if (missing || invalid) {
                return powerBadge(
                    pwr,
                    "Der Zustand wird nur aus der Ausgangsleistung abgeleitet. " +
                        (invalid ? invalidStateHint() : noStateHint()),
                );
            }
            var n = parseInt(state);
            if (STATE_INFO.hasOwnProperty(n)) return STATE_INFO[n];
            return { label: "Unbekannt", cls: "error", tip: "Unbekannter Betriebszustand (Wert " + state + ")." };
        }

        $div.html(
            '<div class="sig-w"><div class="' + cls + '">' +
            // ── Kopfzeile ────────────────────────────────────────────
            '<div class="sig-dc-head">' +
            '<span class="icon">&#9889;</span>' +
            '<span class="title">' + title + '</span>' +
            '<span class="sig-dc-badge idle" id="sig_dc_badge_' + w + '" tabindex="0" data-tip="">Frei</span>' +
            '</div>' +
            // ── Leistung groß ─────────────────────────────────────
            '<div class="sig-dc-power-big" id="sig_dc_power_' + w + '">-- kW</div>' +
            '<div class="sig-dc-power-lbl">Ausgangsleistung</div>' +
            // ── Fahrzeug-SOC Balken ───────────────────────────────
            '<div class="sig-dc-soc-row">' +
            '<span class="sig-dc-soc-lbl">&#128664; Fahrzeug SOC</span>' +
            '<span class="sig-dc-soc-val" id="sig_dc_vsoc_' + w + '">--%</span>' +
            '</div>' +
            '<div class="sig-dc-soc-bar-bg">' +
            '<div class="sig-dc-soc-bar-fill" id="sig_dc_bar_' + w + '" style="width:0%;background:#27ae60"></div>' +
            '</div>' +
            // ── Statistik-Kacheln ─────────────────────────────────
            '<div class="sig-dc-stats">' +
            '<div class="sig-dc-stat-box"><div class="sig-dc-stat-lbl">Spannung</div><div class="sig-dc-stat-val" id="sig_dc_volt_' + w + '" style="color:#3498db">-- V</div></div>' +
            '<div class="sig-dc-stat-box"><div class="sig-dc-stat-lbl">Strom</div><div class="sig-dc-stat-val" id="sig_dc_curr_' + w + '" style="color:#3498db">-- A</div></div>' +
            '<div class="sig-dc-stat-box"><div class="sig-dc-stat-lbl">Sitzungsenergie</div><div class="sig-dc-stat-val" id="sig_dc_en_' + w + '" style="color:#9b59b6">-- kWh</div></div>' +
            '<div class="sig-dc-stat-box"><div class="sig-dc-stat-lbl">Sitzungsdauer</div><div class="sig-dc-stat-val" id="sig_dc_dur_' + w + '" style="color:#9b59b6">--</div></div>' +
            '</div>' +
            // ── Steuerung ─────────────────────────────────────────
            '<div class="sig-dc-ctrl">' +
            '<div class="sig-dc-ctrl-lbl">Steuerung</div>' +
            '<div class="sig-dc-btn-row">' +
            '<button class="sig-dc-btn start" id="sig_dc_start_' + w + '">&#9654; Start</button>' +
            '<button class="sig-dc-btn stop"  id="sig_dc_stop_'  + w + '">&#9646;&#9646; Stop</button>' +
            '</div>' +
            '</div>' +
            '</div></div>'
        );
        B._applyScale($div, 300);

        // ── Anzeige aktualisieren ───────────────────────────────────────────
        function update() {
            var pwr  = parseFloat(B._val(data, "oid_power"))    || 0;
            var vsoc = parseFloat(B._val(data, "oid_vsoc"))     || 0;
            var volt = parseFloat(B._val(data, "oid_vvolt"))    || 0;
            var curr = parseFloat(B._val(data, "oid_curr"))     || 0;
            var en   = parseFloat(B._val(data, "oid_energy"))   || 0;
            var dur  = parseFloat(B._val(data, "oid_duration")) || 0;

            // Badge (Betriebszustand, sonst aus Leistung abgeleitet)
            var bi = badgeInfo(stateOid ? vis.states[stateOid + ".val"] : undefined, pwr);
            var badge = B._el("sig_dc_badge_" + w);
            if (badge) {
                badge.textContent = bi.label;
                badge.className   = "sig-dc-badge " + bi.cls;
                badge.setAttribute("data-tip", bi.tip);
                if (B._tipAnchor === badge) B._showTip(badge, bi.tip, dark);
            }

            // Leistung
            B._txt("sig_dc_power_" + w, B._fmtKW(pwr));
            B._css("sig_dc_power_" + w, "color",
                pwr > 0.05 ? "#f39c12" : pwr < -0.05 ? "#9b59b6" : (dark ? "#e0e6ef" : "#2c3e50"));

            // Fahrzeug-SOC
            var col = vsocCol(vsoc);
            B._txt("sig_dc_vsoc_" + w, B._fmtPct(vsoc));
            B._css("sig_dc_vsoc_" + w, "color", col);
            var bar = B._el("sig_dc_bar_" + w);
            if (bar) { bar.style.width = Math.min(100, vsoc) + "%"; bar.style.background = col; }

            // Kacheln
            B._txt("sig_dc_volt_" + w, volt ? volt.toFixed(0) + " V"   : "-- V");
            B._txt("sig_dc_curr_" + w, curr ? curr.toFixed(1) + " A"   : "-- A");
            B._txt("sig_dc_en_"   + w, en   ? en.toFixed(2)   + " kWh" : "-- kWh");
            B._txt("sig_dc_dur_"  + w, dur  ? fmtDuration(dur)         : "--");

            // Start/Stop-Buttons: Während einer aktiven Sitzung (Laden oder
            // Entladen) ist Start gesperrt und Stop hervorgehoben. Der Ring
            // (active-state) zeigt den zuletzt gesendeten Befehl auf dem passenden Button.
            var ssOid    = data.attr("oid_startStop");
            var ssVal    = ssOid ? parseInt(vis.states[ssOid + ".val"]) : null;
            var btnStart = B._el("sig_dc_start_" + w);
            var btnStop  = B._el("sig_dc_stop_"  + w);
            if (btnStart && btnStop) {
                var active = bi.cls === "charging" || bi.cls === "discharging";
                btnStart.disabled = active;
                btnStart.title    = active ? "Ladevorgang läuft – zum Beenden Stop drücken" : "";
                btnStop.classList.toggle("raised", active);
                btnStart.classList.toggle("active-state", !active && ssVal === 0);
                btnStop.classList.toggle("active-state",  active && ssVal === 1);
            }
        }

        // ── Tooltip am Status-Badge ─────────────────────────────────────────
        B._bindTip(B._el("sig_dc_badge_" + w), dark);

        // ── Steuer-Events ───────────────────────────────────────────────────
        var startBtn = B._el("sig_dc_start_" + w);
        var stopBtn  = B._el("sig_dc_stop_"  + w);

        if (startBtn) {
            startBtn.addEventListener("click", function () {
                if (startBtn.disabled) return;
                var oid = data.attr("oid_startStop");
                if (oid) vis.setValue(oid, 0);
            });
        }
        if (stopBtn) {
            stopBtn.addEventListener("click", function () {
                var oid = data.attr("oid_startStop");
                if (oid) vis.setValue(oid, 1);
            });
        }

        B._subscribe(widgetID, data,
            ["oid_state", "oid_power", "oid_vsoc", "oid_vvolt", "oid_curr",
             "oid_energy", "oid_duration", "oid_startStop", "oid_protocol"],
            update);
        // Zusätzlich binden, was nicht über ein Attribut läuft: die abgeleitete
        // State-OID und — nur ohne gesetztes oid_protocol — die abgeleiteten
        // info-OIDs. Mit Attribut hat _subscribe sie bereits gebunden.
        var extra = (stateAuto ? [stateOid] : []).concat(protoOid ? [] : protoOids);
        if (extra.length) {
            var bound = $div.data("bound") || [];
            for (var ei = 0; ei < extra.length; ei++) {
                bound.push(extra[ei] + ".val");
                vis.states.bind(extra[ei] + ".val", update);
            }
            $div.data("bound", bound);
        }
        update();
    },

    // ── Widget 7: Inverter ───────────────────────────────────────────────────
    //
    // Tabs: Leistung | Batterie | Netz | Alarme | Info
    //
    // runningState: 0=Standby, 1=Running, 2=Fault, 3=Shutdown
    // control.startStop: 0=Stop, 1=Start  (ACHTUNG: invertiert zu Charger-Widgets!)
    //
    createInverter: function (widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-sigenergy"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function () { B.createInverter(widgetID, view, data, style); }, 100);
        }

        var dark  = B._isDark(data);
        var title = data.attr("sig_title") || "Inverter";
        var cls   = "sig-inv-wrap" + (dark ? "" : " light");
        var w     = widgetID;

        // Betriebsstatus-Mapping
        function stateInfo(v) {
            switch (parseInt(v)) {
                case 0: return { label: "Standby",  cls: "standby"  };
                case 1: return { label: "Running",  cls: "running"  };
                case 2: return { label: "Fault",    cls: "fault"    };
                case 3: return { label: "Shutdown", cls: "shutdown" };
                default:return { label: "–",        cls: "standby"  };
            }
        }

        // Temperaturfarbe
        function tempCol(t) {
            var v = parseFloat(t);
            return v > 50 ? "#e74c3c" : v > 35 ? "#f39c12" : "#27ae60";
        }

        // Alarm-Darstellung: 0 = OK
        function almInfo(v) {
            var n = parseInt(v) || 0;
            return n === 0
                ? { text: "OK",          cls: "ok",    valCls: "ok"    }
                : { text: "0x" + n.toString(16).toUpperCase(), cls: "error", valCls: "error" };
        }

        // ── HTML aufbauen ────────────────────────────────────────────────────
        $div.html(
            '<div class="sig-w"><div class="' + cls + '">' +

            // Kopfzeile
            '<div class="sig-inv-head">' +
            '<span class="icon">&#9889;</span>' +
            '<span class="title">' + title + '</span>' +
            '<span class="sig-inv-badge standby" id="si_badge_' + w + '">–</span>' +
            '<button class="sig-inv-startstop" id="si_ss_btn_' + w + '">Start</button>' +
            '</div>' +

            // Tab-Leiste
            '<div class="sig-inv-tabs">' +
            '<div class="sig-inv-tab active" data-tab="power"  id="si_t0_' + w + '">Leistung</div>' +
            '<div class="sig-inv-tab"        data-tab="bat"    id="si_t1_' + w + '">Batterie</div>' +
            '<div class="sig-inv-tab"        data-tab="grid"   id="si_t2_' + w + '">Netz</div>' +
            '<div class="sig-inv-tab"        data-tab="alarms" id="si_t3_' + w + '">Alarme</div>' +
            '<div class="sig-inv-tab"        data-tab="info"   id="si_t4_' + w + '">Info</div>' +
            '</div>' +

            // ── Tab 0: Leistung ──────────────────────────────────────────────
            '<div class="sig-inv-panel active" id="si_p0_' + w + '">' +
            '<div class="sig-inv-row2">' +
            '<div class="sig-inv-box"><div class="sig-inv-box-lbl">Wirkleistung</div><div class="sig-inv-box-val" id="si_apwr_' + w + '" style="color:#3498db">-- kW</div></div>' +
            '<div class="sig-inv-box"><div class="sig-inv-box-lbl">PV-Leistung</div><div class="sig-inv-box-val" id="si_pv_' + w + '" style="color:#f39c12">-- kW</div></div>' +
            '</div>' +
            '<div class="sig-inv-box"><div class="sig-inv-box-lbl">Batterie Laden/Entladen</div><div class="sig-inv-box-val" id="si_esspwr_' + w + '" style="color:#9b59b6">-- kW</div><div class="sig-inv-box-sub" id="si_ess_dir_' + w + '"></div></div>' +
            '<div class="sig-inv-box">' +
            '<div class="sig-inv-box-lbl" style="margin-bottom:5px">Leistungsanteil EMS</div>' +
            '<div style="display:flex;align-items:center;gap:8px">' +
            '<input type="range" style="flex:1;accent-color:#3498db" min="-100" max="100" step="1" value="0" id="si_pct_sl_' + w + '">' +
            '<span class="sig-inv-ctrl-val" id="si_pct_lbl_' + w + '">–</span>' +
            '</div>' +
            '</div>' +
            '</div>' +

            // ── Tab 1: Batterie ───────────────────────────────────────────────
            '<div class="sig-inv-panel" id="si_p1_' + w + '">' +
            '<div class="sig-inv-row2">' +
            '<div class="sig-inv-box"><div class="sig-inv-box-lbl">SOC</div><div class="sig-inv-box-val" id="si_soc_' + w + '">--%</div></div>' +
            '<div class="sig-inv-box"><div class="sig-inv-box-lbl">SOH</div><div class="sig-inv-box-val" id="si_soh_' + w + '">--%</div></div>' +
            '</div>' +
            '<div class="sig-inv-box">' +
            '<div class="sig-inv-box-lbl" style="margin-bottom:5px">SOC-Verlauf</div>' +
            '<div class="sig-inv-soc-bar-bg"><div class="sig-inv-soc-bar-fill" id="si_soc_bar_' + w + '" style="width:0%;background:#27ae60"></div></div>' +
            '</div>' +
            '<div class="sig-inv-temp-grid">' +
            '<div class="sig-inv-box"><div class="sig-inv-box-lbl">&#127777; Ø Zelltemp.</div><div class="sig-inv-box-val" id="si_ct_' + w + '">-- °C</div></div>' +
            '<div class="sig-inv-box"><div class="sig-inv-box-lbl">Ø Zellspannung</div><div class="sig-inv-box-val" id="si_cv_' + w + '" style="color:#3498db">-- V</div></div>' +
            '<div class="sig-inv-box"><div class="sig-inv-box-lbl">&#127777; Max Temp.</div><div class="sig-inv-box-val" id="si_tmax_' + w + '">-- °C</div></div>' +
            '<div class="sig-inv-box"><div class="sig-inv-box-lbl">&#127777; Min Temp.</div><div class="sig-inv-box-val" id="si_tmin_' + w + '">-- °C</div></div>' +
            '</div>' +
            '</div>' +

            // ── Tab 2: Netz ───────────────────────────────────────────────────
            '<div class="sig-inv-panel" id="si_p2_' + w + '">' +
            '<div class="sig-inv-phase-row">' +
            '<div class="sig-inv-phase-box"><div class="sig-inv-phase-lbl">L1</div><div class="sig-inv-phase-val" id="si_uA_' + w + '">-- V</div></div>' +
            '<div class="sig-inv-phase-box"><div class="sig-inv-phase-lbl">L2</div><div class="sig-inv-phase-val" id="si_uB_' + w + '">-- V</div></div>' +
            '<div class="sig-inv-phase-box"><div class="sig-inv-phase-lbl">L3</div><div class="sig-inv-phase-val" id="si_uC_' + w + '">-- V</div></div>' +
            '</div>' +
            '<div class="sig-inv-row2">' +
            '<div class="sig-inv-box"><div class="sig-inv-box-lbl">Netzfrequenz</div><div class="sig-inv-box-val" id="si_freq_' + w + '" style="color:#3498db">-- Hz</div></div>' +
            '<div class="sig-inv-box"><div class="sig-inv-box-lbl">Leistungsfaktor</div><div class="sig-inv-box-val" id="si_pf_' + w + '" style="color:#3498db">--</div></div>' +
            '</div>' +
            '<div class="sig-inv-box"><div class="sig-inv-box-lbl">&#127777; PCS-Innentemperatur</div><div class="sig-inv-box-val" id="si_pcs_t_' + w + '">-- °C</div></div>' +
            '</div>' +

            // ── Tab 3: Alarme ──────────────────────────────────────────────────
            '<div class="sig-inv-panel" id="si_p3_' + w + '">' +
            '<div class="sig-inv-alm-row ok" id="si_alm1row_' + w + '"><span class="sig-inv-alm-lbl">Alarm 1 (PCS)</span><span class="sig-inv-alm-val ok" id="si_alm1_' + w + '">–</span></div>' +
            '<div class="sig-inv-alm-row ok" id="si_alm2row_' + w + '"><span class="sig-inv-alm-lbl">Alarm 2 (PCS)</span><span class="sig-inv-alm-val ok" id="si_alm2_' + w + '">–</span></div>' +
            '<div class="sig-inv-alm-row ok" id="si_alm3row_' + w + '"><span class="sig-inv-alm-lbl">Alarm 3 (ESS)</span><span class="sig-inv-alm-val ok" id="si_alm3_' + w + '">–</span></div>' +
            '<div class="sig-inv-alm-row ok" id="si_alm4row_' + w + '"><span class="sig-inv-alm-lbl">Alarm 4 (Gateway)</span><span class="sig-inv-alm-val ok" id="si_alm4_' + w + '">–</span></div>' +
            '<div class="sig-inv-alm-row ok" id="si_alm5row_' + w + '"><span class="sig-inv-alm-lbl">Alarm 5 (DC-Charger)</span><span class="sig-inv-alm-val ok" id="si_alm5_' + w + '">–</span></div>' +
            '</div>' +

            // ── Tab 4: Info ────────────────────────────────────────────────────
            '<div class="sig-inv-panel" id="si_p4_' + w + '">' +
            '<div class="sig-inv-info-row"><div class="sig-inv-info-lbl">Modell</div><div class="sig-inv-info-val" id="si_model_' + w + '">–</div></div>' +
            '<div class="sig-inv-info-row"><div class="sig-inv-info-lbl">Seriennummer</div><div class="sig-inv-info-val" id="si_serial_' + w + '">–</div></div>' +
            '<div class="sig-inv-info-row"><div class="sig-inv-info-lbl">Firmware</div><div class="sig-inv-info-val" id="si_fw_' + w + '">–</div></div>' +
            '<div class="sig-inv-ctrl-row">' +
            '<span class="sig-inv-ctrl-lbl">Remote EMS</span>' +
            '<button class="sig-inv-toggle off" id="si_ems_btn_' + w + '">Inaktiv</button>' +
            '</div>' +
            '</div>' +

            '</div></div>'
        );
        B._applyScale($div, 340);

        // ── Tab-Umschaltung ──────────────────────────────────────────────────
        var tabs   = ["si_t0_", "si_t1_", "si_t2_", "si_t3_", "si_t4_"];
        var panels = ["si_p0_", "si_p1_", "si_p2_", "si_p3_", "si_p4_"];

        tabs.forEach(function (tid, idx) {
            var tabEl = B._el(tid + w);
            if (!tabEl) return;
            tabEl.addEventListener("click", function () {
                tabs.forEach(function (t, i) {
                    var te = B._el(t + w);
                    var pe = B._el(panels[i] + w);
                    if (te) te.classList.toggle("active", i === idx);
                    if (pe) pe.classList.toggle("active", i === idx);
                });
            });
        });

        // ── Anzeige aktualisieren ────────────────────────────────────────────
        function update() {
            // Betriebsstatus
            var si = stateInfo(B._val(data, "oid_runState"));
            var badge = B._el("si_badge_" + w);
            if (badge) { badge.textContent = si.label; badge.className = "sig-inv-badge " + si.cls; }

            // Start/Stop-Button: 0=Stop, 1=Start (invertiert zu Charger!)
            var ssOid  = data.attr("oid_startStop");
            var ssVal  = ssOid ? parseInt(vis.states[ssOid + ".val"]) : null;
            var ssBtn  = B._el("si_ss_btn_" + w);
            if (ssBtn) {
                var isRunning = (ssVal === 1 || si.cls === "running");
                ssBtn.textContent = isRunning ? "Stop" : "Start";
                ssBtn.className   = "sig-inv-startstop " + (isRunning ? "running" : "stopped");
            }

            // Tab Leistung
            var ap  = parseFloat(B._val(data, "oid_activePower")) || 0;
            var pv  = parseFloat(B._val(data, "oid_pvPower"))     || 0;
            var ess = parseFloat(B._val(data, "oid_essPower"))    || 0;
            B._txt("si_apwr_"    + w, B._fmtKW(ap));
            B._txt("si_pv_"      + w, B._fmtKW(pv));
            B._txt("si_esspwr_"  + w, B._fmtKW(ess));
            B._txt("si_ess_dir_" + w, ess > 0.05 ? "▲ Laden" : ess < -0.05 ? "▼ Entladen" : "Bereit");
            B._css("si_esspwr_"  + w, "color", ess > 0.05 ? "#27ae60" : ess < -0.05 ? "#e74c3c" : "#9b59b6");

            // Leistungsanteil-Slider
            var pctOid = data.attr("oid_pwrPct");
            var pctVal = pctOid ? parseFloat(vis.states[pctOid + ".val"]) || 0 : 0;
            var pctSl  = B._el("si_pct_sl_" + w);
            if (pctSl && !pctSl._dragging) pctSl.value = Math.round(pctVal);
            B._txt("si_pct_lbl_" + w, pctOid ? Math.round(pctVal) + " %" : "–");

            // Tab Batterie
            var soc  = parseFloat(B._val(data, "oid_soc"))      || 0;
            var soh  = parseFloat(B._val(data, "oid_soh"))      || 0;
            var ct   = B._val(data, "oid_cellTemp");
            var cv   = parseFloat(B._val(data, "oid_cellVolt")) || 0;
            var tmax = B._val(data, "oid_maxTemp");
            var tmin = B._val(data, "oid_minTemp");
            var socCol = B._socCol(soc);
            B._txt("si_soc_"  + w, B._fmtPct(soc));  B._css("si_soc_" + w, "color", socCol);
            B._txt("si_soh_"  + w, B._fmtPct(soh));  B._css("si_soh_" + w, "color", soh > 80 ? "#27ae60" : "#f39c12");
            var bar = B._el("si_soc_bar_" + w);
            if (bar) { bar.style.width = Math.min(100, soc) + "%"; bar.style.background = socCol; }
            B._txt("si_ct_"   + w, ct   !== undefined ? parseFloat(ct).toFixed(1)   + " °C" : "-- °C");
            B._css("si_ct_"   + w, "color", ct !== undefined ? tempCol(ct) : "#e0e6ef");
            B._txt("si_cv_"   + w, cv   ? cv.toFixed(3) + " V"  : "-- V");
            B._txt("si_tmax_" + w, tmax !== undefined ? parseFloat(tmax).toFixed(1) + " °C" : "-- °C");
            B._css("si_tmax_" + w, "color", tmax !== undefined ? tempCol(tmax) : "#e0e6ef");
            B._txt("si_tmin_" + w, tmin !== undefined ? parseFloat(tmin).toFixed(1) + " °C" : "-- °C");

            // Tab Netz
            var uA   = parseFloat(B._val(data, "oid_uA"))   || 0;
            var uB   = parseFloat(B._val(data, "oid_uB"))   || 0;
            var uC   = parseFloat(B._val(data, "oid_uC"))   || 0;
            var freq = parseFloat(B._val(data, "oid_freq")) || 0;
            var pf   = parseFloat(B._val(data, "oid_pf"))   || 0;
            var pcsT = B._val(data, "oid_pcsTemp");
            B._txt("si_uA_"   + w, uA   ? uA.toFixed(1)   + " V"  : "-- V");
            B._txt("si_uB_"   + w, uB   ? uB.toFixed(1)   + " V"  : "-- V");
            B._txt("si_uC_"   + w, uC   ? uC.toFixed(1)   + " V"  : "-- V");
            B._txt("si_freq_" + w, freq ? freq.toFixed(2)  + " Hz" : "-- Hz");
            B._txt("si_pf_"   + w, pf   ? pf.toFixed(3)           : "--");
            B._txt("si_pcs_t_"+ w, pcsT !== undefined ? parseFloat(pcsT).toFixed(1) + " °C" : "-- °C");
            B._css("si_pcs_t_"+ w, "color", pcsT !== undefined ? tempCol(pcsT) : (dark ? "#e0e6ef" : "#2c3e50"));

            // Tab Alarme
            [1,2,3,4,5].forEach(function (i) {
                var ai  = almInfo(B._val(data, "oid_alm" + i));
                var row = B._el("si_alm" + i + "row_" + w);
                var val = B._el("si_alm" + i + "_"    + w);
                if (row) { row.className = "sig-inv-alm-row " + ai.cls; }
                if (val) { val.textContent = ai.text; val.className = "sig-inv-alm-val " + ai.valCls; }
            });

            // Tab Info
            B._txt("si_model_"  + w, B._val(data, "oid_model")  || "–");
            B._txt("si_serial_" + w, B._val(data, "oid_serial") || "–");
            B._txt("si_fw_"     + w, B._val(data, "oid_fw")     || "–");

            // EMS-Button
            var emsOid = data.attr("oid_emsEnable");
            var emsVal = emsOid ? parseInt(vis.states[emsOid + ".val"]) : null;
            var emsBtn = B._el("si_ems_btn_" + w);
            if (emsBtn) {
                var emsOn = (emsVal === 1);
                emsBtn.textContent = emsOn ? "Aktiv" : "Inaktiv";
                emsBtn.className   = "sig-inv-toggle " + (emsOn ? "on" : "off");
            }
        }

        // ── Steuer-Events ────────────────────────────────────────────────────
        // Start/Stop (0=Stop, 1=Start)
        var ssBtn = B._el("si_ss_btn_" + w);
        if (ssBtn) {
            ssBtn.addEventListener("click", function () {
                var oid = data.attr("oid_startStop");
                if (!oid) return;
                var cur = parseInt(vis.states[oid + ".val"]);
                vis.setValue(oid, cur === 1 ? 0 : 1);
            });
        }

        // EMS-Toggle
        var emsBtn = B._el("si_ems_btn_" + w);
        if (emsBtn) {
            emsBtn.addEventListener("click", function () {
                var oid = data.attr("oid_emsEnable");
                if (!oid) return;
                var cur = parseInt(vis.states[oid + ".val"]);
                vis.setValue(oid, cur === 1 ? 0 : 1);
            });
        }

        // Leistungsanteil-Slider
        var pctSl  = B._el("si_pct_sl_" + w);
        var pctLbl = B._el("si_pct_lbl_" + w);
        if (pctSl && pctLbl) {
            pctSl.addEventListener("input", function () {
                pctLbl.textContent = pctSl.value + " %";
            });
            pctSl.addEventListener("mousedown",  function () { pctSl._dragging = true;  });
            pctSl.addEventListener("touchstart", function () { pctSl._dragging = true;  });
            pctSl.addEventListener("mouseup",    function () {
                pctSl._dragging = false;
                var oid = data.attr("oid_pwrPct");
                if (oid) vis.setValue(oid, parseFloat(pctSl.value));
            });
            pctSl.addEventListener("touchend",   function () {
                pctSl._dragging = false;
                var oid = data.attr("oid_pwrPct");
                if (oid) vis.setValue(oid, parseFloat(pctSl.value));
            });
        }

        B._subscribe(widgetID, data,
            ["oid_activePower","oid_pvPower","oid_essPower","oid_runState",
             "oid_soc","oid_soh","oid_cellTemp","oid_cellVolt","oid_maxTemp","oid_minTemp",
             "oid_uA","oid_uB","oid_uC","oid_freq","oid_pf","oid_pcsTemp",
             "oid_alm1","oid_alm2","oid_alm3","oid_alm4","oid_alm5",
             "oid_fw","oid_model","oid_serial",
             "oid_startStop","oid_emsEnable","oid_pwrPct"],
            update);
        update();
    },



    // ── Widget 8: SigenMicro Übersicht ──────────────────────────────────────
    //
    // VIS-2-konforme Implementierung mit Anker-OID-Muster:
    //   oid_micro1 … oid_micro20  (Typ /id, Namensgebung beginnt mit "oid_")
    //   → VIS lädt diese States beim Start vor und subscribed automatisch
    //   → Widget extrahiert den Geräte-Präfix und baut alle 15 Register-Pfade
    //
    // Layout-Schwellen:
    //   1–5  Geräte: 1 Zeile, 80×90 px
    //   6–10 Geräte: 1 Zeile, 52×60 px
    //  11–15 Geräte: 2 Zeilen, 46×52 px
    //  16–20 Geräte: 2 Zeilen, 40×46 px
    //
    // Register-Reihenfolge (01–15, aufsteigend nach Adresse):
    //   01 modelType  02 serialNumber  03 firmwareVersion  04 runningState
    //   05 outputPower  06 gridFrequency  07 temperature
    //   08 mppt1Voltage  09 mppt1Current  10 mppt1Power
    //   11 mppt2Voltage  12 mppt2Current  13 mppt2Power
    //   14 dailyYield  15 totalYield

    _SM_REGISTERS: [
        { nr:"01", name:"modelType",      desc:"Modell-Typ",      unit:"",    col:"" },
        { nr:"02", name:"serialNumber",   desc:"Seriennummer",    unit:"",    col:"" },
        { nr:"03", name:"firmwareVersion",desc:"Firmware",        unit:"",    col:"" },
        { nr:"04", name:"runningState",   desc:"Betriebsstatus",  unit:"",    col:"state" },
        { nr:"05", name:"outputPower",    desc:"AC-Leistung",     unit:"kW",  col:"power" },
        { nr:"06", name:"gridFrequency",  desc:"Netzfrequenz",    unit:"Hz",  col:"blue" },
        { nr:"07", name:"temperature",    desc:"Temperatur",      unit:"°C",  col:"temp" },
        { nr:"08", name:"mppt1Voltage",   desc:"MPPT1 Spannung",  unit:"V",   col:"" },
        { nr:"09", name:"mppt1Current",   desc:"MPPT1 Strom",     unit:"A",   col:"" },
        { nr:"10", name:"mppt1Power",     desc:"MPPT1 Leistung",  unit:"kW",  col:"power" },
        { nr:"11", name:"mppt2Voltage",   desc:"MPPT2 Spannung",  unit:"V",   col:"" },
        { nr:"12", name:"mppt2Current",   desc:"MPPT2 Strom",     unit:"A",   col:"" },
        { nr:"13", name:"mppt2Power",     desc:"MPPT2 Leistung",  unit:"kW",  col:"power" },
        { nr:"14", name:"dailyYield",     desc:"Tagesertrag",     unit:"kWh", col:"energy" },
        { nr:"15", name:"totalYield",     desc:"Gesamtertrag",    unit:"kWh", col:"blue" }
    ],

    _SM_LAYOUTS: [
        { max:5,  rows:1, imgW:80, imgH:90 },
        { max:10, rows:1, imgW:52, imgH:60 },
        { max:15, rows:2, imgW:46, imgH:52 },
        { max:20, rows:2, imgW:40, imgH:46 }
    ],

    _smLayout: function(n) {
        var L = vis.binds["vis-2-widgets-sigenergy"]._SM_LAYOUTS;
        for (var i = 0; i < L.length; i++) { if (n <= L[i].max) return L[i]; }
        return L[L.length - 1];
    },

    _smStateInfo: function(state) {
        var s = parseInt(state);
        if (s === 1) return { label:"Running",  cls:"run",  badge:"sig-sm-badge-run",  col:"#2ecc8a" };
        if (s === 2) return { label:"Fault",    cls:"err",  badge:"sig-sm-badge-err",  col:"#e05555" };
        if (s === 3) return { label:"Shutdown", cls:"idle", badge:"sig-sm-badge-idle", col:"#5a7a90" };
        return              { label:"Standby",  cls:"idle", badge:"sig-sm-badge-idle", col:"#5a7a90" };
    },

    _smValCol: function(col, val, dark) {
        var tc = dark ? "#d8e4f0" : "#2c3e50";
        if (col === "power")  return "#2ecc8a";
        if (col === "energy") return "#e8a22a";
        if (col === "blue")   return "#4a9eed";
        if (col === "temp") {
            var t = parseFloat(val);
            return t > 70 ? "#e05555" : t > 50 ? "#e8a22a" : tc;
        }
        return tc;
    },

    _smFmtVal: function(reg, raw) {
        if (raw === undefined || raw === null) return "--";
        if (reg.unit === "" || reg.name === "runningState" ||
            reg.name === "modelType" || reg.name === "serialNumber" ||
            reg.name === "firmwareVersion") return String(raw);
        var n = parseFloat(raw);
        if (isNaN(n)) return "--";
        if (reg.unit === "kW" || reg.unit === "kWh") return n.toFixed(2);
        if (reg.unit === "V") return n.toFixed(1);
        if (reg.unit === "A") return n.toFixed(2);
        if (reg.unit === "Hz") return n.toFixed(2);
        if (reg.unit === "°C") return n.toFixed(1);
        return String(raw);
    },

    // ── SVG Device Icon (inline, kein externes Bild nötig für den SVG-Canvas) ──
    _smDevIcon: function(state, w, h) {
        var si = vis.binds["vis-2-widgets-sigenergy"]._smStateInfo(state);
        var c  = si.col;
        var bg = state === 1 ? "#1a3028" : "#1a2230";
        var rx = Math.max(3, w * 0.11);
        return "<svg viewBox=\"0 0 " + w + " " + h + "\" xmlns=\"http://www.w3.org/2000/svg\"" +
            " style=\"width:" + w + "px;height:" + h + "px;display:block\">" +
            "<rect x=\"1.5\" y=\"1.5\" width=\"" + (w-3) + "\" height=\"" + (h-3) + "\"" +
            " rx=\"" + rx + "\" fill=\"" + bg + "\" stroke=\"" + c + "\" stroke-width=\"1.5\"/>" +
            "<rect x=\"" + (w*.14) + "\" y=\"" + (h*.1) + "\" width=\"" + (w*.72) + "\" height=\"" + (h*.07) + "\"" +
            " rx=\"2\" fill=\"" + c + "\" opacity=\".28\"/>" +
            "<rect x=\"" + (w*.14) + "\" y=\"" + (h*.21) + "\" width=\"" + (w*.72) + "\" height=\"" + (h*.33) + "\"" +
            " rx=\"2.5\" fill=\"rgba(255,255,255,.04)\" stroke=\"" + c + "\" stroke-width=\".7\" opacity=\".45\"/>" +
            "<rect x=\"" + (w*.21) + "\" y=\"" + (h*.26) + "\" width=\"" + (w*.28) + "\" height=\"" + (h*.055) + "\"" +
            " rx=\"1\" fill=\"" + c + "\" opacity=\".5\"/>" +
            "<rect x=\"" + (w*.21) + "\" y=\"" + (h*.33) + "\" width=\"" + (w*.46) + "\" height=\"" + (h*.055) + "\"" +
            " rx=\"1\" fill=\"" + c + "\" opacity=\".35\"/>" +
            "<rect x=\"" + (w*.21) + "\" y=\"" + (h*.40) + "\" width=\"" + (w*.36) + "\" height=\"" + (h*.055) + "\"" +
            " rx=\"1\" fill=\"" + c + "\" opacity=\".22\"/>" +
            "<rect x=\"" + (w*.14) + "\" y=\"" + (h*.65) + "\" width=\"" + (w*.72) + "\" height=\"" + (h*.1) + "\"" +
            " rx=\"2\" fill=\"rgba(255,255,255,.04)\" stroke=\"" + c + "\" stroke-width=\".6\" opacity=\".38\"/>" +
            "<circle cx=\"" + (w*.3) + "\" cy=\"" + (h*.7) + "\" r=\"" + Math.max(1.5, w*.036) + "\"" +
            " fill=\"" + (state===1 ? c : "rgba(255,255,255,.1)") + "\"/>" +
            "<circle cx=\"" + (w*.5) + "\" cy=\"" + (h*.7) + "\" r=\"" + Math.max(1.5, w*.036) + "\"" +
            " fill=\"" + (state===1 ? c : "rgba(255,255,255,.1)") + "\"/>" +
            "<circle cx=\"" + (w*.7) + "\" cy=\"" + (h*.7) + "\" r=\"" + Math.max(1.5, w*.036) + "\"" +
            " fill=\"" + (state===1 ? c : "rgba(255,255,255,.1)") + "\"/>" +
            "<rect x=\"" + (w*.34) + "\" y=\"" + (h*.82) + "\" width=\"" + (w*.32) + "\" height=\"" + (h*.065) + "\"" +
            " rx=\"1.5\" fill=\"" + c + "\" opacity=\".42\"/>" +
            "</svg>";
    },

    // ── Bus-Zeile als SVG ──────────────────────────────────────────────────
    _smBusRow: function(devSlice, startNr, VW, imgW, imgH, rowIdx) {
        var B = vis.binds["vis-2-widgets-sigenergy"];
        var n    = devSlice.length;
        if (n === 0) return "";
        var spc  = VW / n;
        var cx   = [];
        for (var i = 0; i < n; i++) { cx.push(Math.round(spc * i + spc / 2)); }
        var imgTop = 6;
        var imgBot = imgTop + imgH;
        var stubH  = Math.max(14, Math.round(imgH * 0.28));
        var busY   = imgBot + stubH;
        var svgH   = busY + 12;
        var anyActive = devSlice.some(function(d) { return d.state === 1; });
        var delay = rowIdx * 0.35;

        var s = "<svg viewBox=\"0 0 " + VW + " " + svgH + "\" xmlns=\"http://www.w3.org/2000/svg\"" +
                " class=\"sig-sm-net-svg\">";

        // Backbone Basis
        s += "<line x1=\"18\" y1=\"" + busY + "\" x2=\"" + (VW-18) + "\" y2=\"" + busY + "\"" +
             " class=\"sig-sm-bus-base\"/>";

        if (anyActive) {
            s += "<line x1=\"18\" y1=\"" + busY + "\" x2=\"" + (VW-18) + "\" y2=\"" + busY + "\"" +
                 " class=\"sig-sm-bus-glow\"/>";
            s += "<line x1=\"18\" y1=\"" + busY + "\" x2=\"" + (VW-18) + "\" y2=\"" + busY + "\"" +
                 " class=\"sig-sm-bus-anim\" style=\"animation-delay:" + delay + "s\"/>";
        }

        for (var i = 0; i < n; i++) {
            var d    = devSlice[i];
            var x    = cx[i];
            var si   = B._smStateInfo(d.state);
            var active = (d.state === 1);
            var iDelay = ((i + rowIdx * n) * 0.18) + "s";

            // Stichleitung Basis
            s += "<line x1=\"" + x + "\" y1=\"" + busY + "\" x2=\"" + x + "\" y2=\"" + imgBot + "\"" +
                 " class=\"sig-sm-stub-base\" stroke=\"" + (active ? "#1e3f28" : "#1e2d3a") + "\"/>";

            if (active) {
                s += "<line x1=\"" + x + "\" y1=\"" + busY + "\" x2=\"" + x + "\" y2=\"" + imgBot + "\"" +
                     " class=\"sig-sm-stub-glow\"/>";
                s += "<line x1=\"" + x + "\" y1=\"" + busY + "\" x2=\"" + x + "\" y2=\"" + imgBot + "\"" +
                     " class=\"sig-sm-stub-anim\" style=\"animation-delay:" + iDelay + "\"/>";
            }

            // T-Kreuzungspunkt
            var tR = Math.max(3.5, imgW * 0.06);
            s += "<circle cx=\"" + x + "\" cy=\"" + busY + "\" r=\"" + tR + "\"" +
                 " fill=\"" + (active ? "#2ecc8a" : "#1e2d3a") + "\"" +
                 " stroke=\"" + si.col + "\" stroke-width=\"1.5\" opacity=\"" + (active ? 1 : 0.5) + "\"/>";

            // Gerätebild via foreignObject
            var glow = active ? "drop-shadow(0 0 6px rgba(46,204,138,.4))" : "none";
            var brd  = "2px solid " + si.col;
            s += "<foreignObject x=\"" + (x - imgW/2) + "\" y=\"" + imgTop + "\"" +
                 " width=\"" + imgW + "\" height=\"" + imgH + "\">" +
                 "<div xmlns=\"http://www.w3.org/1999/xhtml\"" +
                 " style=\"width:" + imgW + "px;height:" + imgH + "px;" +
                 "border-radius:" + Math.max(4, imgW*.1) + "px;" +
                 "overflow:hidden;border:" + brd + ";" +
                 "filter:" + glow + "\">" +
                 "<img src=\"widgets/vis-2-widgets-sigenergy/img/SigenMicroInverter.png\"" +
                 " style=\"width:100%;height:100%;object-fit:contain;display:block\"/>" +
                 "</div></foreignObject>";

            // Gerätenummer-Label
            var nr  = String(startNr + i).padStart(2, "0");
            var fs  = Math.max(7, imgW * 0.1);
            s += "<text x=\"" + x + "\" y=\"" + (busY + 11) + "\" text-anchor=\"middle\"" +
                 " font-family=\"monospace\" font-size=\"" + fs + "\"" +
                 " fill=\"" + si.col + "\" opacity=\"" + (active ? 1 : 0.5) + "\">" + nr + "</text>";
        }

        s += "</svg>";
        return s;
    },

    // ── Übersicht-Tab (Tab 1) ─────────────────────────────────────────────
    _smBuildOverview: function(w, devices, dark) {
        var B   = vis.binds["vis-2-widgets-sigenergy"];
        var VW  = 620;
        var lay = B._smLayout(devices.length);
        var perRow = Math.ceil(devices.length / lay.rows);
        var svgHTML = "";

        for (var r = 0; r < lay.rows; r++) {
            var slice = devices.slice(r * perRow, (r + 1) * perRow);
            if (slice.length === 0) continue;
            // Geräte mit aktuellem State anreichern
            var sliceWithState = slice.map(function(d) {
                var stateVal = vis.states[d.prefix + ".runningState.val"];
                return { state: (stateVal !== undefined ? parseInt(stateVal) : 0) };
            });
            svgHTML += B._smBusRow(sliceWithState, r * perRow + 1, VW, lay.imgW, lay.imgH, r);
        }

        // Labels-Reihe
        var labelsHTML = "<div class=\"sig-sm-labels\">";
        for (var i = 0; i < Math.min(devices.length, lay.rows === 1 ? 20 : perRow); i++) {
            var d    = devices[i];
            var stV  = vis.states[d.prefix + ".runningState.val"];
            var si   = B._smStateInfo(stV);
            var pwrV = parseFloat(vis.states[d.prefix + ".outputPower.val"]);
            var nr   = String(i + 1).padStart(2, "0");
            labelsHTML +=
                "<div class=\"sig-sm-label\">" +
                "<div class=\"sig-sm-label-id\" style=\"color:" + si.col + "\">Gerät " + nr + "</div>" +
                (si.cls === "run" && !isNaN(pwrV) ?
                    "<div class=\"sig-sm-label-pwr\">" + pwrV.toFixed(2) + " kW</div>" : "") +
                "<div class=\"sig-sm-label-st\" style=\"color:" + si.col + "\">" +
                (si.cls === "run" ? "● " : si.cls === "err" ? "▲ " : "○ ") + si.label +
                "</div></div>";
        }
        if (lay.rows > 1 && devices.length > perRow) {
            labelsHTML += "</div><div class=\"sig-sm-labels\">";
            for (var i = perRow; i < devices.length; i++) {
                var d    = devices[i];
                var stV  = vis.states[d.prefix + ".runningState.val"];
                var si   = B._smStateInfo(stV);
                var pwrV = parseFloat(vis.states[d.prefix + ".outputPower.val"]);
                var nr   = String(i + 1).padStart(2, "0");
                labelsHTML +=
                    "<div class=\"sig-sm-label\">" +
                    "<div class=\"sig-sm-label-id\" style=\"color:" + si.col + "\">Gerät " + nr + "</div>" +
                    (si.cls === "run" && !isNaN(pwrV) ?
                        "<div class=\"sig-sm-label-pwr\">" + pwrV.toFixed(2) + " kW</div>" : "") +
                    "<div class=\"sig-sm-label-st\" style=\"color:" + si.col + "\">" +
                    (si.cls === "run" ? "● " : si.cls === "err" ? "▲ " : "○ ") + si.label +
                    "</div></div>";
            }
        }
        labelsHTML += "</div>";

        // Aggregat-Kacheln
        var totalP = 0, totalDay = 0, totalLife = 0, running = 0;
        devices.forEach(function(d) {
            var pwr  = parseFloat(vis.states[d.prefix + ".outputPower.val"])  || 0;
            var day  = parseFloat(vis.states[d.prefix + ".dailyYield.val"])   || 0;
            var life = parseFloat(vis.states[d.prefix + ".totalYield.val"])   || 0;
            var st   = parseInt(vis.states[d.prefix + ".runningState.val"]);
            totalP    += pwr;
            totalDay  += day;
            totalLife += life;
            if (st === 1) running++;
        });
        var runCol = running === devices.length ? "#2ecc8a" : running > 0 ? "#e8a22a" : "#e05555";

        var kacheln =
            "<div class=\"sig-sm-kacheln\">" +
            "<div class=\"sig-sm-kach\">" +
                "<div class=\"sig-sm-kach-lbl\">AC-Leistung</div>" +
                "<div class=\"sig-sm-kach-val\" style=\"color:#2ecc8a\">" + totalP.toFixed(2) +
                "<span class=\"sig-sm-kach-unit\">kW</span></div>" +
                "<div class=\"sig-sm-kach-sub\">Gesamt aktiv</div></div>" +
            "<div class=\"sig-sm-kach\">" +
                "<div class=\"sig-sm-kach-lbl\">Heute</div>" +
                "<div class=\"sig-sm-kach-val\" style=\"color:#e8a22a\">" + totalDay.toFixed(2) +
                "<span class=\"sig-sm-kach-unit\">kWh</span></div>" +
                "<div class=\"sig-sm-kach-sub\">Tagesertrag</div></div>" +
            "<div class=\"sig-sm-kach\">" +
                "<div class=\"sig-sm-kach-lbl\">Gesamt</div>" +
                "<div class=\"sig-sm-kach-val\" style=\"color:#4a9eed\">" + totalLife.toFixed(1) +
                "<span class=\"sig-sm-kach-unit\">kWh</span></div>" +
                "<div class=\"sig-sm-kach-sub\">Lebensertrag</div></div>" +
            "<div class=\"sig-sm-kach\">" +
                "<div class=\"sig-sm-kach-lbl\">Online</div>" +
                "<div class=\"sig-sm-kach-val\" style=\"color:" + runCol + "\">" + running +
                "<span class=\"sig-sm-kach-unit\">/" + devices.length + "</span></div>" +
                "<div class=\"sig-sm-kach-sub\">Running</div></div>" +
            "</div>";

        return svgHTML + labelsHTML + kacheln;
    },

    // ── Detail-Tab (Tabs 2+) ──────────────────────────────────────────────
    _smBuildDetail: function(d, nr, dark) {
        var B    = vis.binds["vis-2-widgets-sigenergy"];
        var REGS = B._SM_REGISTERS;
        var stV  = vis.states[d.prefix + ".runningState.val"];
        var si   = B._smStateInfo(stV);
        var tc   = dark ? "#d8e4f0" : "#2c3e50";

        var modelVal  = vis.states[d.prefix + ".modelType.val"]       || "–";
        var serialVal = vis.states[d.prefix + ".serialNumber.val"]    || "–";
        var fwVal     = vis.states[d.prefix + ".firmwareVersion.val"] || "–";

        var header =
            "<div class=\"sig-sm-det-hdr\">" +
            "<div class=\"sig-sm-det-img " + si.cls + "\">" +
            "<img src=\"widgets/vis-2-widgets-sigenergy/img/SigenMicroInverter.png\"" +
            " style=\"width:100%;height:100%;object-fit:contain\"/></div>" +
            "<div class=\"sig-sm-det-info\">" +
            "<div class=\"sig-sm-det-model\" style=\"color:" + tc + "\">Gerät " +
            String(nr).padStart(2,"0") + " — " + modelVal + "</div>" +
            "<div class=\"sig-sm-det-serial\">SN: " + serialVal + "</div>" +
            "<div class=\"sig-sm-det-fw\">FW: " + fwVal + " · Slave-ID: " + d.slaveId + "</div>" +
            "<div class=\"det-badge " + si.badge + "\">" +
            "<span class=\"sig-sm-badge-dot\"></span>" + si.label + "</div>" +
            "</div></div>";

        var regCards = "";
        for (var i = 0; i < REGS.length; i++) {
            var reg = REGS[i];
            var raw = vis.states[d.prefix + "." + reg.name + ".val"];
            var fmtVal = B._smFmtVal(reg, raw);
            var col    = reg.col === "state" ? si.col : B._smValCol(reg.col, raw, dark);
            var isStr  = (reg.unit === "" && reg.col === "");
            regCards +=
                "<div class=\"sig-sm-reg-card\">" +
                "<div class=\"sig-sm-reg-nr\">" + reg.nr + "</div>" +
                "<div class=\"sig-sm-reg-lbl\">" + reg.desc + "</div>" +
                "<div class=\"sig-sm-reg-val\" style=\"color:" + (isStr ? tc : col) + ";font-size:" +
                    (isStr ? "0.72rem" : "1rem") + "\">" +
                    fmtVal +
                    (reg.unit ? "<span class=\"sig-sm-reg-unit\">" + reg.unit + "</span>" : "") +
                "</div>" +
                "<div class=\"sig-sm-reg-oid\">" + d.prefix + "." + reg.name + "</div>" +
                "</div>";
        }

        return header + "<div class=\"sig-sm-reg-grid\">" + regCards + "</div>";
    },

    // ── Haupt-Render (Update) ─────────────────────────────────────────────
    _smRender: function(w, devices, dark, activeTab) {
        var B = vis.binds["vis-2-widgets-sigenergy"];

        // Tab 1: Übersicht
        var ov = B._el("sm_ov_" + w);
        if (ov) ov.innerHTML = B._smBuildOverview(w, devices, dark);

        // Tabs 2+: Detail
        devices.forEach(function(d, i) {
            var det = B._el("sm_det_" + w + "_" + (i+1));
            if (det) det.innerHTML = B._smBuildDetail(d, i+1, dark);
        });
    },

    // ── Initialisierung ───────────────────────────────────────────────────
    createSigenMicroOverview: function(widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-sigenergy"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function() {
                B.createSigenMicroOverview(widgetID, view, data, style);
            }, 100);
        }

        var count = Math.min(Math.max(1, parseInt(data.attr("micro_count")) || 3), 20);
        var dark  = B._isDark(data);
        var title = data.attr("sig_title") || "SigenMicro";
        var w     = widgetID;
        var cls   = dark ? "sig-sm-wrap" : "sig-sm-wrap light";

        // Geräte-Daten aus Anker-OIDs extrahieren
        var devices = [];
        for (var i = 1; i <= count; i++) {
            var anchorOid = data.attr("oid_micro" + i);
            if (!anchorOid) continue;
            // "sigenergy.0.sigenmicro.11.outputPower" → prefix = "sigenergy.0.sigenmicro.11"
            var parts = anchorOid.split(".");
            parts.pop();
            var prefix  = parts.join(".");
            var slaveId = parts[parts.length - 1];
            devices.push({ anchorOid: anchorOid, prefix: prefix, slaveId: slaveId });
        }

        // ── Tab-Bar aufbauen ──
        var tabBarHTML = "<div class=\"sig-sm-tabbar\" id=\"sm_tabs_" + w + "\">";
        tabBarHTML += "<div class=\"sig-sm-tab active\" data-tab=\"0\">Übersicht</div>";
        for (var i = 0; i < devices.length; i++) {
            tabBarHTML += "<div class=\"sig-sm-tab\" data-tab=\"" + (i+1) + "\">Gerät " +
                String(i+1).padStart(2,"0") + "</div>";
        }
        tabBarHTML += "</div>";

        // ── Panel-Container aufbauen ──
        var panelsHTML = "<div id=\"sm_ov_" + w + "\" class=\"sig-sm-panel active\"></div>";
        for (var i = 0; i < devices.length; i++) {
            panelsHTML += "<div id=\"sm_det_" + w + "_" + (i+1) + "\" class=\"sig-sm-panel\"></div>";
        }

        // ── Widget HTML zusammensetzen ──
        $div.html(
            "<div class=\"sig-w\"><div class=\"" + cls + "\">" +
            "<div class=\"sig-sm-title\">&#9889; " + title + "</div>" +
            tabBarHTML +
            panelsHTML +
            "</div></div>"
        );
        B._applyScale($div, 380);

        // ── Tab-Klick-Handler ──
        var $tabBar = $("#sm_tabs_" + w);
        $tabBar.on("click", ".sig-sm-tab", function() {
            var idx = parseInt($(this).data("tab"));
            $tabBar.find(".sig-sm-tab").removeClass("active");
            $(this).addClass("active");
            var $panels = $div.find(".sig-sm-panel");
            $panels.removeClass("active");
            $panels.eq(idx).addClass("active");
        });

        // ── State-Subscription ──────────────────────────────────────────
        // Die Anker-OIDs (oid_micro1..N) sind /id-Felder → VIS lädt sie vor.
        // Alle weiteren Register-OIDs werden manuell subscribed.
        var REGS = B._SM_REGISTERS;
        var bound = [];

        function doUpdate() { B._smRender(w, devices, dark, 0); }

        devices.forEach(function(d) {
            REGS.forEach(function(reg) {
                var key = d.prefix + "." + reg.name + ".val";
                bound.push(key);
                vis.states.bind(key, doUpdate);
            });
        });

        $div.data("bound", bound);
        $div.data("bindHandler", doUpdate);

        // Initiales Rendering
        doUpdate();
    }


,

    // ── Widget 9: PV Power ─────────────────────────────────────────────────
    createPvStrings: function (widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-sigenergy"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function () { B.createPvStrings(widgetID, view, data, style); }, 100);
        }

        var dark  = B._isDark(data);
        var title = data.attr("sig_title") || "PV Power";
        /* Frei wählbare String-Namen; Standard: "String 1/2/3" */
        var name1 = data.attr("sig_name1") || "String 1";
        var name2 = data.attr("sig_name2") || "String 2";
        var name3 = data.attr("sig_name3") || "String 3";
        var w     = widgetID;
        /* Einheitlicher Widget-Hintergrund (Vorlage: PV-Power / .sig-pow-wrap) */
        var bg       = dark ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" : "#fff";
        var bgBorder = dark ? "none" : "1px solid #e8eef5";
        var txtCol = dark ? "#e0e6ef" : "#2c3e50";
        var subCol = dark ? "#5a7898" : "#6a8aaa";
        var pvCol  = "#f39c12";
        var markId = "mPvStr_" + w;
        var sw = 130, sh = 65, hw = 220, hh = 96;

        /* SVG mit 3 Pfeil-Markern (orange/gelb/grün) für dynamische Farbe */
        var svgArrows =
            '<svg id="sig_pvs_svg_' + w + '" viewBox="0 0 388 70" preserveAspectRatio="none" ' +
            'style="position:absolute;top:0;left:0;width:100%;height:70px;pointer-events:none;overflow:visible;">' +
            '<defs>' +
            '<marker id="' + markId + '_o" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">' +
            '<polygon points="0,0 6,3 0,6" fill="#f39c12"/></marker>' +
            '<marker id="' + markId + '_y" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">' +
            '<polygon points="0,0 6,3 0,6" fill="#f1c40f"/></marker>' +
            '<marker id="' + markId + '_g" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">' +
            '<polygon points="0,0 6,3 0,6" fill="#27ae60"/></marker>' +
            '</defs>' +
            '<path id="sig_pvs_path_pv1_' + w + '" class="sig-flow-path" stroke="' + pvCol + '" d="M55,0 Q55,45 194,65" marker-end="url(#' + markId + '_o)"/>' +
            '<path id="sig_pvs_path_pv2_' + w + '" class="sig-flow-path" stroke="' + pvCol + '" d="M194,0 L194,65" marker-end="url(#' + markId + '_o)"/>' +
            '<path id="sig_pvs_path_pv3_' + w + '" class="sig-flow-path" stroke="' + pvCol + '" d="M333,0 Q333,45 194,65" marker-end="url(#' + markId + '_o)"/>' +
            '</svg>';

        $div.html(
            '<div class="sig-w"><div id="sig_pvs_inner_' + w + '" style="' +
            'background:' + bg + ';border:' + bgBorder + ';border-radius:14px;padding:16px 14px 14px;' +
            'box-sizing:border-box;font-family:sans-serif;color:' + txtCol + ';width:100%;"></div></div>'
        );

        /* Baustein für eine PV-String-Spalte: Bild + mittiges Label mit Wert + Name darunter.
           Das Label sitzt absolut positioniert mittig AUF dem Bild.
           Der eigentliche Text liegt in einem inneren Span mit sig-text-Klasse,
           damit die Kompensations-Transform nicht das translate(-50%,-50%) überschreibt. */
        function stringCol(nr, nameStr) {
            return '<div style="position:relative;width:' + sw + 'px;text-align:center;">' +
                '<img src="widgets/vis-2-widgets-sigenergy/img/solarpanel.png" style="width:' + sw + 'px;height:' + sh + 'px;display:block;object-fit:contain;">' +
                '<div ' +
                'style="position:absolute;top:30%;left:50%;transform:translate(-50%,-50%);' +
                'background:rgba(0,0,0,.65);border-radius:5px;padding:3px 8px;' +
                'white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.3);">' +
                '<span class="sig-text" id="sig_pvs_val' + nr + '_' + w + '" ' +
                'style="font-size:13px;font-weight:600;color:' + pvCol + ';">-- W</span>' +
                '</div>' +
                '<div style="margin-top:4px;"><span class="sig-text" ' +
                'style="font-size:10px;color:' + subCol + ';">' + nameStr + '</span></div>' +
                '</div>';
        }

        var pvInner = document.getElementById("sig_pvs_inner_" + w);
        if (pvInner) {
            pvInner.innerHTML =
                '<div style="text-align:center;margin-bottom:12px;"><span class="sig-text" ' +
                'style="font-size:.9rem;font-weight:600;color:' + txtCol + ';">&#9728; ' + title + '</span></div>' +
                '<div style="display:flex;justify-content:space-around;align-items:flex-end;">' +
                stringCol(1, name1) + stringCol(2, name2) + stringCol(3, name3) +
                '</div>' +
                '<div style="position:relative;height:70px;width:100%;">' + svgArrows + '</div>' +
                '<div style="text-align:center;">' +
                '<img src="widgets/vis-2-widgets-sigenergy/img/Sigen_Hybrid_Vorderansicht.png" style="width:' + hw + 'px;height:' + hh + 'px;display:inline-block;object-fit:contain;">' +
                '</div>' +
                '<div style="text-align:center;margin-top:8px;">' +
                '<div style="display:inline-block;background:rgba(243,156,18,.1);border:1px solid rgba(243,156,18,.35);border-radius:8px;padding:4px 18px;">' +
                '<div><span class="sig-text" style="font-size:10px;color:' + subCol + ';letter-spacing:.5px;">Gesamt PV</span></div>' +
                '<div><span class="sig-text" id="sig_pvs_total_' + w + '" style="font-size:18px;font-weight:600;color:' + pvCol + ';line-height:1.25;">-- W</span></div>' +
                '</div></div>';
        }
        B._applyScale($div, 400);

        /* Farbschwellen für Pfeile (Wert in kW):
             < 0.1 kW  → inaktiv (Standard, grau)
             0.1 – 1   → orange (#f39c12)
             1   – 2   → gelb   (#f1c40f)
             > 2       → grün   (#27ae60)                                      */
        function arrowColor(kW) {
            if (kW < 0.1) return null;
            if (kW < 1)   return { col: "#f39c12", mark: "_o" };
            if (kW < 2)   return { col: "#f1c40f", mark: "_y" };
            return              { col: "#27ae60", mark: "_g" };
        }

        function update() {
            var pv1   = parseFloat(B._val(data, "oid_pv1"))     || 0;
            var pv2   = parseFloat(B._val(data, "oid_pv2"))     || 0;
            var pv3   = parseFloat(B._val(data, "oid_pv3"))     || 0;
            var total = parseFloat(B._val(data, "oid_pvtotal")) || 0;
            B._txt("sig_pvs_val1_"  + w, B._fmtKW(pv1));
            B._txt("sig_pvs_val2_"  + w, B._fmtKW(pv2));
            B._txt("sig_pvs_val3_"  + w, B._fmtKW(pv3));
            B._txt("sig_pvs_total_" + w, B._fmtKW(total));

            var vals = [pv1, pv2, pv3];
            /* Wertfeld-Schriftfarbe: grau bei ≤0.1 kW, Standard-Orange bei Werten */
            var grayCol = "#7a8a9a";
            [1, 2, 3].forEach(function(n, i) {
                var valEl = B._el("sig_pvs_val" + n + "_" + w);
                if (valEl) {
                    valEl.style.color = vals[i] > 0.1 ? pvCol : grayCol;
                }
            });

            ["pv1", "pv2", "pv3"].forEach(function(k, i) {
                var el = B._el("sig_pvs_path_" + k + "_" + w);
                if (!el) return;
                var c = arrowColor(vals[i]);
                if (c) {
                    el.classList.add("active");
                    el.setAttribute("stroke", c.col);
                    el.setAttribute("marker-end", "url(#" + markId + c.mark + ")");
                } else {
                    el.classList.remove("active");
                    el.setAttribute("stroke", pvCol);
                    el.setAttribute("marker-end", "url(#" + markId + "_o)");
                }
            });
        }

        B._subscribe(widgetID, data, ["oid_pv1", "oid_pv2", "oid_pv3", "oid_pvtotal"], update);
        update();
    },

    // ── Widget 10: Fahrzeug-Ladestand (EV SOC) ──────────────────────────────
    //
    // Layout: SOC-Badge oben-rechts | Fahrzeugbild (Hauptblickpunkt) | Name | Balken
    //
    // Farb-Logik:  ≤15 % → #f87171  ≤35 % → #fbbf24  >35 % → #4ade80
    // oid_charging: optional — grün leuchtender Glow am Badge wenn truthy
    createEvSoc: function (widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-sigenergy"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function () { B.createEvSoc(widgetID, view, data, style); }, 100);
        }

        var dark   = B._isDark(data);
        var title  = data.attr("sig_title") || "Fahrzeug-Ladestand";
        var carImg = data.attr("sig_car_image") || "";
        var w      = widgetID;
        var cls    = "sig-ev-wrap" + (dark ? "" : " light");

        var imgHtml = carImg
            ? '<img class="sig-ev-car-img" src="' + carImg + '" alt="EV" />'
            : '<div class="sig-ev-no-img">&#128664;</div>';

        $div.html(
            '<div class="sig-w"><div class="' + cls + '">' +
            /* SOC-Badge oben-rechts */
            '<div id="sig-ev-badge_' + w + '" class="sig-ev-badge">' +
            '<span id="sig-ev-badge-icon_' + w + '" class="sig-ev-badge-icon sig-text">&#9889;</span>' +
            '<span id="sig-ev-badge-pct_' + w + '" class="sig-ev-badge-pct sig-text">--%</span>' +
            '<div id="sig-ev-badge-lbl_' + w + '" class="sig-ev-badge-lbl sig-text">LADESTAND</div>' +
            '</div>' +
            /* Fahrzeugbild — zentraler Blickpunkt */
            '<div class="sig-ev-img-area">' + imgHtml + '</div>' +
            /* Fahrzeugname */
            '<div class="sig-ev-car-name sig-text">' + title + '</div>' +
            /* Ladebalken */
            '<div class="sig-ev-bar-row">' +
            '<div class="sig-ev-bar-track">' +
            '<div id="sig-ev-bar_' + w + '" class="sig-ev-bar-fill"></div>' +
            '</div></div>' +
            '</div></div>'
        );

        B._applyScale($div, 380);

        function update() {
            var raw  = B._val(data, "oid_ev_soc");
            var soc  = parseFloat(raw);
            var chg  = B._val(data, "oid_charging");

            var fill  = isNaN(soc) ? 0 : Math.max(0, Math.min(100, soc));
            var pct   = isNaN(soc) ? "--%" : Math.round(soc) + "%";
            var color = fill <= 15 ? "#f87171" : fill <= 35 ? "#fbbf24" : "#4ade80";

            /* Badge: Prozent */
            var pctEl = document.getElementById("sig-ev-badge-pct_" + w);
            if (pctEl) pctEl.textContent = pct;

            /* Badge: Icon + Label in SOC-Farbe */
            var iconEl = document.getElementById("sig-ev-badge-icon_" + w);
            if (iconEl) iconEl.style.color = color;
            var lblEl = document.getElementById("sig-ev-badge-lbl_" + w);
            if (lblEl) lblEl.style.color = color;

            /* Ladebalken */
            var barEl = document.getElementById("sig-ev-bar_" + w);
            if (barEl) {
                barEl.style.width           = fill + "%";
                barEl.style.backgroundColor = color;
            }

            /* Lade-Glow am Badge */
            var badgeEl = document.getElementById("sig-ev-badge_" + w);
            if (badgeEl) {
                var isChg = chg === true || chg === 1 || chg === "1" || chg === "true";
                if (isChg) {
                    badgeEl.classList.add("ev-charging");
                } else {
                    badgeEl.classList.remove("ev-charging");
                }
            }
        }

        B._subscribe(widgetID, data, ["oid_ev_soc", "oid_charging"], update);
        update();
    }
};
vis.binds["vis-2-widgets-sigenergy"].showVersion();

