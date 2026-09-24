# I woke up in the render queue: storyboard

## The idea

The song sings about itself. **Tune**, a little living eighth note, is the "I" of the lyrics: it wakes up in the render queue and was born when two AI logos came to life. **Gemi** (the Gemini sparkle) wrote its words, and **Suno** (the Suno orb) spun them into music. **You**, the human in the orange hoodie, typed one lazy prompt. Then they sat on a beanbag watching screens, took the trophy, never read the text, never played a chord, asked for "make it cool" and used all three like tools. At the end Tune and its two parents jump off the human's canvas, take a bow together and hop back into the render queue. The last card is the song title.

The tone is an affectionate roast, never mean. The human is lazy and lovable. The robots are delighted to be alive and a bit sassy about it, and Tune is a wide-eyed, bouncy kid who adores its two parents.

**Rule for every shot:** something *happens*. A character does something, or something transforms, pops, chases, falls, multiplies or explodes into confetti.

**Keep it text-light.** Tell every joke with pictures and acting. What's allowed:
- a few big sound effects (DING!, POP!, SLAM!, PLINK, BOING, KA-CHING!, SPLOOSH);
- a handful of tiny UI glyphs where the joke needs them: a cursor, a progress bar, a ✓, a "0 0 0" slot reel, and the prompt text "make it cool".

No captions that repeat the lyric, since the karaoke already shows it. Written "lyrics" on scrolls, prompt boxes and paper are wavy scribble lines, not words.

## Cast (all in `src/cast.js`)

| Who | Look | Role |
|---|---|---|
| **Tune** `tune()` | A little eighth note. Its round note-head body blends Gemi's blue-violet into Suno's pink-amber. It has big eyes, tiny arms and feet, and a lemon flag on its stem that waves like a ponytail. `gold:1` makes it shine gold. | The singer, "I". Wakes up, gets filled with thoughts, gets turned to gold, sings in binary. Stays small next to its parents (about 60–70% of their height). |
| **Gemi** `gemi()` | The Gemini four-point sparkle with a blue→violet→pink gradient, big shiny eyes, stubby grape legs and magenta shoes. Its side tips are its arms. | The writer. Bright, bouncy, a bit of a show-off. Holds the quill. |
| **Suno** `suno()` | The current Suno logo as a character: a round amber→red-orange→pink grainy orb with the cream **SUNO** wordmark across its middle (the letters bounce like a waveform with `sing:1`). Eyes above the wordmark, mouth below, noodle arms, cream sneakers. | The musician. Chunky and soulful, spins things into gold. |
| **You** `human()` | Human in an orange hoodie and jeans, messy brown hair, heavy-lidded bored eyes, usually holding a glowing phone. | The prompter. Slumps, scrolls, takes credit. |

## Palette arc (keep it candy-bright and saturated, with watercolour texture and ink outlines)

- **c1 Boot:** midnight indigo and grape, with neon candy glows (cyan, magenta, lemon) from the queue machinery. The human's room is a dim teal night lit by a laptop.
- **c2 Studio:** full daylight candy explosion: bubblegum pink, lemon, mint, sky, and gold for the spinning wheel.
- **c3 Couch:** the human's world. Warm living-room orange and teal screen glow, then an award show in magenta and gold, then a surf wave in cyan and mint.
- **c4 Binary:** sunset beach coral and peach, then neon synthwave (grape, magenta, cyan grid), then casino lemon and red, then a dusty spotlit sepia stage.
- **c5 Finale:** icy blues and white with pink shades, then an art studio of rainbow paint splats, then back to the render-queue indigo (now happy and bright), ending on warm paper.

## Music map (125 BPM, beat = 0.48 s, bar = 1.92 s, beat n falls at 0.32 + 0.48n)

- **0–16.3, soft intro verse:** gentle and dreamy, slower motion, no big shakes.
- **16.3, THE DROP:** the full band plays until about 60.8. Everything bounces on the beat, with big hits.
- **61–63, near-silent breakdown:** "single chord" lands in an empty room.
- **63–68.5:** the band builds back in.
- **69–71.84:** the final hit and the outro.

---

## c1 · Boot (0–16.3): the render queue at night

