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

  const handleSubmit = async () => {
    if (!frontId) {
      toast.error('Please upload front side of your ID');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('frontId', frontId);
      if (backId) formData.append('backId', backId);

      const response = await fetch(`/api/users/${user?.id}/verification`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Verification submission failed');

      const data = await response.json();

      /*useAppStore.getState().setUser({
        ...user,
        verificationStatus: 'pending',
        governmentIdFrontUrl: data.frontIdUrl,
        governmentIdBackUrl: data.backIdUrl,
      });*/

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
