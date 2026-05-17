import { prisma } from '@/lib/prisma'
import PlanEditor from '@/components/admin/plan-editor'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Edit Plan — Admin' }

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plan = await prisma.plan.findUnique({ where: { id } })
  if (!plan) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display">
          Edit <span className="gradient-text">Plan</span>
        </h1>
        <p className="text-muted-foreground mt-1">Modify subscription tier details</p>
      </div>
      <PlanEditor initialData={plan} />
    </div>
  )
}
