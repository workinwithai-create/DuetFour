# DuetFour

Four-bar live counter desk for bedroom producers and AI-music finishers.

Loops talk to themselves. Session players write a short reply — violin third, trumpet call — against the chords you already have so the section has conversation and can finish.

Live samples only — FluidR3 piano, upright, kit, violin, trumpet from the PreEight bank pinned to commit `d58301e4a494555f411a2afbc448b724136eee76`.

No oscillators. Audio never leaves the tab.

## Distinct from yesterday and the rest of the line

| Tool | Job |
| --- | --- |
| TagFour | Four-bar last-line tag |
| LiftTwo | Two-bar pre-hook lift |
| PreEight | Eight-bar pre-chorus climb |
| CallFour | Answer after a sung line |
| HookLine | Singable motif |
| SoloEight | Full eight-bar solo |
| **DuetFour** | Four bars of counter reply against your chords |

Yesterday's ship was the previous arrangement desk. DuetFour is the missing short conversation inside the loop you already have.

## Pricing recommendation

One-time **$19** on Lemon Squeezy (mirror on Gumroad).

This is a finite desk, not a cloud meter. Do not subscribe. Forge Pass stays the recurring cloud bundle.

**Current app is free.** No license gate. MIT.

## Samples

Pinned commit SHA only. Never @main or @gh-pages.

## Export

Default bounce is 48 kHz, 24-bit stereo.

Form is 4 bars. At 92 BPM the loop file is exactly `Math.round(4 * 4 * 60 / 92 * 48000)` = 500870 samples, first downbeat at sample 0.

(The general formula is `Math.round(bars * 4 * 60 / bpm * sampleRate)`. An 8-bar render at 92 BPM is 1,001,739 samples.)

Tail is rendered (0.5 s) then folded onto the start for a seamless loop. Peak normalized to ≤ −1 dBFS.

Filenames: `duetfour-recipe-<bpm>bpm-<key>.wav` and matching `.mid`.

MIDI has tempo, 4/4, and one track per chair (Piano, Bass, Drums on ch10, Counter).

Reuses already-loaded sample ArrayBuffers. No re-download. No Math.random in the export path.

## Acceptance (section 9)

1. Export at 92 BPM, 4 bars (or 8), 48 kHz → exact sample count per formula; first transient at sample 0 by scheduler design (time=0 in offline).
2. Import at bar 1 of a matching BPM DAW and loop: no clicks at the seam (tail folded), no drift.
3. Play, switch tab 30 s, return: stopped cleanly via visibilitychange, no stacked notes.
4. Change chords / chair / BPM while playing: heard on next step (mutable state read every schedule), no restart.
5. Block sample host and reload: UI names the missing instruments.
6. Held notes use gain ramps and stop after duration; drums are short one-shots.
7. Grep: no @main or @gh-pages, no Math.random in export path, voice names match samples (violin/trumpet/piano/bass/drums).

Core export implemented and live. Source complete on GitHub. Deployment at https://duetfour.vercel.app (auto-updates on push). Free, no checkout required.

## License

MIT. workinwithai-create.