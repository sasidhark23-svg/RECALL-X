import logging
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.config import settings

logger = logging.getLogger("hindsight_service")

class HindsightService:
    def __init__(self):
        self.base_url = settings.HINDSIGHT_API_URL
        self.api_key = settings.HINDSIGHT_API_KEY
        self.bank_id = settings.HINDSIGHT_BANK_ID
        self._client = None

    def _get_client(self):
        """Lazy load and initialize official Hindsight client."""
        if self._client is not None:
            return self._client
        
        try:
            from hindsight_client import Hindsight
            client_kwargs = {"base_url": self.base_url}
            if self.api_key:
                client_kwargs["api_key"] = self.api_key
            self._client = Hindsight(**client_kwargs)
            return self._client
        except Exception as e:
            logger.error(f"Failed to initialize Hindsight client: {e}")
            return None

    def check_health(self) -> bool:
        """Check if Hindsight service is reachable."""
        try:
            client = self._get_client()
            if not client:
                return False
            # Ping version or list banks
            if hasattr(client, 'get_version'):
                client.get_version()
                return True
            return True
        except Exception as e:
            logger.warning(f"Hindsight health check failed: {e}")
            return False

    def retain_incident_experience(
        self,
        incident_id: str,
        title: str,
        incident_type: str,
        description: str,
        affected_system: str,
        observed_indicators: str,
        confirmed_root_cause: str,
        actions_attempted: str,
        actions_failed: str,
        successful_remediation: str,
        lessons_learned: str,
        analyst_feedback: str = ""
    ) -> Dict[str, Any]:
        """
        Formats and retains an incident experience into Hindsight memory.
        Returns result status dictionary.
        """
        client = self._get_client()
        if not client:
            return {
                "success": False,
                "status": "unavailable",
                "message": "Memory service unavailable."
            }

        # Build comprehensive semantic document
        content = (
            f"HISTORICAL INCIDENT EXPERIENCE RECORD\n"
            f"Incident ID: {incident_id}\n"
            f"Title: {title}\n"
            f"Category/Type: {incident_type}\n"
            f"Affected System: {affected_system}\n"
            f"Symptoms & Description: {description}\n"
            f"Observed Indicators: {observed_indicators}\n"
            f"Confirmed Root Cause: {confirmed_root_cause}\n"
            f"Attempted Actions: {actions_attempted}\n"
            f"FAILED REMEDIATION ATTEMPTS: {actions_failed}\n"
            f"SUCCESSFUL REMEDIATION ACTIONS: {successful_remediation}\n"
            f"LESSONS LEARNED: {lessons_learned}\n"
            f"Analyst Feedback: {analyst_feedback}\n"
            f"Retained Timestamp: {datetime.utcnow().isoformat()}"
        )

        metadata = {
            "incident_id": incident_id,
            "title": title,
            "incident_type": incident_type,
            "affected_system": affected_system,
            "confirmed_root_cause": confirmed_root_cause,
            "actions_failed": actions_failed,
            "successful_remediation": successful_remediation,
            "lessons_learned": lessons_learned,
            "symptoms": description
        }

        tags = ["incident_experience", incident_type.lower().replace(" ", "_"), incident_id.lower()]

        try:
            response = client.retain(
                bank_id=self.bank_id,
                content=content,
                metadata=metadata,
                tags=tags
            )
            logger.info(f"Retained incident experience for {incident_id} in bank {self.bank_id}")
            return {
                "success": True,
                "status": "retained",
                "incident_id": incident_id,
                "response": str(response)
            }
        except Exception as e:
            logger.error(f"Error retaining experience in Hindsight for {incident_id}: {e}")
            return {
                "success": False,
                "status": "unavailable",
                "message": f"Memory service unavailable: {str(e)}"
            }

    def recall_relevant_incidents(
        self,
        incident_title: str,
        incident_type: str,
        description: str,
        indicators: str,
        limit: int = 5
    ) -> Dict[str, Any]:
        """
        Recalls semantically similar incident memories from Hindsight.
        Returns structured recall response or unavailable state.
        """
        client = self._get_client()
        if not client:
            return {
                "status": "unavailable",
                "message": "Memory service unavailable.",
                "memories": []
            }

        query = f"Category: {incident_type}. Title: {incident_title}. Description: {description}. Indicators: {indicators}"

        try:
            recall_resp = client.recall(
                bank_id=self.bank_id,
                query=query
            )

            results = getattr(recall_resp, 'results', [])
            recalled_list = []

            for r in results:
                # Extract fields from result metadata or text
                meta = getattr(r, 'metadata', {}) or {}
                text = getattr(r, 'text', '') or ''
                
                # Parse metadata or fallback text parsing
                inc_id = meta.get("incident_id") or "HIST-INC"
                inc_title = meta.get("title") or "Previous Incident Experience"
                symptoms = meta.get("symptoms") or description
                root_cause = meta.get("confirmed_root_cause") or "Extracted from historical memory"
                failed_actions = meta.get("actions_failed") or "None documented"
                successful_remediation = meta.get("successful_remediation") or text[:200]
                lessons_learned = meta.get("lessons_learned") or "Review past indicators carefully"

                relevance_explanation = (
                    f"Recalled due to matching threat patterns: '{incident_type}' and similar indicators."
                )

                score = None
                scores = getattr(r, 'scores', None)
                if scores and isinstance(scores, dict):
                    score = scores.get('score') or scores.get('semantic')

                recalled_list.append({
                    "incident_id": inc_id,
                    "incident_title": inc_title,
                    "relevance_explanation": relevance_explanation,
                    "symptoms": symptoms,
                    "root_cause": root_cause,
                    "failed_actions": failed_actions,
                    "successful_remediation": successful_remediation,
                    "lessons_learned": lessons_learned,
                    "relevance_score": score
                })

            return {
                "status": "active",
                "message": f"Successfully recalled {len(recalled_list)} relevant memories.",
                "memories": recalled_list[:limit]
            }

        except Exception as e:
            logger.error(f"Error recalling from Hindsight: {e}")
            return {
                "status": "unavailable",
                "message": f"Memory service unavailable: {str(e)}",
                "memories": []
            }

    def search_memory(self, query: str) -> Dict[str, Any]:
        """
        Searches organizational memory bank for a free-text prompt.
        """
        client = self._get_client()
        if not client:
            return {
                "status": "unavailable",
                "message": "Memory service unavailable.",
                "memories": []
            }

        try:
            recall_resp = client.recall(
                bank_id=self.bank_id,
                query=query
            )

            results = getattr(recall_resp, 'results', [])
            memories = []

            for r in results:
                meta = getattr(r, 'metadata', {}) or {}
                memories.append({
                    "id": getattr(r, 'id', ''),
                    "incident_id": meta.get("incident_id", "HIST-INC"),
                    "title": meta.get("title", "Historical Incident"),
                    "incident_type": meta.get("incident_type", "General Security"),
                    "symptoms": meta.get("symptoms", getattr(r, 'text', '')[:150]),
                    "root_cause": meta.get("confirmed_root_cause", "Unspecified"),
                    "failed_actions": meta.get("actions_failed", "None"),
                    "successful_remediation": meta.get("successful_remediation", getattr(r, 'text', '')),
                    "lessons_learned": meta.get("lessons_learned", "Documented in memory"),
                    "raw_text": getattr(r, 'text', '')
                })

            return {
                "status": "active",
                "message": f"Found {len(memories)} matching experiences.",
                "memories": memories
            }
        except Exception as e:
            logger.error(f"Error searching Hindsight memory: {e}")
            return {
                "status": "unavailable",
                "message": f"Memory service unavailable: {str(e)}",
                "memories": []
            }

hindsight_service = HindsightService()
