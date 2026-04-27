import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function PendingReview({ status, message }: { status: string; message?: string }) {
    const isUnderReview = status === 'UNDER_REVIEW';

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-500">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                isUnderReview ? 'bg-[#FFFBEB] text-[#B45309]' : 'bg-[#F3F4F6] text-[#6B7280]'
            }`}>
                {isUnderReview ? <AlertCircle size={40} /> : <CheckCircle2 size={40} />}
            </div>
            
            <div className="text-center max-w-md">
                <h1 className="font-display text-2xl font-bold text-[#0F1117] mb-3">
                    {isUnderReview ? 'An admin is reviewing your application' : 'Application submitted, awaiting review'}
                </h1>
                
                <p className="text-[#6B7280] text-sm leading-relaxed">
                    {message || (isUnderReview 
                        ? 'We are actively verifying your business details and documents. You will receive an email shortly once the process is complete.' 
                        : 'Thank you for submitting your profile. Our team will begin the verification process soon.')}
                </p>
                
                <div className="mt-8 p-4 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#6B7280] flex gap-3 text-left shadow-sm">
                    <span className="text-lg">ℹ️</span>
                    <p>Usually takes 24-48 business hours. You can safely log out and check back later.</p>
                </div>
            </div>
        </div>
    );
}
