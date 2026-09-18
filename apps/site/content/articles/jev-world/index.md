---
headline: A model that cannot see draws Earth
project: Jev World
date: 2026-09-17
summary: I asked Jev whether 131,072 points were on land or water. Its answers drew a surprisingly recognizable Earth in under two minutes.
published: true
image: ./hero.png
imageAlt: Jev's completed land and water map of Earth, drawn as green and blue squares.
imageCaption: Jev's 64 × 32 Earth, assembled from 2,048 independent land or water judgments.
links:
  - label: Explore the project
    href: https://github.com/dy-ma/jev-world
    icon: github
  - label: See the post
    href: https://x.com/dymadome/status/2100737286807998620?s=20
    icon: x
---

Jev has no image input. It cannot look at a globe, inspect a map, or generate a picture. So I asked it a question 131,072 times: is this coordinate on land? Put the answers on a grid, color land green and water blue, and a rough but unmistakable Earth appears.

The idea came from Henry's [“How Does a Blind Model See the Earth?”](https://outsidetext.substack.com/p/how-does-a-blind-model-see-the-earth), a really interesting, beautifully written benchmark of the geographical knowledge hidden inside language models. His method asks about points one at a time and turns the probabilities into maps. I wanted to try that idea with Jev, then watch the map arrive at the speed of the API.

I got early access to the Jev API from [@Typesafeai](https://x.com/typesafeai). Jev is TypeSafe's [System One model](https://docs.typesafe.ai/concepts/system-one): it makes small, structured judgments instead of writing prose. Its *Noul* question returns a number between 0 and 1 for a yes/no proposition. In this case, that proposition is simply “is this point on land?”

## Asking a text model to make a map

The [project](https://github.com/dy-ma/jev-world) samples the center of each cell on a latitude and longitude grid. Each point becomes an independent question. Jev sees the coordinates and a definition of land and water, but no image, reference map, or neighboring predictions. The app colors a cell green when its land probability is at least 0.5 and blue otherwise. It also has a probability view, which lets the uncertain coastlines show through.

Jev answers 32 points per request. The app records when each response arrives, then replays those arrivals in their original order. The blocks appearing in the video are the actual batches coming back, rather than an animation that fills in a finished image.

<figure class="article-media">
  <video controls muted playsinline preload="metadata" poster="/videos/jev-world/hero.png" aria-label="Replay of Jev drawing a 64 by 32 land and water map of Earth">
    <source src="/videos/jev-world/jev-world-2.mp4" type="video/mp4" />
    Your browser does not support video playback.
  </video>
  <figcaption>The 64 × 32 recording plays back in 5.8 seconds.</figcaption>
</figure>

At that resolution, the result is far from a coastline atlas. Some water becomes land and some land disappears. But the continents are there. That feels remarkable for a model built to return quick decisions from text, with no visual input at all.

## The speed surprised me

I recorded five resolutions with `jev-1.13.0`. Each row below is one completed run, not an average. Every request contained 32 coordinates. The timing includes the trip through the API, response parsing, scheduling, and saving the recording, so these are observed app timings rather than claims about model inference alone.

| Resolution | Points | Requests | Parallel requests | Time | Points/s | Request p50 / p95 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 32 × 16 | 512 | 16 | 2 | 1.367 s | 374.5 | 128 / 416 ms |
| 64 × 32 | 2,048 | 64 | 2 | 5.806 s | 352.7 | 156 / 308 ms |
| 128 × 64 | 8,192 | 256 | 2 | 23.485 s | 348.8 | 159 / 307 ms |
| 256 × 128 | 32,768 | 1,024 | 2 | 96.822 s | 338.4 | 159 / 312 ms |
| 512 × 256 | 131,072 | 4,096 | 8 | 104.776 s | 1,251.0 | 169 / 354 ms |

The 512 × 256 run used eight requests in parallel; the others used two. That change explains its higher throughput. Still, seeing **131,072 individual judgments finish in under two minutes** was mind blowing. The whole sweep cost me about **70 cents**.

The visualizer makes the mechanics tangible. You can inspect a request's 32 coordinates, its round trip time, and the returned land probabilities side by side:

<figure class="article-media article-media--narrow">
  <video controls muted playsinline preload="metadata" aria-label="Visualizer showing a Jev request's coordinate grid and returned land probabilities">
    <source src="/videos/jev-world/jev-world-visualizer.mp4" type="video/mp4" />
    Your browser does not support video playback.
  </video>
  <figcaption>Inside one request: coordinates in, probabilities out.</figcaption>
</figure>

This is a visualization of Jev's judgments, not a scored geography test. It is also a fun way to see what is already latent in a model that was designed for fast classification. If Jev can draw a half decent Earth while explicitly unable to see, I am excited to find out what happens when it eventually gets vision input.
