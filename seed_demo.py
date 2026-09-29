import os
import sys
import logging
from datetime import datetime, timedelta

# Add workspace to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.database import SessionLocal, engine, Base
from backend.models.db_models import Incident, MemoryActivity
from backend.services.hindsight_service import hindsight_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_demo")

DEMO_INCIDENTS = [
    {
        "id": "INC-001",
        "title": "Abnormal PowerShell Execution with Base64 Encoded Payload",
        "incident_type": "Suspicious PowerShell",
        "description": "Endpoint sensor alerted on powershell.exe executing encoded command `-e aW52b2tlLXdlYnJlcXVlc3Q...` on financial workstation WS-402.",
        "affected_system": "Finance Workstation WS-402",
        "observed_indicators": "Process: powershell.exe, Command: encoded string, Parent: cmd.exe, Host: WS-402",
        "severity": "High",
        "status": "Resolved",
        "days_ago": 15,
        "confirmed_root_cause": "Malicious macro in spear-phishing document executed embedded obfuscated PowerShell downloader.",
        "actions_attempted": "Killed PowerShell process and isolated host from domain network.",
        "actions_failed": "Leaving host online allowed secondary scheduled task payload to re-trigger execution.",
        "successful_remediation": "Terminated parent process tree, isolated workstation, removed scheduled task 'WinUpdateCheck', and wiped host image.",
        "lessons_learned": "PowerShell execution must be correlated with parent process and persistence mechanisms (scheduled tasks/registry run keys) must be purged immediately.",
        "analyst_feedback": "Fast resolution once persistence mechanism was identified."
    },
    {
        "id": "INC-002",
        "title": "OAuth Token Abuse & Suspicious Mailbox Forwarding Rule",
        "incident_type": "Phishing",
        "description": "Executive assistant mailbox set up automatic forwarding rule to external Gmail account after interacting with fake DocuSign portal.",
        "affected_system": "Microsoft 365 Exchange Online",
        "observed_indicators": "RuleName: 'Invoice', ForwardTo: external-audit-docs@gmail.com, AppId: 8a42b109",
        "severity": "Critical",
        "status": "Resolved",
        "days_ago": 12,
        "confirmed_root_cause": "Consent-grant phishing attack where user granted permissions to malicious third-party OAuth application.",
        "actions_attempted": "Deleted email forwarding rule and reset user password.",
        "actions_failed": "Password reset alone DID NOT stop access because malicious OAuth refresh token remained valid.",
        "successful_remediation": "Revoked OAuth application authorization token in Microsoft Entra ID, purged forwarding rule, and invalidated all refresh tokens.",
        "lessons_learned": "Password resets do not invalidate OAuth tokens. SOC analysts must always check and revoke OAuth consents during phishing investigations.",
        "analyst_feedback": "OAuth token revocation is mandatory for cloud identity compromises."
    },
    {
        "id": "INC-003",
        "title": "Distributed Password Spraying & Exfiltration",
        "incident_type": "Credential Compromise",
        "description": "500 failed login attempts across 40 accounts, followed by successful login to account 'jdoe' from unknown IP 198.51.100.45 and high volume outbound traffic.",
        "affected_system": "Active Directory / Corporate VPN Gateway",
        "observed_indicators": "IP: 198.51.100.45, Target User: jdoe, Outbound Traffic: 4.2 GB to target-c2.net",
        "severity": "Critical",
        "status": "Resolved",
        "days_ago": 10,
        "confirmed_root_cause": "Compromised employee credentials via distributed password spray attack.",
        "actions_attempted": "Blocked source IP address 198.51.100.45 at perimeter firewall.",
        "actions_failed": "Blocking only the source IP failed because attackers immediately rotated egress proxies to resume exfiltration.",
        "successful_remediation": "Disabled compromised user account, revoked active SSO/VPN sessions, forced credential reset, enforced hardware FIDO2 MFA, and blocked destination C2 domain.",
        "lessons_learned": "IP-only perimeter blocks fail against distributed proxy networks; immediate identity invalidation and session purge are mandatory.",
        "analyst_feedback": "Crucial historical case: identity revocation is 10x more effective than IP blocking."
    },
    {
        "id": "INC-004",
        "title": "Unauthorized LSASS Memory Access Attempt",
        "incident_type": "Privilege Escalation",
        "description": "EDR detected unexpected process mimikatz.exe attempting handle open to lsass.exe on domain controller DC-01.",
        "affected_system": "Domain Controller DC-01",
        "observed_indicators": "TargetProcess: lsass.exe, SourceProcess: rundll32.exe, GrantedAccess: 0x1410",
        "severity": "Critical",
        "status": "Resolved",
        "days_ago": 8,
        "confirmed_root_cause": "Attacker leveraged compromised local admin service account to execute credential dumping.",
        "actions_attempted": "Terminated rundll32.exe process.",
        "actions_failed": "Simple process termination failed because attacker service account remained active and reinjected process.",
        "successful_remediation": "Isolated domain controller network interface, disabled compromised service account, rotated krbtgt password twice, and enabled LSASS Protected Process Light (PPL).",
        "lessons_learned": "Credential dumping attacks require immediate krbtgt password rotation and service account lockdown to prevent Golden Ticket creation.",
        "analyst_feedback": "krbtgt double-rotation stopped lateral movement instantly."
    },
    {
        "id": "INC-005",
        "title": "Suspicious DNS Tunneling Outbound Activity",
        "incident_type": "Abnormal Network Traffic",
        "description": "High volume of unusual TXT record DNS requests sent to subdomains of dynamic-dns-provider.xyz from database host DB-PROD-02.",
        "affected_system": "Database Server DB-PROD-02",
        "observed_indicators": "QueryType: TXT, Domain: *.dynamic-dns-provider.xyz, Rate: 450 queries/min",
        "severity": "High",
        "status": "Resolved",
        "days_ago": 7,
        "confirmed_root_cause": "Data exfiltration utility dnscat2 installed by rogue database contractor.",
        "actions_attempted": "Filtered outbound UDP port 53 traffic to external resolver.",
        "actions_failed": "Blocking external port 53 broke internal active directory DNS resolution.",
        "successful_remediation": "Configured internal DNS recursive resolver to Sinkhole *.dynamic-dns-provider.xyz, removed rogue dnscat2 binary, and revoked contractor database credentials.",
        "lessons_learned": "DNS tunneling should be blocked via domain sinkholing at recursive resolvers rather than blanket port 53 firewall drops.",
        "analyst_feedback": "Sinkholing preserved internal DNS uptime."
    },
    {
        "id": "INC-006",
        "title": "Ransomware Pre-Deployment Staging via Cobalt Strike",
        "incident_type": "Malware",
        "description": "EDR identified beaconing traffic matching Cobalt Strike malleability profile on file server FS-09.",
        "affected_system": "Core File Server FS-09",
        "observed_indicators": "URI: /jquery-3.3.1.min.js, UserAgent: Mozilla/5.0 (Windows NT 10.0; Win64; x64), Host: FS-09",
        "severity": "Critical",
        "status": "Resolved",
        "days_ago": 5,
        "confirmed_root_cause": "Cobalt Strike beacon dropped via unpatched vulnerability in web application server.",
        "actions_attempted": "Deleted file server payload binary.",
        "actions_failed": "Deleting the binary did not terminate active in-memory reflective DLL injection.",
        "successful_remediation": "Hard-isolated file server FS-09, terminated spawned svchost.exe worker threads, patched web application vulnerability, and restored clean shadow volume backup.",
        "lessons_learned": "Memory-resident beacons require host isolation and RAM thread termination; file system deletion alone is ineffective.",
        "analyst_feedback": "Host isolation prevented network-wide ransomware deployment."
    },
    {
        "id": "INC-007",
        "title": "Suspicious AWS S3 Bucket Public ACL Change",
        "incident_type": "Data Exfiltration",
        "description": "CloudTrail alert triggered for PutBucketAcl making production customer backup bucket publicly readable.",
        "affected_system": "AWS S3 - prod-customer-backups-2026",
        "observed_indicators": "EventName: PutBucketAcl, Principal: arn:aws:iam::123456789012:user/dev-ci, Permission: READ",
        "severity": "High",
        "status": "Resolved",
        "days_ago": 4,
        "confirmed_root_cause": "Misconfigured Terraform CI/CD pipeline script applied overly permissive wildcard ACL policy.",
        "actions_attempted": "Manually edited S3 bucket permissions in AWS console.",
        "actions_failed": "Manual console edit was overwritten within 30 minutes by automated CI/CD pipeline execution.",
        "successful_remediation": "Enabled AWS S3 Block Public Access at account level, fixed Terraform manifest template, and invalidated exposed CI access keys.",
        "lessons_learned": "Cloud misconfigurations must be remediated at both account policy and IaC source code levels to prevent automated regression.",
        "analyst_feedback": "Account-level S3 Public Block prevents IaC override."
    },
    {
        "id": "INC-008",
        "title": "Spear-Phishing Campaign Targeting Finance Department",
        "incident_type": "Phishing",
        "description": "Multiple accounting staff received emails claiming urgent wire transfer request from CEO with link to credential harvester.",
        "affected_system": "Email Gateway / Finance Users",
        "observed_indicators": "Sender: ceo-office@corporate-updates-verify.com, Link: login-verify-auth.net",
        "severity": "High",
        "status": "Resolved",
        "days_ago": 3,
        "confirmed_root_cause": "External domain spoofing campaign targeting executive impersonation.",
        "actions_attempted": "Sent email warning to finance team.",
        "actions_failed": "Warning email arrived after two users had already clicked the phishing link.",
        "successful_remediation": "Purged phishing emails from all inbox mailboxes using Exchange PowerShell, blocked domain login-verify-auth.net, and reset credentials for users who clicked.",
        "lessons_learned": "Automated mailbox purge (Search-Mailbox -DeleteContent) must be executed immediately upon detection of phishing campaigns.",
        "analyst_feedback": "Automated purge contained campaign within 10 minutes."
    },
    {
        "id": "INC-009",
        "title": "Unusual SSH Access from Tor Exit Node",
        "incident_type": "Suspicious Login",
        "description": "Successful SSH authentication to jump host SSH-GATEWAY from known Tor exit IP 185.220.101.5.",
        "affected_system": "Linux Gateway SSH-GATEWAY",
        "observed_indicators": "IP: 185.220.101.5, AuthMethod: publickey, User: sysadmin-dev",
        "severity": "High",
        "status": "Resolved",
        "days_ago": 2,
        "confirmed_root_cause": "DevOps engineer used Tor browser for remote troubleshooting without authorization.",
        "actions_attempted": "Disabled SSH port 22.",
        "actions_failed": "Disabling port 22 blocked legitimate admin operations across all data centers.",
        "successful_remediation": "Configured SSH daemon to mandate IP whitelist + hardware YubiKey MFA authentication and updated remote work security policy.",
        "lessons_learned": "Enforce MFA and IP gateway whitelisting on admin jump hosts rather than closing management ports.",
        "analyst_feedback": "Policy clarification and hardware MFA resolved issue without operational outage."
    },
    {
        "id": "INC-010",
        "title": "Unauthorized Active Directory Object Creation",
        "incident_type": "Privilege Escalation",
        "description": "Event ID 5136 logged 50 new shadow admin computer objects created under Domain Computers container.",
        "affected_system": "Active Directory Domain Controller DC-02",
        "observed_indicators": "EventID: 5136, Attribute: sAMAccountName, Creator: SVC-Backup",
        "severity": "Critical",
        "status": "Resolved",
        "days_ago": 1,
        "confirmed_root_cause": "Resource-Based Constrained Delegation (RBCD) attack vector exploited via compromised service account.",
        "actions_attempted": "Deleted newly created computer objects.",
        "actions_failed": "Deleting objects failed to strip compromised msDS-AllowedToActOnBehalfOfOtherIdentity DACL attributes.",
        "successful_remediation": "Cleared msDS-AllowedToActOnBehalfOfOtherIdentity attributes, reset SVC-Backup password, and restricted service account creation rights.",
        "lessons_learned": "RBCD attacks require clearing specific delegation attributes on target computer objects, not just deleting created rogue objects.",
        "analyst_feedback": "Clearing DACL attributes prevented persistent privilege escalation."
    }
]

