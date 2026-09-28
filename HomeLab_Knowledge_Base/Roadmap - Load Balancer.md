---
tags: [homelab, roadmap, k3s, open-question]
---

# Roadmap — Load Balancer

Part of [[Homelab MOC]]. **Status: open, undecided, not implemented.** This
was discussed informationally once and has not been revisited — do not
implement anything here unless the user explicitly brings it back up.

## The actual gap

**Traefik already ships with k3s** and handles L7 load distribution across
pod replicas fine. What's genuinely missing is a **stable ingress entry
point** — a consistent address/VIP for `type: LoadBalancer` Services,
independent of which node happens to be running a given pod.

Also worth remembering: a load balancer doesn't help single-replica apps
running on sleepable/on-demand nodes (Xelor, Sacro) unless there are
redundant replicas also running on always-on nodes — see
[[Node Power Control]] for why those nodes sleep in the first place.

## Options discussed (none chosen yet)

| Option | What it gives | Fit with this lab |
| --- | --- | --- |
| **k3s's built-in ServiceLB (Klipper)** | May already provide basic `type: LoadBalancer` support with zero extra tooling | Worth checking before adding anything else — possibly already sufficient |
| **MetalLB** | L2/ARP mode, standard bare-metal solution, gives a stable LAN VIP | Most common choice for bare-metal k3s, but is LAN-IP-based — cuts against this repo's established "avoid LAN IPs where possible" convention (see [[Nodes and Network]]) |
| **Tailscale Kubernetes Operator** | `loadBalancerClass: tailscale`, exposes Services directly on the tailnet with MagicDNS | More consistent with the repo's existing Tailscale-over-LAN-IP preference, used everywhere else in this stack |

## Related

- [[k3s Cluster]]
- [[Node Power Control]]
- [[Public Access - Edge]] — a different (already-solved) problem: exposing
  a service to the *public internet*, not giving in-cluster Services a
  stable internal address. Don't conflate the two.
