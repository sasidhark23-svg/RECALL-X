# 🎬 RECALL-X 3-MINUTE HACKATHON DEMO SCRIPT

> **Presenter Guide for Demonstrating RECALL-X**

---

## ⏱️ Step-by-Step Presentation Timeline

### 0:00 - 0:30 | Step 1: Introduction & Problem Statement
* **Action**: Open Dashboard (`http://localhost:3000`).
* **Speaker Script**:
  > *"Welcome everyone. Traditional AI incident response tools suffer from amnesia. Every time a new cybersecurity incident occurs, the AI starts from zero. It forgets what root causes were uncovered, what containment actions failed, and what remediations actually worked in prior incidents.*
  > *This is RECALL-X: An AI Incident Response Agent That Learns From Every Incident using Vectorize Hindsight persistent memory."*

---

### 0:30 - 1:15 | Step 2: The Memory OFF Analysis (Generic Baseline)
* **Action**: Click **New Incident** in sidebar. Click **Fill Demo Incident** button. Set toggle to **MEMORY OFF**. Click **ANALYZE INCIDENT**.
* **Speaker Script**:
  > *"Let's submit a common SOC incident: 500 failed logins followed by a successful logon from an unknown IP and outbound C2 traffic.*
  > *With Hindsight Memory turned OFF, the AI behaves like standard LLMs. It generates a generic playbook recommending perimeter IP blocking.*
  > *However, in real distributed attacks, attackers rotate proxy IPs immediately—making IP blocking useless."*

---

### 1:15 - 2:00 | Step 3: The Memory ON Analysis (Experience-Informed Response)
* **Action**: Flip the prominent toggle to **MEMORY ON**. Click **ANALYZE INCIDENT (WITH HINDSIGHT MEMORY)**.
* **Speaker Script**:
  > *"Now let's enable Hindsight Persistent Memory and analyze the exact same incident.*
  > *Notice what happens: RECALL-X queries Hindsight and recalls historical incident `INC-003`.*
  > *Hindsight memory warns the agent that blocking source IPs previously failed in `INC-003`. Instead, the AI shifts strategy—prioritizing immediate user account disablement, OAuth session revocation, and hardware MFA enforcement."*

---

### 2:00 - 2:30 | Step 4: Resolving an Incident & Retaining Experience
* **Action**: Click **MARK AS RESOLVED & TEACH RECALL-X**. Fill in:
  * Root Cause: *Password spray attack on remote user credentials.*
  * Failed Actions: *IP-only drop rule.*
  * Successful Remediation: *Revoked OAuth tokens and enforced hardware FIDO2 MFA.*
  * Lessons Learned: *Purge active sessions immediately; IP blocks are insufficient.*
* **Action**: Click **RESOLVE & TEACH RECALL-X**. Point to confirmation message.
* **Speaker Script**:
  > *"When the security analyst resolves an incident, they click 'Resolve & Teach RECALL-X'. This retains the confirmed root cause, what failed, and what worked directly into Hindsight memory bank. RECALL-X becomes smarter with every resolved incident."*

---

### 2:30 - 3:00 | Step 5: Memory Page & Closing
* **Action**: Click **Memory** in sidebar. Type: `"Have we seen suspicious PowerShell followed by outbound traffic before?"` Click **RECALL**.
* **Speaker Script**:
  > *"Finally, on the Memory page, analysts can query organizational memory using natural language to extract historical threat intelligence.*
  > *RECALL-X transforms isolated incident resolutions into persistent, reusable organizational knowledge. Thank you!"*
