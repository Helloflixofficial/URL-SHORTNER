export default function Loading() {
  return (
    <div className="flex-1 w-full h-full min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse text-sm">Loading...</p>
      </div>
    </div>
  )
}