def seed_database():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check existing
        existing_count = db.query(Incident).count()
        if existing_count > 0:
            logger.info(f"Database already contains {existing_count} incidents. Skipping duplicate creation.")
        else:
            logger.info("Seeding synthetic cybersecurity incidents into SQLite database...")
            for inc in DEMO_INCIDENTS:
                created_dt = datetime.utcnow() - timedelta(days=inc["days_ago"])
                resolved_dt = created_dt + timedelta(hours=4)

                db_inc = Incident(
                    id=inc["id"],
                    title=inc["title"],
                    incident_type=inc["incident_type"],
                    description=inc["description"],
                    affected_system=inc["affected_system"],
                    observed_indicators=inc["observed_indicators"],
                    severity=inc["severity"],
                    status=inc["status"],
                    created_at=created_dt,
                    updated_at=resolved_dt,
                    resolved_at=resolved_dt,
                    confirmed_root_cause=inc["confirmed_root_cause"],
                    actions_attempted=inc["actions_attempted"],
                    actions_failed=inc["actions_failed"],
                    successful_remediation=inc["successful_remediation"],
                    lessons_learned=inc["lessons_learned"],
                    analyst_feedback=inc["analyst_feedback"],
                    memory_used=True
                )
                db.add(db_inc)
                db.add(MemoryActivity(
                    incident_id=inc["id"],
                    action_type="RETAIN",
                    details=f"Demo experience retained for {inc['id']}: {inc['title'][:40]}...",
                    timestamp=resolved_dt
                ))
            db.commit()
            logger.info(f"Successfully seeded {len(DEMO_INCIDENTS)} incidents into SQLite database.")

        # Retain into Hindsight persistent memory
        logger.info("Retaining resolved demo incident experiences into Hindsight memory bank...")
        hindsight_count = 0
        for inc in DEMO_INCIDENTS:
            res = hindsight_service.retain_incident_experience(
                incident_id=inc["id"],
                title=inc["title"],
                incident_type=inc["incident_type"],
                description=inc["description"],
                affected_system=inc["affected_system"],
                observed_indicators=inc["observed_indicators"],
                confirmed_root_cause=inc["confirmed_root_cause"],
                actions_attempted=inc["actions_attempted"],
                actions_failed=inc["actions_failed"],
                successful_remediation=inc["successful_remediation"],
                lessons_learned=inc["lessons_learned"],
                analyst_feedback=inc["analyst_feedback"]
            )
            if res.get("success"):
                hindsight_count += 1
        
        logger.info(f"Hindsight seeding finished: {hindsight_count}/{len(DEMO_INCIDENTS)} experiences successfully retained in Hindsight.")
        logger.info("Demo seeding complete!")

    except Exception as e:
        logger.error(f"Error during database seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
