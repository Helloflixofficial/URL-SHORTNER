import PlanEditor from '@/components/admin/plan-editor'

export const metadata = { title: 'New Plan — Admin' }

export default function NewPlanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          New <span className="gradient-text">Plan</span>
        </h1>
        <p className="text-muted-foreground mt-1">Create a new subscription tier</p>
      </div>
      <PlanEditor />
    </div>
  )
}
