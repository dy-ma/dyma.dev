---
headline: A GPU is not a number
project: Fabric
date: 2026-09-08
summary: Scheduling scarce compute means preserving the difference between a valid request and available capacity.
published: true
home: secondary
homeOrder: 2
homeTreatment: excerpt
---

A request for “one GPU” sounds precise. To a researcher, it may be the only unusual resource a job needs. To the system running that job, it is the beginning of a much longer description.

Which GPU models can run the code? How much device memory is required? How many CPU cores are needed to keep it fed? How much system memory and temporary disk will the input, cache, and output consume? Can the selected machine reach the data? Is the runtime image compatible with its architecture and driver? One GPU is not a complete unit of capacity; it is one constraint among several that have to agree at the same time.

Fabric is the interface Aina's researchers use to submit work to shared compute. The most important lesson in building it has been that effective scheduling is less about inventing a clever scheduler and more about assigning each decision to the right layer.

## Four different questions

Before submission, Fabric validates the job and performs a preflight. It resolves the requested source into an immutable runtime, checks that inputs exist, verifies that a compatible pool could satisfy the declared resources, and asks the execution backend to dry-run the resulting job. Its question is: **could this job run here?** If the answer is no, the user should find out before any compute starts.

After submission, a queue admits jobs against an operator-defined resource budget. Its question is: **should this valid job be allowed to consume capacity now?** A job that is waiting for quota is not malformed and the system is not broken. It is queued.

Once admitted, Kubernetes chooses a compatible node for the workload. If no such node exists yet, a provisioner may request one from the cloud. Those layers answer two more questions: **where can this pod fit?** and **what machine should exist so that it can fit?** The cloud provider still has the final constraints of regional supply and account quota.

Collapsing these questions into one “scheduled or failed” result makes the system feel arbitrary. Keeping them separate gives each failure a useful meaning. An impossible request can be rejected immediately. A possible request with no current quota can wait. An admitted job can report that it is provisioning rather than appearing stuck.

## The limits do not share a unit

This separation becomes especially important because every layer measures capacity differently.

The admission queue reasons about aggregate job requests. The node provisioner buys whole machines. Cloud GPU quotas may be expressed in the instance's virtual CPUs rather than its GPU count. The workload asks for scratch space, but that space has to fit on a node disk also used by images and system services. A queue with room for another GPU job does not prove that a compatible instance is available, that the account has enough quota, or that the node has enough disk.

These are not edge cases. They are the normal geometry of infrastructure. A six-core, one-GPU pod might require a sixteen-core instance. Increasing an eight-GPU admission ceiling does not create eight GPUs, and increasing a cloud quota does not authorize the scheduler to spend it. A maximum is a boundary, not a target.

Fabric therefore treats the job specification as a collection of hard requirements rather than a hint about the most interesting chip. GPU model and memory, CPU, RAM, scratch, storage location, runtime, and timeout all participate in whether the work is possible. Preflight tries to eliminate requests that can never run, while temporary scarcity remains visible as a normal queue state.

## Explain the wait

The practical measure of a scheduler is not only utilization. It is whether a person can understand what happened to their work.

A Fabric job is recorded before execution is attempted. Its source, immutable image, normalized parameters, requested resources, input and output locations, and each concrete run remain associated. The lifecycle distinguishes submission, queueing, admission, provisioning, image pulling, preparation, execution, and output publication. That vocabulary can feel elaborate until a costly job spends twenty minutes doing something other than running the application.

With those boundaries, “waiting” becomes an answerable condition. The request may be valid but behind other admitted work. It may need a machine that is still starting. It may be blocked by a hard placement requirement, or it may have run successfully while its results are still being uploaded. Those situations demand different action, so they should never be compressed into the same spinner.

The takeaway is that a GPU platform does not become effective by pretending every scarce resource is interchangeable. It becomes effective by preserving the differences: possible versus available, admitted versus placed, a requested slice versus a whole machine, and application completion versus durable results. Once those distinctions are visible, scheduling stops looking like magic and starts behaving like a system people can reason about.
