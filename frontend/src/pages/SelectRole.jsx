import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  Briefcase,
  Code2,
  UserCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Building2,
  User,
  Compass,
  ArrowDown,
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { PLATFORM_NAME } from '../brand'

const HIRING_ROLES = [
  {
    id: 'recruiter',
    track: 'hiring',
    category: 'Hiring Assessor',
    title: 'Recruiter / Hiring Manager',
    tagline: 'Screen candidates in 11 Indian & code-mixed languages',
    icon: Briefcase,
    desc: 'Deploy high-throughput first-round voice screenings for software engineering and BDA sales candidates with instant JD keyterm boosting and realistic enterprise objection handling.',
    capabilities: [
      'Code-mixed Hinglish & regional Indic ASR via Gnani Prisma',
      'Candidate comparison matrix with sortable benchmarked scores',
      'Single-claimer tokenized links with custom expiry windows',
    ],
    audience: 'Talent acquisition teams, HR leaders & staffing firms',
    orgLabel: 'Company or Organization name',
    orgPlaceholder: 'e.g. Acme Technologies India',
  },
  {
    id: 'candidate',
    track: 'hiring',
    category: 'Hiring Candidate',
    title: 'Job Candidate',
    tagline: 'Complete company screenings & mock interviews',
    icon: UserCheck,
    desc: 'Claim official screening links from recruiters or practice sales pitch and engineering interview questions before company rounds in a real-time voice room.',
    capabilities: [
      'Browser voice studio with WebRTC real-time connection',
      'Comprehensive 6-axis report with actionable improvement areas',
      'Fast-track tokenized claim with session security protection',
    ],
    audience: 'Active job seekers, lateral hires & interview applicants',
    orgLabel: 'Target role or domain (optional)',
    orgPlaceholder: 'e.g. Backend SDE / BDA Specialist',
  },
]

const ACADEMIC_ROLES = [
  {
    id: 'teacher',
    track: 'academic',
    category: 'Academic Assessor',
    title: 'Faculty / Professor',
    tagline: 'Conduct oral vivas & live coding defenses',
    icon: GraduationCap,
    desc: 'Assign practical coding problems in Python, C, C++, or Java. Listen to students explain their algorithms live over WebRTC and review 6-axis graded scorecards with Big-O oral defense metrics.',
    capabilities: [
      'Split-screen live code editor with compiler diagnostics',
      'Time & space complexity oral defense verification in 11 languages',
      'Class viva roster table with exportable PDF scorecards',
    ],
    audience: 'Universities, engineering colleges & lab instructors',
    orgLabel: 'University or College name',
    orgPlaceholder: 'e.g. COEP Technological University',
  },
  {
    id: 'student',
    track: 'academic',
    category: 'Academic Candidate',
    title: 'Student',
    tagline: 'Take assigned vivas & practice oral defense aloud',
    icon: Code2,
    desc: 'Complete assigned lab examinations from your professor or practice solving coding challenges while articulating algorithmic complexity in Hinglish, Hindi, Marathi, or English.',
    capabilities: [
      'Interactive compiler sandbox with 3 guided defense attempts',
      'Instant feedback on algorithmic logic, fluency, and confidence',
      'Private practice history and professor-released grade reports',
    ],
    audience: 'Engineering students & computer science undergraduates',
    orgLabel: 'College or Institute name',
    orgPlaceholder: 'e.g. VJTI Mumbai',
  },
]

const ALL_ROLES = [...HIRING_ROLES, ...ACADEMIC_ROLES]

