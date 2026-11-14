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

At 92 BPM and 8 bars the loop file is exactly 1,001,739 samples (`Math.round(8 * 4 * 60 / 92 * 48000)`), first downbeat at sample 0.

Tail is rendered then folded for a seamless loop. Peak ≤ −1 dBFS.

Filenames: `duetfour-recipe-<bpm>bpm-<key>.wav` and matching `.mid`.

## Acceptance (section 9)

1. Export at 92 BPM, 8 bars, 48 kHz → exactly 1,001,739 samples; first transient at sample 0.
2. Import at bar 1 of a 92 BPM DAW and loop 4 times: no clicks at the seam, no drift.
3. Play, switch tab 30 s, return: stopped cleanly, no stacked notes.
4. Change recipe / mutes / BPM while playing: heard within one bar, no restart.
5. Block sample host and reload: UI names the missing instruments.
6. Hold longest pad at slowest tempo: sustains to the end of the note.
7. Grep: no @main or @gh-pages, no Math.random in export path, voice names match samples.

## License

MIT. workinwithai-create.