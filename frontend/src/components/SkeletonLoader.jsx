const Skeleton = ({ className }) => (
    <div className={`animate-shimmer rounded-md ${className}`}></div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-8 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-white rounded-3xl p-6 border border-slate-200/60">
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-3/4" />
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 aspect-video bg-white rounded-[2.5rem] border border-slate-200/60 p-8">
                <Skeleton className="h-8 w-1/4 mb-10" />
                <Skeleton className="h-full w-full rounded-2xl" />
            </div>
            <div className="aspect-square bg-white rounded-[2.5rem] border border-slate-200/60 p-8">
                <Skeleton className="h-8 w-1/3 mb-10" />
                <div className="space-y-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4 items-center">
                            <Skeleton className="h-12 w-12 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const TableSkeleton = () => (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
            <Skeleton className="h-6 w-1/4" />
        </div>
        <div className="p-0">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="px-8 py-6 border-b border-slate-50 flex gap-10">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                </div>
            ))}
        </div>
    </div>
);

export default Skeleton;