export default function SelectRole() {
  const {
    user,
    token,
    guestMode,
    guestRole,
    completeOnboarding,
  } = useContext(AuthContext)

  const navigate = useNavigate()

  // Default to currently active role or recruiter
  const initialRole = guestRole || user?.role || 'recruiter'
  const [selectedRole, setSelectedRole] = useState(initialRole)
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [organization, setOrganization] = useState(user?.organization || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.full_name) setFullName(user.full_name)
    if (user?.organization) setOrganization(user.organization)
  }, [user])

  const activeMeta = ALL_ROLES.find((r) => r.id === selectedRole) || ALL_ROLES[0]
  const isGuest = Boolean(guestMode && !token)
  const hasExistingRole = Boolean((isGuest && guestRole) || (token && user?.role))

  const handleConfirmRole = async (e) => {
    if (e) e.preventDefault()
    if (!selectedRole) return
    setSaving(true)
    setError('')
    try {
      await completeOnboarding({
        role: selectedRole,
        full_name: fullName.trim() || user?.full_name || (isGuest ? 'Guest Explorer' : 'Explorer'),
        organization: organization.trim(),
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Could not configure role.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasExistingRole) {
      navigate('/dashboard')
    } else {
      navigate('/')
    }
  }

  const renderRoleCard = (role) => {
    const Icon = role.icon
    const isSelected = selectedRole === role.id
    return (
      <div
        key={role.id}
        onClick={() => setSelectedRole(role.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setSelectedRole(role.id)
          }
        }}
        style={{
          backgroundColor: 'var(--surface)',
          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          padding: '22px',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
          transition: 'border-color 140ms ease-out, box-shadow 140ms ease-out',
          width: '100%',
        }}
      >
        <div>
          {/* Card Top Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg)',
                  color: isSelected ? '#FFFFFF' : 'var(--text)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 140ms ease-out',
                }}
              >
                <Icon size={19} strokeWidth={1.5} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {role.category}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text)', margin: '2px 0 0 0' }}>
                  {role.title}
                </h3>
              </div>
            </div>

            {/* Radio Checkmark Indicator */}
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                border: isSelected ? '2px solid var(--primary)' : '2px solid var(--border-strong)',
                backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSelected && <Check size={13} strokeWidth={2.5} />}
            </div>
          </div>

          {/* Tagline & Plain Description */}
          <div style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: '8px' }}>
            {role.tagline}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
            {role.desc}
          </p>

          {/* Key Capabilities */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              Key capabilities:
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {role.capabilities.map((cap, i) => (
                <li key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'baseline', gap: '8px', lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--success-text)', fontSize: '14px', lineHeight: 1 }}>•</span>
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Audience Footer */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Best for: <strong style={{ color: 'var(--text-secondary)' }}>{role.audience}</strong>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg)',
        minHeight: 'calc(100vh - 120px)',
        padding: '36px 20px 64px 20px',
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            onClick={handleCancel}
            className="btn-ghost"
            style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            {hasExistingRole ? 'Return to workspace' : 'Back to home'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pn-badge pn-badge-primary">
              <Compass size={13} strokeWidth={1.5} />
              {isGuest ? 'Guest persona switcher' : 'Workspace onboarding'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {PLATFORM_NAME}
            </span>
          </div>
        </div>

        {/* Page Title & Subtitle */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: 'var(--text)',
              margin: '0 0 8px 0',
            }}
          >
            {isGuest ? 'Choose a persona to explore IntervAI' : 'Select your workspace role'}
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              maxWidth: '740px',
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            IntervAI configures specialized assessment rubrics, live interview rooms, and candidate scorecards based on your selected role. Select an active persona below to proceed.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '1px solid var(--border-strong)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-btn)',
              marginBottom: '24px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {/* ── TWO PARALLEL WORKSPACE TRACKS ── */}
        {/* Track 1: Hiring (Recruiter -> Job Candidate placed in center below Recruiter) */}
        {/* Track 2: Academic (Faculty -> Student placed in center below Faculty) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          {/* TRACK 1: Corporate Hiring & Candidate Screening */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
            }}
          >
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <Briefcase size={16} strokeWidth={1.5} color="var(--primary)" />
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                  Corporate Hiring &amp; Screening Track
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Hiring workflows: Recruiter creates assessment links; Candidate completes screening.
              </p>
            </div>

            {/* Recruiter / Hiring Manager Card */}
            {renderRoleCard(HIRING_ROLES[0])}

            {/* Centered Connector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
              <ArrowDown size={14} strokeWidth={1.5} />
              <span>Job Candidate participates in recruiter screening</span>
              <ArrowDown size={14} strokeWidth={1.5} />
            </div>

            {/* Job Candidate Card (Placed in Center Directly Below Recruiter) */}
            {renderRoleCard(HIRING_ROLES[1])}
          </div>

          {/* TRACK 2: Academic Vivas & University Labs */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
            }}
          >
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <GraduationCap size={16} strokeWidth={1.5} color="var(--primary)" />
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                  University Labs &amp; Academic Viva Track
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Academic workflows: Faculty assigns coding viva links; Student defends code orally.
              </p>
            </div>

            {/* Faculty / Professor Card */}
            {renderRoleCard(ACADEMIC_ROLES[0])}

            {/* Centered Connector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
              <ArrowDown size={14} strokeWidth={1.5} />
              <span>Student joins professor viva &amp; defends code</span>
              <ArrowDown size={14} strokeWidth={1.5} />
            </div>

            {/* Student Card (Placed in Center Directly Below Faculty) */}
            {renderRoleCard(ACADEMIC_ROLES[1])}
          </div>
        </div>

        {/* Authenticated User Setup Fields */}
        {token && (
          <div
            className="panel"
            style={{
              padding: '24px',
              marginBottom: '32px',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
              Your profile details
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              This information is prefilled on screening links and official scorecard reports you generate.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', display: 'block', marginBottom: '6px' }}>
                  Full name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Sharma or Priya Deshmukh"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', display: 'block', marginBottom: '6px' }}>
                  {activeMeta.orgLabel}
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder={activeMeta.orgPlaceholder}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div
          className="panel"
          style={{
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-strong)',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Ready to launch workspace for:
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
              {activeMeta.title}
              <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '8px' }}>
                ({activeMeta.category})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {hasExistingRole && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '14px' }}
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirmRole}
              disabled={saving}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '14px' }}
            >
              {saving
                ? 'Configuring workspace...'
                : `Enter ${activeMeta.title} workspace`}
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
