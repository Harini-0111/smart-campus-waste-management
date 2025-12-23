const Skeleton = ({ className = "" }) => (
    <div className={`shimmer-skeleton ${className}`}></div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-12 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="premium-card p-8 border-l-4 border-slate-100">
                    <Skeleton className="h-4 w-1/3 mb-4" />
                    <Skeleton className="h-10 w-2/3" />
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 premium-card p-12 aspect-video">
                <Skeleton className="h-8 w-1/4 mb-10" />
                <Skeleton className="h-full w-full rounded-2xl" />
            </div>
            <div className="premium-card p-0 flex flex-col h-[650px]">
                <div className="p-10 border-b border-slate-100 flex justify-between">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-1/4 rounded-full" />
                </div>
                <div className="p-8 space-y-8">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-6 items-center">
                            <Skeleton className="w-14 h-14 rounded-2xl" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const TableSkeleton = () => (
    <div className="premium-card overflow-hidden">
        <div className="p-10 border-b border-slate-100">
            <Skeleton className="h-8 w-1/4" />
        </div>
        <div className="p-0">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="p-10 border-b border-slate-50 flex gap-12 items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            ))}
        </div>
    </div>
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
            <div key={i} className="premium-card p-8 space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        ))}
    </div>
);

export const ChartSkeleton = () => (
    <div className="premium-card p-10">
        <Skeleton className="h-8 w-1/4 mb-8" />
        <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
);

export default Skeleton;
