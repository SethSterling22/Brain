---
tags: [homelab, k3s, kubernetes]
---

# k3s Cluster

Part of [[Homelab MOC]]. See [[Nodes and Network]] for node addressing.

## Topology

```
k3s v1.35.5+k3s1
Subnet: 192.168.68.0/24

Sadida  → control-plane (runs directly on the Proxmox host, not inside a VM)
Aery    → worker (also runs Nextcloud outside the cluster)
Ocra    → worker (also runs the Docker Compose automation/monitoring stack outside the cluster)
Sram    → worker (24/7, dev environments)
Xelor   → worker (on-demand)
Sacro   → worker (on-demand, observability)
```

Workers join using their **Tailscale IP**, not LAN IP — see the addressing
convention in [[Nodes and Network]]. This means the cluster keeps working
across LAN reconfigurations; `scripts/k3s/join-worker.sh` hardcodes the
Tailscale IPs for exactly this reason.

## Ingress

**Traefik** ships with k3s and is already deployed, handling L7 load
distribution across pod replicas for whatever's deployed. It does not by
itself give a stable *external* entry point for `type: LoadBalancer`
Services — that's the open question tracked in
[[Roadmap - Load Balancer]].

## AI namespace (`k3s/manifests/ai/`)

- `ollama.yaml` — an `ExternalName` Service,
  `ollama.ai.svc.cluster.local:11434` → Sadida over Tailscale. Lets pods
  inside the cluster reach Ollama without knowing it's actually a host
  service outside k3s entirely.
- `apps.yaml` — an optional chat web UI (**OpenClaw**) that talks to Ollama
  through that Service.

See [[AI Infra - Ollama]] for the full picture of how Ollama fits into the
rest of the stack.

## Manifest layout (per `k3s/manifests/`)

Namespaces, storage classes, and ingress rules live alongside the `ai/`
manifests above — the general pattern is one namespace per concern
(monitoring, ai, etc.), provisioned via `kubectl apply` after the cluster is
joined.

## Provisioning

1. **Ansible + k3s install** on Sadida (control-plane) first, then workers
   join via `scripts/k3s/join-worker.sh` using their Tailscale IPs.
2. On-demand workers (Xelor, Sacro) must be woken first — see
   [[Node Power Control]] — before they can be provisioned or rejoin.

## Related

- [[Nodes and Network]]
- [[Node Power Control]] — draining a node from k3s is step one of a safe
  shutdown, wired through the Control API.
- [[Roadmap - Load Balancer]]
- [[AI Infra - Ollama]]