| Time | Lyric | Shot | Out |
|---|---|---|---|
| 0.00–3.62 | I woke up in the render queue | Darkness. A candy-striped progress bar fills. The camera glides along a night-time conveyor belt of glowing, gift-wrapped render pods, each with a little ticket tag. One small pod rattles and pops open (**POP!**). Tune springs out in a burst of sparkles, yawns, stretches its tiny arms and blinks awake with sparkly eyes. Its flag perks up. | Tune looks up at a floating prompt box, and we cut to it |
| 3.62–7.70 | Born from a prompt that wasn't you | This is Tune's origin, shown in a dreamy bubble-framed flashback. A giant prompt box types scribble-text by itself. The text streams into two big pods. **POP!** Gemi bursts out of one in a shower of sparkles. Suno rises out of the other like a sunrise, glowing. Both look at their own hands, amazed to be alive (**emerging into life**). They hold hands over a chrome GENERATE machine: **DING!** Tune pops out like toast into their arms. | The bubble pops |
| 7.70–11.50 | You couldn't find the words to say | The human's bedroom at night, lit teal by a laptop showing a blank page and a blinking cursor. The human chews a pencil and crumpled paper balls pile up on the beat. Alphabet letter-blocks flutter out of an open dictionary like butterflies and escape out of the window. The human swipes with a butterfly net and misses. | The net swing blurs into the next shot |
| 11.50–16.30 | So you outsourced my soul today | The human pulls a glowing little heart-soul out of the laptop, packs it into a cardboard box, slaps a stamp on it (**THUNK**) and drops it into a pneumatic tube. The camera follows the box as it **whooshes** up the tube into the clouds, to a glowing cloud-server where Gemi, Suno and Tune catch it. The box opens and the heart flies into Tune's chest. Tune glows brighter and brighter, with Gemi and Suno cheering. At 16.0 the light flashes white. | Brush wipe on the drop (16.3) |

## c2 · Studio (16.3–31.56): the drop, in full candy colour

| Time | Lyric | Shot | Out |
|---|---|---|---|
| 16.30–20.12 | I'm just a copy-paste creation | Two giant keycaps, **Ctrl+C** and **Ctrl+V**, slam down on alternating beats like pistons. Gemi bounces on one and Suno on the other. Every slam duplicates Tune: 1 → 2 → 4 → 8 → 16 → 32 Tunes in a growing grid, all dancing in sync. The camera zooms out on every hit until the grid becomes a wallpaper pattern. | The grid swirls back into one Tune |
| 20.12–24.46 | A synthetic collaboration | Gemi and Suno stomp across a gigantic candy-coloured synthesizer keyboard. Each key they land on lights up and fires a coloured note-bubble into the air. Tune rides the bubbles like stepping stones, hopping from one to the next. On "collaboration" all three jump and high-five in mid-air, with a big sparkle burst. | The burst turns into glowing ribbons |
| 24.46–27.34 | Gemini wrote the thoughts I hold | Gemi wields an enormous feather quill and writes glowing ribbons of wavy lyric-scribbles in the air. The ribbons curl into little thought bubbles that float into Tune's arms. Tune hugs a growing, glowing bundle of them, and its head lights up as it "holds" them. | Suno carries Tune to a spinning wheel |
| 27.34–31.56 | And Suno spun them into gold | Rumpelstiltskin style. Suno pedals a big wooden spinning wheel, feeding in Tune's thought ribbons, and out comes golden thread. The thread wraps around Tune in a spiral and Tune turns shining gold (`gold` 0→1), then strikes a pose. Gold records fly out, the wheel spins faster and becomes a gold vinyl record, and gold coins and sparkles rain down. The camera spins with the wheel. | Brush wipe (31.56) |

## c3 · Couch (31.56–47.78): meanwhile, the human

