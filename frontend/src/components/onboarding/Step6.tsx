interface Props {
  isLoading: boolean
  isDone: boolean
}

export default function Step6({ isLoading, isDone }: Props) {
  return (
    <div className="text-center py-8">
      {isLoading && !isDone ? (
        <>
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-2">Setting things up…</h2>
          <p className="text-slate-400">Initializing your workspace and running first scan</p>
        </>
      ) : isDone ? (
        <>
          <div className="w-16 h-16 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Setup complete!</h2>
          <p className="text-slate-400">Taking you to your dashboard…</p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 mx-auto mb-6 bg-accent/20 rounded-full flex items-center justify-center text-3xl">
            🚀
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Ready to launch!</h2>
          <p className="text-slate-400">Click Finish to complete setup and go to your dashboard.</p>
        </>
      )}
    </div>
  )
}
