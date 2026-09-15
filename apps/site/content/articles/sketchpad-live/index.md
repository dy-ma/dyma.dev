---
headline: A whiteboard you can talk to
project: Sketchpad Live
date: 2026-09-14
summary: A small experiment in giving a voice agent a shared canvas.
published: true
image: ./hero.png
imageAlt: A pig drawing a system diagram on a large whiteboard.
imageCaption: Office hours are now in session.
links:
  - label: Watch the demo
    href: https://x.com/dymadome/status/2099635848572797346?s=20
    icon: x
  - label: View the source
    href: https://github.com/dy-ma/sketchpad-live
    icon: github
---

I made Sketchpad Live because conversation starts to feel cramped as soon as an idea becomes spatial. Describing which box connects to which other box is work a shared canvas should do for us. I wanted to see whether a voice agent could feel less like a chat window and more like a teacher standing at the board.

[Sketchpad Live](https://github.com/dy-ma/sketchpad-live) is the proof of concept. It combines a full-duplex voice conversation with a tldraw canvas the agent can inspect and change. You can ask it to explain a diagram, add to it, rearrange it, or teach the idea step by step. The live model handles the conversation while a reasoning model receives an image and the structured canvas state, then streams concrete edits back as they are produced.

The interesting part is not that a model can draw boxes. It is that the voice, the canvas, and its attention can stay aligned. During a walkthrough, the agent can focus the relevant part of the board, add temporary annotations, and place an interactive lesson card beside the diagram. You can interrupt, change the drawing yourself, and keep going.

This is still a small public experiment rather than a product, but it made the interface I had in mind feel surprisingly tangible. There is a short demo [on X](https://x.com/dymadome/status/2099635848572797346?s=20), and the [source is on GitHub](https://github.com/dy-ma/sketchpad-live).