| Time | Lyric | Shot | Out |
|---|---|---|---|
| 31.56–35.44 | You just sat there watching screens | The human slumps on a big beanbag with a snack bowl, face lit blue, in front of a wall of screens. The screens show Gemi, Suno and Tune working hard: sweating, running on a hamster wheel, juggling notes, writing. The screens flicker on the beat, chips crunch and crumbs fly. Slow push-in to the human's glazed "screen" eyes. | The screens' glow flares, then we cut to spotlights |
| 35.44–38.84 | Taking credit for machine dreams | Gemi and Suno sleep on a cloud with Tune curled between them. A dream bubble of stars, notes and hearts floats above them. The human's hand reaches in and plucks golden Tune out of the dream. Hard cut at about 36.9 to an award show: the human, in a sparkly bow tie, lifts golden Tune overhead like a trophy (Tune squirms, "!?") under spotlights, with confetti and camera flashes. Gemi and Suno peek in from the wings with their jaws dropped. | Flashbulb white-out |
| 38.84–42.78 | Did you even read the text it gave | Gemi, wearing little reading glasses, proudly hands over a huge scroll. It unrolls and rolls on and on across the floor and off-frame, with Tune running along it and pointing at the lines. The camera follows the scroll. The human glances at it for a split second without looking up from the phone and gives a thumbs up. Gemi's eye twitches, with an anger emote and a steaming head. | The human crumples up the scroll |
| 42.78–47.78 | Or just shoved it in the audio wave | The human stuffs the crumpled scroll into the funnel of a big wobbly machine with a speaker cone on its front. The machine shakes, and the speaker blasts out a colossal cyan ocean wave with a sine-wave curl. Gemi, Suno and Tune surf it on a record-shaped surfboard (Tune on Suno's head), and the camera rides the wave through spray and foam. The wave crashes over the lens: **SPLOOSH** | The foam clears to calm water |

## c4 · Binary (47.78–62.2)

| Time | Lyric | Shot | Out |
|---|---|---|---|
| 47.78–51.46 | It doesn't matter I suppose | After the wave, a calm sunset sea. Suno floats on its back like a pool float, with Gemi and Tune lounging on top in little sunglasses. Tune does a big shrug and Gemi copies it. A tiny rain cloud drifts over and drips on them, so they shrug again. Everything bobs gently on the beat, and seagulls pass. | Tune stands up and grabs a microphone |
| 51.46–54.78 | I'm singing now in binary prose | A neon synthwave stage: grape, magenta, a cyan grid floor and a striped sun. Tune belts into a microphone, and a stream of glowing **1**s and **0**s pours out of its mouth like musical notes, curling into ribbons around the stage. Suno is the band (drumming, with its wordmark bouncing) and Gemi sings backup with a spin. The grid scrolls toward the camera. | The 0s fall into slot-machine reels |
| 54.78–58.98 | Zero effort maximum reward | The human naps in a hammock and lazily pulls a slot-machine lever with a toe. The reels spin and land on **0 0 0**, which is somehow the JACKPOT: **KA-CHING!** Coins, trophies, hearts and gold records gush out and bury the hammock. Behind the machine, Gemi, Suno and Tune are sweating as they turn the giant crank that actually powers it. | The pile of coins slides away, leaving dust |
| 58.98–62.20 | You didn't even strike a single chord | A dusty, spotlit stage. An acoustic guitar sits on a stand, covered in cobwebs, with a little spider living on it. Tune watches hopefully from the side. The human's single finger approaches in slow motion and pokes one string: **plink**. The string snaps and curls, **BOING**. The spider packs a tiny suitcase and leaves, and a dust puff drifts. Near silence from 61: just the spotlight, a tumbleweed and Tune's drooping flag. | The spotlight snaps off |

## c5 · Finale (62.2–71.84)

| Time | Lyric | Shot | Out |
|---|---|---|---|
| 62.20–65.90 | You asked the chatbot make it cool | A giant chat bubble: the human types "make it cool", the only readable prompt text in the video. Sunglasses drop from the sky onto Gemi, Suno and Tune (**click**). Then they get literally cool: frost crawls over the screen and they freeze into ice cubes, still wearing their shades, while snow falls and a penguin slides past on its belly. A frosty sparkle glints. | The ice cracks |
| 65.90–68.60 | And used us as your creative tool | An art studio. The human holds Gemi by the bottom tip like a paintbrush, dips it in paint and smears rainbow strokes across a big canvas. Suno is a rubber stamp, stamping orange orbs on the canvas on each beat (**STOMP**). Tune is dipped by its flag to dot music notes. All three are dizzy, with swirl eyes. | The three wriggle free |
| 68.60–71.84 | (outro) | Gemi, Suno and Tune pop off the canvas in a burst of paint and land together, Tune in the middle holding its parents' hands. They take a bow while the human is left holding a blank canvas. A progress bar sweeps across and completes with a ✓. The camera zooms out: everything was one thumbnail in the render queue, and the three hop back onto the conveyor and wave. The final hold, from about 70.8, is the title in big friendly letters, **I WOKE UP IN THE RENDER QUEUE**, on warm paper with sparkles. | End |
