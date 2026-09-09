---
headline: Moving TBs in the browser
project: Drop
date: 2026-09-08
summary: A large dataset does not need to become one large file before it can become a download.
published: true
home: lead
homeOrder: 1
homeTreatment: full
image: ./hero.png
imageAlt: A pig standing on its hind legs while unplugging a cable from a server rack.
imageCaption: Transfer supervision in progress.
---

The familiar browser download has a simple shape: one response becomes one file. That shape works until the thing being downloaded is not really a file at all. At Aina, a dataset can be a directory tree containing terabytes of footage. Asking the browser to download it exposes a mismatch between the interface and the thing a person actually wants.

## The archive is not the dataset

There are a few conventional ways to hide that mismatch. The browser can start a separate download for every object, but thousands of independent downloads are difficult to supervise and do not reliably reconstruct a directory tree. The application can collect the data in memory, but the browser is the wrong place to assemble a multi-terabyte blob. The server can put everything into a zip file, which makes a folder look like the one file the download interface expects.

Zip is appealing because it solves the shape of the problem. It is less appealing when we look at what the bytes have to do.

A server can build the archive on demand and stream it without holding the whole result in memory. Now, however, every download is a new composite response. The individual source objects may already be cached at the edge, but the archive itself has to be assembled as one continuous stream. If the transfer stops near the end, resuming that stream is also more complicated than requesting an ordinary object again.

Prebuilding archives changes the tradeoff rather than removing it. For a long time, Aina kept pre-zipped copies of datasets. Those copies were easy to download and easy to cache, but they duplicated storage, needed their own lifecycle, and became stale whenever the underlying folder changed.

There was not even a compression win to offset those costs. Our large objects are usually camera media, which is already compressed. Wrapping it in another compression format mostly adds work and a second representation of the same bytes.

The useful question turned out not to be “How do we make a better zip?” It was “Why does this have to become one file at all?”

## Give the browser a destination

Chromium's File System Access API lets a user grant a site access to a directory they choose. Once Drop has that directory handle, it can create folders and files beneath it. The browser no longer has to hand one opaque download to the operating system; it can materialize the dataset in its original shape.

The server first produces a manifest: the files in the dataset, their relative paths, their sizes, and short-lived download URLs. The browser passes that manifest and the chosen directory to a Web Worker. The worker creates the directory structure, downloads a small number of files concurrently, and writes each response stream directly to its destination.

Only the chunk currently moving from the network to disk needs to be in memory. The tab does not accumulate an enormous blob, and the work of reading, writing, and tracking several transfers does not occupy the main UI thread. Progress can be measured against the sizes in the manifest before the first byte arrives, so “37%” refers to the whole dataset rather than only the current file.

This also preserves a property that the zip approach discarded: every network request is still for an ordinary source object. The CDN can cache and serve those objects independently. We changed how the client arranged the bytes without changing the identity of the bytes in transit.

## Resume at the boundary you can trust

Large transfers eventually meet an expired credential, a sleeping laptop, a lost connection, or a closed tab. A transfer this size cannot treat interruption as an exceptional event.

Drop's current recovery unit is a complete file. When a transfer starts again, it compares files already on disk with the sizes in the manifest. A match can be skipped; a mismatch is downloaded again. That is not byte-level continuation, but it is simple, observable, and useful when a dataset contains many separate media files. It also works with the browser's atomic file writer, which avoids leaving a partially written destination masquerading as a finished file.

The distinction matters. It is tempting to label any restarted transfer “resumable,” but the honest unit of recovery is part of the design. A future version can write explicit partial files and continue them with HTTP range requests. Until then, file-level recovery gives us a clear guarantee without building a second transfer protocol inside the browser.

The broader lesson from Drop is that packaging and transport are separate concerns. We had been turning a directory into an archive because the old browser interface wanted a file. Once the browser could safely write a directory, the extra format stopped being necessary. The fastest archive to create, store, invalidate, cache, and unpack was no archive at all.
