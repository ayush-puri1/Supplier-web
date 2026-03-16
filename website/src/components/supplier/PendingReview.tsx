export default function PendingReview({ status }: { status: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center border-4 border-blue-500/30">
                <span className="text-4xl animate-pulse">⏳</span>
            </div>
            <div className="text-center max-w-md">
                <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
                    {status === 'CONDITIONAL' ? 'Additional Info Needed' : 'Application Under Review'}
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    {status === 'CONDITIONAL' 
                        ? 'Your application needs a few more details. Please check your email or wait for manager contact.' 
                        : 'Thank you for submitting your business details! Our admin team is currently reviewing your application. You will be notified via email once approved.'}
                </p>
                <div className="mt-8 p-4 rounded-xl glass border border-border text-sm text-muted-foreground flex gap-3 text-left">
                    <span className="text-xl">ℹ️</span>
                    <p>Usually takes 24-48 business hours. You can safely log out and check back later.</p>
                </div>
            </div>
        </div>
    );
}
