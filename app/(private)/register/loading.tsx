import { Skeleton } from "@/components/ui/skeleton"

export default function RegisterLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <Skeleton className="h-32 rounded-xl" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-96 rounded-xl" />
    </main>
  )
}
