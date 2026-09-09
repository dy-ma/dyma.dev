---
headline: Effectively scheduling on a GPU
project: Fabric
summary: Notes on deciding what runs where when the scarce machine is the point.
published: true
home: secondary
homeOrder: 2
homeTreatment: excerpt
---

Fabric is concerned with connections: between services, between tools, and between the people expected to operate them. The practical problem is assigning work to scarce machines without turning every application into its own scheduler.

The interesting part is not only placing work. It is deciding which information belongs at each layer, what happens when the expected capacity is not there, and how an operator can understand the decision after it has been made.
