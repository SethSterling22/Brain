---
tags: [homelab, monitoring, power, prometheus]
---

# Power Monitoring

Part of [[Homelab MOC]]. Sits inside [[Monitoring Stack]]; this note focuses
specifically on watts/cost/battery.

## Two independent power signals

1. **Modelled power** (all nodes) — `P = P_idle + (P_max − P_idle) × CPU_util`,
   constants in `prometheus/rules/power-model.yml`, currently *documented
   estimates, not measurements* (expect ±20–40% error, worst on Aery, whose
   draw is disk-dominated and not predicted well by CPU utilization). The GPU
   is the one exception — `nvidia-smi` reports Sadida's real watts directly.
2. **Real measured power** (whole fleet) — a **Shelly Plug US Gen4** wired
   into the wall outlet feeding the shared power strip/UPS. Gives one
   real number for the whole rack (`lab:power_watts:measured`), compared
   live against the modelled total. Ocra is deliberately on a **separate
   circuit** from the monitored nodes — when the strip loses power, the
   Shelly goes dark but Ocra/Prometheus keep running and notice in real
   time (an outage signal, not just a retrospective gap).

   > Gen4 note: the `shellyctl` image has no Gen4 support (device-spec
   > resolver fails with `unknown \`app\``), so this repo ships a small
   > custom exporter (`monitoring/shelly-gen4-exporter/`) instead. Both emit
   > the same `shelly_status_*` metric names, so an older Gen2/Gen3 plug
   > would work with either exporter.

Sleeping nodes emit no metrics and contribute **zero**, not a phantom idle
draw — correctly making on-demand nodes look cheap.

## Battery backup (UPS/NUT)

A **CyberPower S175UC** UPS backs a subset of the fleet — Sadida, Sram,
Sacro and Aery (5 outlets), **not** Ocra (separate circuit, see above) and
not necessarily Xelor.

```
CyberPower S175UC ──USB──▶ Aery (usbhid-ups driver → upsd, listens :3493)
                                    │
                                    │ Tailscale, TCP 3493 (NUT's own protocol)
                                    ▼
                            nut-exporter (Ocra) ──▶ Prometheus :9199
```

The USB cable is on **Aery**, not Ocra, purely because that's where the UPS
is physically located — NUT's client-server split (`upsd` server + any
client over TCP 3493) means the query can come from anywhere on the
Tailscale mesh. Read-only today: on-line/on-battery status, charge %, load %
— **no coordinated automatic shutdown wired to a real power event yet**.

## Cost panels — real vs. modelled, and a Prometheus counter-reset bug

Grafana shows both a **modelled** cost panel and a **real (Shelly-measured)**
cost panel side by side, plus a "Projected monthly cost (real)" stat panel.

### The -84W panel and why it isn't an error

"Measured vs. modelled" briefly showed **-84W**. Not a bug: it's
`measured − modelled`, and two things stack to make it negative —
(a) the software model tends to *overestimate*, and (b) **Ocra itself is
excluded from the Shelly's measured circuit** (Ocra is on its own circuit,
by design — see above), so the measured total is always missing Ocra's own
draw relative to what the model counts. A negative delta here is expected,
not a fault.

### The real bug: Prometheus `increase()`/`resets()` amplifying tiny blips

**Symptom:** the "Projected monthly cost (real)" panel showed an absurd
**$57.75/month** when the actual measured wattage implied something far
lower (~$8/month).

**Root cause:** the panel used
`increase(shelly_status_total_energy_watt_hours[range])`. Prometheus's
`increase()`/`resets()` logic treats **any** decrease between consecutive
samples — even a sub-1Wh dip — as a full counter reset to zero, and
compensates by adding back the *entire* prior accumulated value. The
Shelly's `aenergy.total` counter had several tiny (<1Wh) non-monotonic dips
(confirmed via a purpose-built script, `correlate-resets.py` — see below),
each one getting amplified into a phantom multi-hundred-Wh jump by
Prometheus's compensation math.

**Investigation path** (kept because it generalizes to any Shelly/Prometheus
counter oddity):
1. First hypothesis was **full device reboots** every ~4h, supported by a
   suspiciously low `Sys.GetStatus` uptime reading (611–793s). Built
   `diag.sh` (`monitoring/shelly-gen4-exporter/diag.sh`) to check uptime,
   `autorecover_voltage_errors`, and voltage/power/current limits from the
   terminal without needing the Grafana dashboard.
2. Built `correlate-resets.py` to cross-reference each detected "reset"
   timestamp against the UPS's on-battery (`OB`) flag — all 5 resets that
   day turned out to be **on mains (`OL`)**, ruling out power-loss-triggered
   reboots.
3. Closer inspection of the before/after Wh values at each "reset"
   (`correlate-resets.py`'s table output) showed each one was a **tiny
   sub-1Wh drop** (e.g. `1234.95 → 1234.00`), not a reset-to-zero — pointing
   at brief relay-cycling / output-protection blips (auto-recovery already
   enabled) rather than reboots, and confirming Prometheus's own
   reset-compensation math as the actual amplifier.

**Fix:** switched both real-cost panels from `increase()` on the raw counter
to `avg_over_time(lab:power_watts:measured[range]) * hours / 1000 * $rate_usd_kwh`
— the same approach the modelled-cost panels already used, immune to
counter-persistence quirks (trade-off: an average-based approximation
instead of an exact integral). Confirmed sensible numbers afterward: **$8.12
real vs. $23.01 modelled**, proportional to 51W vs. 131W.

### Diagnostic toolkit (terminal-only, no dashboard needed)

Built at the user's request ("de manera que no me pierda en el dashboard"):

- `monitoring/shelly-gen4-exporter/diag.sh` — uptime, live switch status,
  voltage/power/current limits, Prometheus reset count, exporter health.
  Deliberately uses `set -uo pipefail` (**not** `-e`) with `fetch()`/
  `fetch_get()` helper functions that pre-capture curl output and substitute
  an `"[unreachable]"` sentinel on empty response — an earlier version with
  `-e` aborted the *entire* script on a single transient empty Prometheus
  response.
- `monitoring/shelly-gen4-exporter/correlate-resets.py` — cross-references
  every detected counter reset against the UPS's `OB`/`OL` flag; if ≥2
  resets exist, also prints the avg/min/max gap between them and projects a
  window for the *next* expected event.
- `monitoring/shelly-gen4-exporter/udp-log-listener.py` — a stdlib-only
  Python UDP listener that captures the Shelly's own debug log stream
  (configured via `Sys.SetConfig` → `debug.udp.addr`). Must run persistently
  in the background (`nohup ... & disown`) since the events recur only every
  ~3–4 hours. The Shelly's *on-device* persistent file log
  (`debug.file_log.enable`, browsable at `/debug/logs`) was tried first but
  its rotation window is only ~53 minutes — too short to catch an event
  checked after the fact.

### Curl gotcha worth remembering

`curl -s 'http://host:9090/api/v1/query?query=count_over_time(metric[24h])'`
returns an empty body — the literal `[`/`]` in the URL trigger curl's own
URL-globbing parser. Fix: `curl -s -G '<url>' --data-urlencode 'query=...'`.

## Related

- [[Monitoring Stack]]
- [[Node Power Control]]
