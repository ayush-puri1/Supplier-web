'use client';

import { useState } from 'react';
import { fetchWithAuth } from '@/lib/api';

export default function OnboardingForm({ profile, onComplete }: { profile?: any; onComplete: () => void }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1
        companyName: profile?.companyName || '',
        gstNumber: profile?.gstNumber || '',
        panNumber: profile?.panNumber || '',
        businessType: profile?.businessType || 'Manufacturer',
        yearEstablished: profile?.yearEstablished || '',
        // Step 2
        contactName: profile?.contactName || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
        city: profile?.city || '',
        state: profile?.state || '',
        pincode: profile?.pincode || '',
        // Step 3 (files - mocked as strings for now, normally would be uploaded URLs)
        gstDoc: null as File | null,
        panDoc: null as File | null,
        businessDoc: null as File | null,
    });
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, [fieldName]: e.target.files![0] }));
        }
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async () => {
        setError('');
        setIsLoading(true);

        try {
            // First update profile
            await fetchWithAuth('/supplier/me', {
                method: 'PATCH',
                body: JSON.stringify({
                    companyName: formData.companyName,
                    gstNumber: formData.gstNumber,
                    panNumber: formData.panNumber,
                    businessType: formData.businessType,
                    yearEstablished: formData.yearEstablished ? parseInt(formData.yearEstablished as string) : 2024,
                    address: formData.address,
                    city: formData.city,
                }),
            });
            // Then submit for review (Mocking doc upload for now)
            await fetchWithAuth('/supplier/submit', {
                method: 'POST',
            });
            onComplete();
        } catch (err: any) {
            setError(err.message || 'Failed to submit onboarding form');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Progress bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs text-[#6B7280] mb-2">
                    <span>Step {currentStep} of 4</span>
                    <span>{Math.round((currentStep / 4) * 100)}% complete</span>
                </div>
                <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#0D9373] rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / 4) * 100}%` }} 
                    />
                </div>
            </div>

            <div className="card shadow-sm border border-[#E5E7EB]">
                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-[#FFF1F2] border border-[#FCA5A5] text-[#B91C1C] text-sm text-center">
                        {error}
                    </div>
                )}

                {/* STEP 1 */}
                {currentStep === 1 && (
                    <div className="animate-in fade-in duration-300">
                        <h2 className="font-display text-2xl font-bold text-[#0F1117] mb-6">Business Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="label">Business Name</label>
                                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="input-field" placeholder="Acme Corp" />
                            </div>
                            <div>
                                <label className="label">GST Number</label>
                                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="input-field uppercase" placeholder="22AAAAA0000A1Z5" />
                            </div>
                            <div>
                                <label className="label">PAN Number</label>
                                <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} className="input-field uppercase" placeholder="ABCDE1234F" />
                            </div>
                            <div>
                                <label className="label">Business Type</label>
                                <select name="businessType" value={formData.businessType} onChange={handleChange} className="input-field bg-white">
                                    <option value="Manufacturer">Manufacturer</option>
                                    <option value="Wholesaler">Wholesaler</option>
                                    <option value="Distributor">Distributor</option>
                                    <option value="Retailer">Retailer</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Year Established</label>
                                <input type="number" name="yearEstablished" value={formData.yearEstablished} onChange={handleChange} className="input-field" placeholder="e.g. 2010" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                    <div className="animate-in fade-in duration-300">
                        <h2 className="font-display text-2xl font-bold text-[#0F1117] mb-6">Contact Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="label">Primary Contact Name</label>
                                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="input-field" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="label">Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+91 9876543210" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="label">Business Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="123 Industrial Area, Phase 1" />
                            </div>
                            <div>
                                <label className="label">City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-field" placeholder="Mumbai" />
                            </div>
                            <div>
                                <label className="label">State</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} className="input-field" placeholder="Maharashtra" />
                            </div>
                            <div>
                                <label className="label">Pincode</label>
                                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="input-field" placeholder="400001" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                    <div className="animate-in fade-in duration-300">
                        <h2 className="font-display text-2xl font-bold text-[#0F1117] mb-6">Document Upload</h2>
                        <p className="text-[#6B7280] text-sm mb-6">Please upload clear copies (PDF, JPG, PNG) of your business documents for verification.</p>
                        
                        <div className="space-y-6">
                            <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-[#F9FAFB]">
                                <label className="font-medium text-[#0F1117] block mb-1">GST Certificate</label>
                                <p className="text-xs text-[#6B7280] mb-3">Upload your official GST registration certificate.</p>
                                <input type="file" onChange={(e) => handleFileChange(e, 'gstDoc')} className="text-sm text-[#6B7280] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ECFDF5] file:text-[#0D9373] hover:file:bg-[#D1FAE5] transition-colors cursor-pointer" />
                            </div>
                            
                            <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-[#F9FAFB]">
                                <label className="font-medium text-[#0F1117] block mb-1">PAN Card</label>
                                <p className="text-xs text-[#6B7280] mb-3">Upload a copy of the company or proprietor PAN card.</p>
                                <input type="file" onChange={(e) => handleFileChange(e, 'panDoc')} className="text-sm text-[#6B7280] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ECFDF5] file:text-[#0D9373] hover:file:bg-[#D1FAE5] transition-colors cursor-pointer" />
                            </div>

                            <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-[#F9FAFB]">
                                <label className="font-medium text-[#0F1117] block mb-1">Business Registration</label>
                                <p className="text-xs text-[#6B7280] mb-3">Upload Certificate of Incorporation, MSME certificate, or equivalent.</p>
                                <input type="file" onChange={(e) => handleFileChange(e, 'businessDoc')} className="text-sm text-[#6B7280] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ECFDF5] file:text-[#0D9373] hover:file:bg-[#D1FAE5] transition-colors cursor-pointer" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                    <div className="animate-in fade-in duration-300">
                        <h2 className="font-display text-2xl font-bold text-[#0F1117] mb-6">Review & Submit</h2>
                        <p className="text-[#6B7280] text-sm mb-6">Please review your details before submitting. You cannot edit these once submitted for verification.</p>
                        
                        <div className="space-y-6">
                            <div className="border border-[#E5E7EB] rounded-2xl p-5">
                                <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3 mb-3">
                                    <h3 className="font-semibold text-[#0F1117]">Business Details</h3>
                                    <button onClick={() => setCurrentStep(1)} className="text-xs text-[#0D9373] font-medium hover:underline">Edit</button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-[#6B7280] block text-xs">Name</span>{formData.companyName || '—'}</div>
                                    <div><span className="text-[#6B7280] block text-xs">Type</span>{formData.businessType || '—'}</div>
                                    <div><span className="text-[#6B7280] block text-xs">GST</span>{formData.gstNumber || '—'}</div>
                                    <div><span className="text-[#6B7280] block text-xs">PAN</span>{formData.panNumber || '—'}</div>
                                </div>
                            </div>
                            
                            <div className="border border-[#E5E7EB] rounded-2xl p-5">
                                <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3 mb-3">
                                    <h3 className="font-semibold text-[#0F1117]">Contact Details</h3>
                                    <button onClick={() => setCurrentStep(2)} className="text-xs text-[#0D9373] font-medium hover:underline">Edit</button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-[#6B7280] block text-xs">Contact</span>{formData.contactName || '—'}</div>
                                    <div><span className="text-[#6B7280] block text-xs">Phone</span>{formData.phone || '—'}</div>
                                    <div className="col-span-2"><span className="text-[#6B7280] block text-xs">Address</span>{formData.address ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.pincode}` : '—'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step navigation buttons */}
                <div className="flex justify-between mt-8 border-t border-[#E5E7EB] pt-6">
                    <button onClick={prevStep} className="btn-outline" disabled={currentStep === 1}>
                        ← Back
                    </button>
                    <button 
                        onClick={currentStep < 4 ? nextStep : handleSubmit} 
                        className="btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Submitting...' : currentStep < 4 ? 'Continue →' : 'Submit Application →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
