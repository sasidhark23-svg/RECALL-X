import React, { useState } from 'react';
import { CheckCircle2, X, Brain, Send } from 'lucide-react';
import { api } from '../api';

export default function ResolveModal({ incident, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    confirmed_root_cause: '',
    actions_attempted: '',
    actions_failed: '',
    successful_remediation: '',
    lessons_learned: '',
    analyst_feedback: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !incident) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.confirmed_root_cause || !formData.successful_remediation || !formData.lessons_learned) {
      setError('Please fill in Root Cause, Successful Remediation, and Lessons Learned.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.resolveIncident(incident.id, formData);
      setSubmitting(false);
      onSuccess(res);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setError(err.response?.data?.detail || 'Failed to resolve incident.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#131B2A] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Resolve Incident & Teach Hindsight</h3>
              <p className="text-xs text-slate-400">Incident: <span className="text-blue-400 font-mono">{incident.id}</span> - {incident.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Confirmed Root Cause <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formData.confirmed_root_cause}
              onChange={(e) => setFormData({ ...formData, confirmed_root_cause: e.target.value })}
              placeholder="e.g. Compromised employee credentials via password spray attack."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Actions Attempted
              </label>
              <input
                type="text"
                value={formData.actions_attempted}
                onChange={(e) => setFormData({ ...formData, actions_attempted: e.target.value })}
                placeholder="e.g. IP blocking, account lockout"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 text-amber-300">
                Actions That Failed (Crucial for Hindsight!)
              </label>
              <input
                type="text"
                value={formData.actions_failed}
                onChange={(e) => setFormData({ ...formData, actions_failed: e.target.value })}
                placeholder="e.g. Blocking source IP failed as attackers rotated egress proxies"
                className="w-full bg-slate-900 border border-amber-900/60 focus:border-amber-500 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 text-emerald-300">
              Successful Remediation <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formData.successful_remediation}
              onChange={(e) => setFormData({ ...formData, successful_remediation: e.target.value })}
              placeholder="e.g. Disabled account, revoked active OAuth tokens, forced password reset, enforced hardware MFA."
              className="w-full bg-slate-900 border border-emerald-900/60 focus:border-emerald-500 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 text-purple-300">
              Lessons Learned <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formData.lessons_learned}
              onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
              placeholder="e.g. Password resets do not revoke OAuth refresh tokens; identity invalidation must precede perimeter blocks."
              className="w-full bg-slate-900 border border-purple-900/60 focus:border-purple-500 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Analyst Feedback (Optional)
            </label>
            <input
              type="text"
              value={formData.analyst_feedback}
              onChange={(e) => setFormData({ ...formData, analyst_feedback: e.target.value })}
              placeholder="e.g. Prior incident memory INC-003 saved 45 minutes of investigation time."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <Brain className="w-4 h-4" />
              <span>Will be retained in Hindsight memory bank</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-900/30"
              >
                {submitting ? (
                  <>Processing Retain...</>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    RESOLVE & TEACH RECALL-X
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
