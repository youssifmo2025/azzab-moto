import type { Compatibility } from '@/services/schemas/product'
import { useModels } from '@/features/vehicle-selector/hooks/useModels'

interface CompatibilityTableProps {
  compatibility: Compatibility[]
}

export function CompatibilityTable({ compatibility }: CompatibilityTableProps) {
  const { models } = useModels()

  if (!compatibility || compatibility.length === 0) {
    return (
      <p className="text-xs text-body italic">
        لم تُسجل مصفوفة توافق تفصيلية لهذه القطعة بعد. تواصل معنا على واتساب لتأكيد الموديل.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-start text-xs border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="py-2.5 pe-4 text-start font-heading font-bold text-heading">
              الموديل المتوافق
            </th>
            <th scope="col" className="py-2.5 px-4 text-start font-heading font-bold text-heading">
              سنوات الصنع
            </th>
            <th scope="col" className="py-2.5 ps-4 text-start font-heading font-bold text-heading">
              نوع التوافق
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {compatibility.map((item, idx) => {
            const model = models.find((m) => m.id === item.modelId)
            const modelName = model ? model.name : item.modelId
            const yearsRange =
              item.yearFrom === item.yearTo
                ? `${item.yearFrom}`
                : `${item.yearFrom} – ${item.yearTo}`

            return (
              <tr key={idx} className="hover:bg-alt/30 transition-colors">
                <td className="py-3 pe-4 font-semibold text-heading">{modelName}</td>
                <td className="py-3 px-4 font-numeric tabular text-body">{yearsRange}</td>
                <td className="py-3 ps-4 text-secondary">مطابقة مصنعية أصلية (OEM)</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
