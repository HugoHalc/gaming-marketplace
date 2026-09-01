export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] animate-pulse px-4 py-6 sm:px-6 sm:py-8 lg:px-8 motion-reduce:animate-none">
      <div className="h-3 w-28 rounded bg-white/[0.06]" />
      <div className="mt-3 h-8 w-64 max-w-full rounded bg-white/[0.07]" />
      <div className="mt-3 h-4 w-[420px] max-w-full rounded bg-white/[0.05]" />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-2xl border border-white/[0.06] bg-[#0E1411]"
          />
        ))}
      </div>

      <div className="mt-8 h-[330px] rounded-[1.4rem] border border-white/[0.06] bg-[#0E1411]" />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.7fr)]">
        <div className="h-72 rounded-2xl border border-white/[0.06] bg-[#0E1411]" />
        <div className="h-72 rounded-2xl border border-white/[0.06] bg-[#0E1411]" />
      </div>
    </div>
  );
}
