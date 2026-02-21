interface Props {
  value: string
  onChange: (v: string) => void
}

export default function Step1({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Welcome to PulseScore</h2>
      <p className="text-slate-400 mb-8">Let's get your workspace set up. What's your company name?</p>
      <label className="block text-sm text-slate-400 mb-2">Company name</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Acme Corp"
        className="w-full px-4 py-3 bg-card border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-accent transition"
      />
    </div>
  )
}
