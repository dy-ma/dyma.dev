---
headline: Making S3 look like a file
project: Redthing
date: 2026-09-08
summary: A decoder does not need a local file when the storage behind its read interface can answer precisely.
published: true
home: secondary
homeOrder: 3
homeTreatment: excerpt
---

A file and an object in S3 look similar from a distance. Both have a name and a length, and both contain bytes. The difference appears when a decoder asks for a few thousand bytes from somewhere in the middle.

Video software is built around random access. It reads a header, jumps to an index, finds the location of a frame, and then reads the compressed data for that frame. An object store offers no file descriptor and no `seek`. The conventional answer is to download the entire object first, but that is a large entrance fee when the useful result might be a single thumbnail.

Redthing works with RED camera footage stored in S3. Its central idea is to avoid teaching the decoder anything about object storage. Instead, it makes object storage satisfy the small file interface the decoder already understands.

## Translate reads, not files

The RED SDK permits a custom input implementation. At its boundary, the operations are ordinary: open a path, report its size, and read a given number of bytes at an offset. S3 can answer every one of those operations. Object metadata provides the size, and an HTTP range request returns bytes from an offset without transferring everything before them.

That gives Redthing a narrow adapter. The SDK asks to read part of what it believes is a file. The adapter turns that request into a signed range request and places the result into the decoder's buffer. To the code doing the decode, a local path and an `s3://` path have the same behavior.

This is more than syntactic convenience. A user can inspect a frame near the beginning of a very large clip after fetching its metadata and the compressed data for that frame, rather than waiting for the complete camera original to land on disk. Existing SDK logic for indexes, multipart clips, and frame selection continues to work because the storage boundary is below it.

## Random access is not free access

Making S3 look like a file does not make it perform like a local disk. A local read may cost microseconds; a range request has network latency, authentication, and an HTTP exchange. If the SDK makes many small, overlapping reads, translating each one literally produces a correct but slow remote file.

The access pattern tells us what to cache. On open, Redthing fetches a small region that contains the header and index data the decoder repeatedly consults. Reads farther into the object are grouped into fixed-size blocks and cached, so nearby requests share one network trip. The cache is tied to the object's identity, allowing it to be discarded when the source changes rather than quietly returning bytes from an older upload.

The important part is not the particular block size. It is that the adapter can observe the decoder's behavior and bridge the difference between two storage systems without changing the decoder itself.

It can also choose a different strategy for a different workload. Extracting a few frames is sparse random access, so range reads avoid moving most of the source. Transcoding a complete proxy is largely sequential and eventually touches most of the clip. In that case, downloading into a local cache first can be faster and friendlier to repeated work than turning the entire scan into remote range requests.

“Direct from S3” is therefore a capability, not a rule that every byte must always be streamed on demand. The same input boundary supports a remote, range-backed file for sparse reads and a local cached file for dense reads. The application can choose based on how the data will actually be used.

## Keep the hot path on one side of the boundary

The first version of this idea split the work between C++ and Python. The native SDK decoded frames while its file callbacks crossed into Python to perform S3 requests. It looked like a sensible division: C++ for the proprietary media SDK, Python for orchestration and familiar cloud libraries.

In practice, the file callback was the wrong place for a language boundary. The decoder is multithreaded and can issue reads from several internal threads. Each callback entering Python had to acquire the interpreter lock, allocate Python objects, sign a request through a large client stack, and then return synchronously to C++. The system had concurrency on paper while its most frequent coordination point serialized it in practice. Making the Python side asynchronous could not fix a native callback that was required to return bytes synchronously.

Redthing moved the entire read path into the native process. High-level orchestration can still be written in any language, but the boundary is coarse: submit a frame or proxy job and receive events and results. The decoder, network reads, buffers, and concurrency stay together inside the operation.

That experience produced a useful rule for integrations like this one: put the abstraction boundary where calls are infrequent and meaningful. “Decode these frames” is a good boundary. “Please fetch the next tiny range while several native threads wait” is not.

S3 never became a filesystem, and Redthing did not need it to. The decoder needed only a convincing answer to a handful of file operations. By adapting that narrow interface—and by respecting the access patterns and concurrency behind it—we could move the computation to the footage instead of moving all the footage first.
