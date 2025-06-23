'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  Edit,
  Trash2,
  Key,
  Save,
  X,
  Camera,
  Car,
  History,
  User,
  Shield,
  CreditCard,
} from "lucide-react";
import { useAppStore } from '@/app/stores/useAppStore';

export default function UserProfile() {
  const uservalue = useAppStore((state) => state.user);
  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState({
    name: uservalue?.name || '',
    email: uservalue?.email || '',
    phone: uservalue?.phone || '',
    address: uservalue?.address || '',
  });
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEditClick = () => {
    setTempUser({
      name: uservalue?.name || '',
      email: uservalue?.email || '',
      phone: uservalue?.phone || '',
      address: uservalue?.address || '',
    });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/users/${uservalue.id}`, {
        name: tempUser.name,
        email: tempUser.email,
        // Only include phone and address if they exist
        ...(tempUser.phone && { phone: tempUser.phone }),
        ...(tempUser.address && { address: tempUser.address }),
      });
      useAppStore.getState().setUser({ ...uservalue, ...response.data });
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await axios.post(`/api/users/${uservalue.id}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      useAppStore.getState().setUser({ 
        ...uservalue, 
        profilePhotoUrl: response.data.photoUrl 
      });
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error('Failed to upload photo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderVerificationBadge = () => {
    if (!uservalue?.verificationStatus) return null;
    
    const statusMap = {
      pending: { color: 'bg-yellow-500', text: 'Verification Pending' },
      approved: { color: 'bg-green-500', text: 'Verified' },
      rejected: { color: 'bg-red-500', text: 'Verification Rejected' },
    };

    const status = statusMap[uservalue.verificationStatus];

    return (
      <span className={`${status.color} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
        <Shield className="h-3 w-3" />
        {status.text}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Column - Profile Info */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={loading}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={() => setOpenPasswordDialog(true)}
                    disabled={loading}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    <span>Change Password</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={uservalue?.profilePhotoUrl || '/default-avatar.jpg'} />
                  <AvatarFallback>
                    {uservalue?.name?.split(' ').map(n => n[0]).join('') || 'US'}
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <label htmlFor="photo-upload" className="absolute bottom-0 right-0">
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={loading}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-10 w-10"
                      disabled={loading}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </label>
                )}
              </div>
              
              {editMode ? (
                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={tempUser.name}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={tempUser.email}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={tempUser.phone}
                      onChange={handleInputChange}
                      disabled={loading}
                      placeholder="Add your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input
                      id="address"
                      name="address"
                      value={tempUser.address}
                      onChange={handleInputChange}
                      disabled={loading}
                      placeholder="Add your address"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={loading || !tempUser.name || !tempUser.email}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center w-full">
                  <h3 className="text-xl font-semibold">
                    {uservalue?.name || 'User'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {uservalue?.email || 'No email provided'}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {uservalue?.role || 'user'}
                  </p>
                  {renderVerificationBadge()}
                  
                  <div className="w-full border-t pt-4 mt-4 space-y-2 text-left">
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span> {uservalue?.phone || 'Not provided'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Address:</span> {uservalue?.address || 'Not provided'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Member since:</span> {uservalue?.createdAt ? new Date(uservalue.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleEditClick}
                    disabled={loading}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Activity */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Your Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="purchases">
                    <Car className="mr-2 h-4 w-4" />
                    Purchases
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payments
                  </TabsTrigger>
                  <TabsTrigger value="verification">
                    <Shield className="mr-2 h-4 w-4" />
                    Verification
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="pt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Full Name</p>
                        <p className="text-sm">{uservalue?.name || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm">{uservalue?.email || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Account Type</p>
                        <p className="text-sm capitalize">{uservalue?.role || 'user'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Verification Status</p>
                        <div className="text-sm">
                          {renderVerificationBadge()}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="purchases" className="pt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Your Purchases</h3>
                    <p className="text-sm text-muted-foreground">
                      {uservalue?.purchases?.length ? 'Your purchase history will appear here' : 'No purchases yet'}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="payments" className="pt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Methods</h3>
                    <p className="text-sm text-muted-foreground">
                      {uservalue?.savedPaymentMethods?.length ? 'Your saved payment methods will appear here' : 'No saved payment methods'}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="verification" className="pt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Account Verification</h3>
                    {uservalue?.verificationStatus === 'approved' ? (
                      <div className="bg-green-50 text-green-800 p-4 rounded-md">
                        <p>Your account has been verified.</p>
                        {uservalue.verifiedAt && (
                          <p className="text-sm">Verified on: {new Date(uservalue.verifiedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    ) : uservalue?.verificationStatus === 'pending' ? (
                      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
                        <p>Your verification is pending review.</p>
                      </div>
                    ) : uservalue?.verificationStatus === 'rejected' ? (
                      <div className="bg-red-50 text-red-800 p-4 rounded-md">
                        <p>Your verification was rejected.</p>
                        {uservalue.verificationComments && (
                          <p className="text-sm">Reason: {uservalue.verificationComments}</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-blue-50 text-blue-800 p-4 rounded-md">
                        <p>Your account is not yet verified.</p>
                        <Button 
                          onClick={() => router.push('/dashboard/verification')} 
                          className="mt-2" 
                          size="sm"
                        >
                          Start Verification
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}