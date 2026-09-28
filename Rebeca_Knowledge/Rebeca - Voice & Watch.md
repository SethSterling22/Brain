---
title: Rebeca — Voice & Watch
tags: [rebeca, voice, whisper, piper, watch]
updated: 2026-09-27
---

# Rebeca — Voice & Watch

Speech in/out and the Galaxy Watch UI. Related: [[Rebeca - Assistant Core]] ·
[[Rebeca - Channels, Access & Security]].

## Voice services

- **Whisper (STT)** and **Piper (TTS)** run on GPU hosts over the tailnet:
  **omarchy** preferred (when on), **Sadida** fallback. Ports 8100 / 8200.
- assistant-core proxies them: `POST /voice/transcribe`, `POST /voice/speak`.
  It picks the first host that answers a quick `/health` and **fails over** to the
  next (`withVoiceHost`, env `WHISPER_URLS` / `PIPER_URLS`, comma-separated,
  preference-ordered).
- TTS text is cleaned first (`forSpeech`): strips markdown, URLs, code, emojis so it
  doesn't read "asterisco" or links aloud.

## Dashboard voice (push-to-talk)

Mic button → `MediaRecorder` (webm/opus) → `/voice/transcribe` → send as chat →
`/voice/speak` → playback via the **Web Audio API** (`decodeAudioData`), which
bypasses autoplay blocking. `ensureAudio()` unlocks playback within the mic gesture.
A stop button cuts playback; sending something new cuts it too.

## Watch UI (`public/watch.html`, route `/watch`)

- Voice-first, **circular layout** for the Galaxy Watch 4 (Wear OS, Samsung
  Internet). Everything sits inside the inscribed square (vmin units) so the round
  bezel doesn't clip it.
- Big **mic** button (push-to-talk) + **quick-action chips** (Agenda, Clima, Notas,
  Repetir, Nuevo). Short text reply + spoken TTS. Status ring (listening/thinking/
  speaking).
- Uses `channel: "dashboard"` so it has all tools; own session in `localStorage`.
- Non-streaming `/chat` (simpler/robust on the watch browser). Degrades gracefully
  if the browser can't record (chips still work).

## Watch access & the mic caveat

- The watch reaches Rebeca through the **public Tailscale Funnel on :10000**
  (the phone's Tailscale does NOT extend the VPN to a Bluetooth-tethered watch, and
  there's no Tailscale app for Wear OS).
- **HTTPS is required** for the mic (`getUserMedia` = secure context only). The
  Funnel provides a valid cert, so the mic works. On plain-http LAN the mic is
  blocked (chips + TTS still work).
- Authorized by the **watch token**: open `…:10000/watch?wt=<WATCH_TOKEN>`; it sets a
  scoped signed cookie. See [[Rebeca - Channels, Access & Security]].

## Pending / optional

- Wake word ("Hey Rebeca"), continuous conversation / barge-in / streaming TTS,
  Telegram voice-note reply (Piper).
