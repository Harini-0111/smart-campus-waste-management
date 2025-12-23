const Skeleton = ({ className = "" }) => (
    <div className={`shimmer-skeleton ${className}`}></div>
);

export const CardSkeleton = () => (
    <div className="premium-card p-10 space-y-6">
        <div className="flex items-center gap-6">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div className="space-y-3 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-2/3" />
            </div>
        </div>
        <div className="space-y-4 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    </div>
);

export const ListSkeleton = ({ items = 3 }) => (
    <div className="space-y-6">
        {[...Array(items)].map((_, i) => (
            <div key={i} className="flex gap-6 items-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="w-24 h-8 rounded-lg" />
            </div>
        ))}
    </div>
);

export const ChartSkeleton = () => (
    <div className="premium-card p-10 h-80 flex flex-col justify-end gap-4">
        <div className="flex items-end justify-between h-full gap-4">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <Skeleton key={i} className="w-full rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
        </div>
        <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
        </div>
    </div>
);

export default Skeleton;
