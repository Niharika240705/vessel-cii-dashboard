import CiiForm from "@/components/calculator/CiiForm"

export default function CalculatorPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Interactive CII Calculator</h1>
        <p className="text-sm text-slate-400 mt-1">Simulate end-of-year compliance ratings based on MEPC.337(76) guidelines.</p>
      </div>

      <CiiForm />
    </div>
  )
}
