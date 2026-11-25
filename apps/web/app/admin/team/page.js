import AdminPage from '@/components/AdminPage'
import AdminCardList from '@/components/AdminCardList'
import Badge from '@/components/Badge'
import StaffInviteForm from '@/components/StaffInviteForm'
import StaffMemberActions from '@/components/StaffMemberActions'
import { copy } from '@/copy/en'
import { adminGet, requireAdmin } from '@/lib/admin'

const text = copy.admin.team

export const metadata = { title: text.title }

function Member({ item: member, viewerId }) {
  const isYou = member.id === viewerId
  const isActive = !member.deleted_at
  return (
    <li className="rounded-panel border border-separator bg-surface p-5 shadow-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-section">{member.full_name}</h2>
          <p className="truncate text-cell text-label-2">{member.email}</p>
        </div>
        <div className="flex gap-2">
          <Badge tone={member.role === 'admin' ? 'accent' : 'neutral'}>
            {text.roles[member.role]}
          </Badge>
          {!isActive && <Badge tone="warning">{text.inactive}</Badge>}
          {isYou && <Badge>{text.you}</Badge>}
        </div>
      </div>
      {!isYou && (
        <div className="mt-3">
          <StaffMemberActions id={member.id} role={member.role} isActive={isActive} />
        </div>
      )}
    </li>
  )
}

export default async function AdminTeamPage() {
  const { token, profile } = await requireAdmin()
  const { data, error } = await adminGet('/admin/staff', token)
  return (
    <AdminPage title={text.title} subtitle={text.subtitle} isNarrow>
      <AdminCardList
        items={data}
        error={error}
        Card={Member}
        cardProps={{ viewerId: profile.id }}
      />
      <StaffInviteForm />
    </AdminPage>
  )
}
