'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/app/stores/useAppStore';
import { useState, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Upload, X } from "lucide-react";


export default function VerificationPage() {
  const user = useAppStore((state) => state.user);
  const router = useRouter();

  const [frontId, setFrontId] = useState<File | null>(null);
  const [backId, setBackId] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    } else {
      setter(null);
    }
  };

  // Cloudinary upload helper
  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      toast.error('Cloudinary configuration is missing. Please contact support.');
      throw new Error('Cloudinary environment variables are missing');
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    if (!data.secure_url) {
      toast.error('Cloudinary upload failed.');
      throw new Error('Cloudinary upload failed');
    }
    return data.secure_url;
  };

  const handleSubmit = async () => {
    if (!frontId) {
      toast.error('Please upload front side of your ID');
      return;
    }
    try {
      setLoading(true);
      // 1. Upload to Cloudinary
      const frontUrl = await uploadToCloudinary(frontId);
      let backUrl = '';
      if (backId) backUrl = await uploadToCloudinary(backId);

      // 2. Send to backend
      const response = await fetch('/api/verification/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.name || '',
          address: user?.address || '',
          idType: 'Government ID',
          idFront: frontUrl,
          idBack: backUrl,
          userId: user?.id,
        }),
      });

      if (!response.ok) throw new Error('Verification submission failed');
      toast.success('Verification submitted successfully!');
      router.push('/account');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Account Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              To verify your account, please upload clear photos of your government-issued ID.
            </p>
          </div>

          <div className="space-y-4">
            {/* FRONT ID */}
            <div className="space-y-2">
              <Label>Government ID Front</Label>
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      {frontId ? frontId.name : 'Click to upload front of ID'}
                    </p>
                  </div>
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setFrontId)}
                  />
                </label>
                {frontId && (
                  <Button variant="ghost" size="icon" onClick={() => setFrontId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* BACK ID */}
            <div className="space-y-2">
              <Label>Government ID Back (Optional)</Label>
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      {backId ? backId.name : 'Click to upload back of ID'}
                    </p>
                  </div>
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setBackId)}
                  />
                </label>
                {backId && (
                  <Button variant="ghost" size="icon" onClick={() => setBackId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/account')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !frontId}
            >
              {loading ? 'Submitting...' : 'Submit Verification'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
