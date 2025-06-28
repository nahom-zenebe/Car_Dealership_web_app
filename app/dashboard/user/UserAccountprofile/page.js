'use client';

import { useState, useEffect } from 'react';
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
  Key,
  Save,
  X,
  Camera,
  Car,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  User,
  History,
  Phone,
  MapPin,
} from "lucide-react";
import { useAppStore } from '@/app/stores/useAppStore';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

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
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [verificationRequest, setVerificationRequest] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (uservalue?.id) {
      fetchPurchases();
      fetchVerificationRequest();
    }
  }, [uservalue?.id]);

  const fetchPurchases = async () => {
    try {
      setLoadingPurchases(true);
      const response = await fetch('/api/sales');
      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }
      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      toast.error('Failed to load purchase history');
      console.error(error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const fetchVerificationRequest = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/${uservalue.id}/verifications`);
      if (response.ok) {
        const data = await response.json();
        setVerificationRequest(data);
      }
    } catch (error) {
      console.error('Error fetching verification request:', error);
    }
  };

  const createVerificationRequest = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/${uservalue.id}/verifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: tempUser.phone,
          address: tempUser.address
        })
      });
      

      if (!response.ok) {
        throw new Error('Failed to create verification request');
      }

      const data = await response.json();
      setVerificationRequest(data);
      useAppStore.getState().setUser({ 
        ...uservalue, 
        verificationStatus: 'pending'
      });
      toast.success('Verification request submitted');
    } catch (error) {
      toast.error('Failed to submit verification request');
      console.error(error);
    }
  };

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
    setPhotoPreview(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
  
      const res = await fetch(`http://localhost:3000/api/user/${uservalue.id}/updateinfo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tempUser.name,
          email: tempUser.email,
          phone: tempUser.phone,
          address: tempUser.address,
        }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
  
      const data = await res.json();
      
      useAppStore.setState((state) => ({
        user: { ...state.user, ...data }
      }));

      // Create verification request if phone and address were added
      if ((!uservalue.phone && tempUser.phone) || (!uservalue.address && tempUser.address)) {
        if (tempUser.phone && tempUser.address) {
          await createVerificationRequest();
        }
      }
      
      setEditMode(false);
      setPhotoPreview(null);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
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
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    try {
      setPhotoUploading(true);
      console.log('Starting photo upload...');
      
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Uploading to /api/upload...');
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Upload response:', response.data);
      
      if (response.data.success) {
        console.log('Upload successful, updating profile...');
        
        // Update user profile with the new photo URL
        const updateResponse = await axios.patch(`/api/user/${uservalue.id}/updateinfo`, {
          profilePhotoUrl: response.data.url
        });
        
        console.log('Update response:', updateResponse.data);
        
        if (updateResponse.status === 200) {
          // Update the user in the store with the new photo URL
          const updatedUser = { 
            ...uservalue, 
            profilePhotoUrl: response.data.url 
          };
          useAppStore.setState({ user: updatedUser });
          setPhotoPreview(response.data.url);
          toast.success('Profile photo updated successfully!');
        } else {
          throw new Error('Failed to update profile');
        }
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      toast.error(error.response?.data?.error || error.message || 'Failed to upload photo. Please try again.');
      setPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
    }
  };

  const renderVerificationBadge = () => {
    if (!uservalue?.verificationStatus) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Not Verified
        </Badge>
      );
    }
    
    const statusMap = {
      pending: { 
        variant: 'warning',
        icon: <Clock className="h-3 w-3" />,
        text: 'Pending Review'
      },
      approved: { 
        variant: 'success',
        icon: <CheckCircle className="h-3 w-3" />,
        text: 'Verified'
      },
      rejected: { 
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />,
        text: 'Rejected'
      },
    };

    const status = statusMap[uservalue.verificationStatus];

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={status.variant} className="flex items-center gap-1">
            {status.icon}
            {status.text}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {uservalue.verificationStatus === 'approved'
            ? "Your account has been fully verified"
            : uservalue.verificationStatus === 'pending'
            ? "Your information is under review"
            : "Please update your information to complete verification"}
        </TooltipContent>
      </Tooltip>
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'secondary', text: 'Pending' },
      completed: { variant: 'default', text: 'Completed' },
      cancelled: { variant: 'destructive', text: 'Cancelled' },
      delivered: { variant: 'success', text: 'Delivered' },
    };
    
    return <Badge variant={statusMap[status]?.variant || 'outline'}>
      {statusMap[status]?.text || status}
    </Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'secondary', text: 'Pending' },
      processing: { variant: 'default', text: 'Processing' },
      succeeded: { variant: 'success', text: 'Paid' },
      failed: { variant: 'destructive', text: 'Failed' },
      refunded: { variant: 'outline', text: 'Refunded' },
    };
    
    return <Badge variant={statusMap[status]?.variant || 'outline'}>
      {statusMap[status]?.text || status}
    </Badge>;
  };

  const renderVerificationContent = () => {
    if (!verificationRequest && (!uservalue?.phone || !uservalue?.address)) {
      return (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-md">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <p>Complete your profile with phone and address to start verification</p>
          </div>
        </div>
      );
    }

    if (verificationRequest?.status === 'pending') {
      return (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <p>Your verification is pending review.</p>
          </div>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm">{verificationRequest.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm">{verificationRequest.address}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              Submitted on: {format(new Date(verificationRequest.createdAt), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
      );
    }

    if (verificationRequest?.status === 'approved') {
      return (
        <div className="bg-green-50 text-green-800 p-4 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <p>Your account has been verified.</p>
          </div>
          {verificationRequest.updatedAt && (
            <p className="text-sm mt-2">
              Verified on: {format(new Date(verificationRequest.updatedAt), 'MMM d, yyyy h:mm a')}
            </p>
          )}
        </div>
      );
    }

    if (verificationRequest?.status === 'rejected') {
      return (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <p>Your verification was rejected.</p>
          </div>
          {verificationRequest.comments && (
            <p className="text-sm mt-2">Reason: {verificationRequest.comments}</p>
          )}
        </div>
      );
    }

    return (
      <div className="bg-gray-50 text-gray-800 p-4 rounded-md">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <p>Verification status will appear here once you add phone and address.</p>
        </div>
      </div>
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
                  <AvatarImage 
                    src={photoPreview || uservalue?.profilePhotoUrl || '/default-avatar.jpg'} 
                    alt={uservalue?.name || 'Profile'}
                  />
                  <AvatarFallback>
                    {uservalue?.name?.split(' ').map(n => n[0]).join('') || 'US'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Upload overlay */}
                {editMode && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={photoUploading}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-10 w-10 bg-white hover:bg-gray-100"
                      disabled={photoUploading}
                      onClick={() => document.getElementById('photo-upload').click()}
                    >
                      {photoUploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
                
                {/* Upload progress indicator */}
                {photoUploading && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Uploading...
                    </div>
                  </div>
                )}
              </div>
              
              {/* Photo upload instructions */}
              {editMode && (
                <div className="text-center text-xs text-gray-500 max-w-xs">
                  <p>Click the camera icon to upload a new profile photo</p>
                  <p>Supports JPG, PNG, GIF (max 5MB)</p>
                </div>
              )}
              
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
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={tempUser.phone}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={tempUser.address}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
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
                      disabled={loading || !tempUser.name || !tempUser.email || !tempUser.phone || !tempUser.address}
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
                  <div className="my-2">
                    {renderVerificationBadge()}
                  </div>
                  
                  <div className="w-full border-t pt-4 mt-4 space-y-2 text-left">
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span> {uservalue?.phone || 'Not provided'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Address:</span> {uservalue?.address || 'Not provided'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Member since:</span> {uservalue?.createdAt ? format(new Date(uservalue.createdAt), 'MMM d, yyyy') : 'N/A'}
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
                        <div className="flex items-center gap-2">
                          {renderVerificationBadge()}
                        </div>
                        {uservalue?.verifiedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Verified on: {format(new Date(uservalue.verifiedAt), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="purchases" className="pt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Your Purchases</h3>
                    {loadingPurchases ? (
                      <div className="flex justify-center items-center h-32">
                        <p>Loading purchases...</p>
                      </div>
                    ) : purchases.length === 0 ? (
                      <div className="text-center py-8">
                        <Car className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No purchases</h3>
                        <p className="mt-1 text-sm text-gray-500">Your purchase history will appear here.</p>
                        <div className="mt-6">
                          <Button onClick={() => router.push('/cars')}>
                            Browse Cars
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Items</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Payment</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {purchases.map((purchase) => (
                              <TableRow key={purchase.id}>
                                <TableCell className="font-medium">
                                  #{purchase.id.slice(-6).toUpperCase()}
                                </TableCell>
                                <TableCell>
                                  {format(new Date(purchase.saleDate), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell>
                                  <div className="flex -space-x-2">
                                    {purchase.items.slice(0, 3).map((item) => (
                                      <Tooltip key={item.id}>
                                        <TooltipTrigger>
                                          <Avatar className="h-8 w-8 border-2 border-white">
                                            <AvatarImage 
                                              src={item.car.imageUrls[0] || '/default-car.jpg'} 
                                              alt={`${item.car.make} ${item.car.model}`}
                                            />
                                            <AvatarFallback>
                                              {item.car.make[0]}{item.car.model[0]}
                                            </AvatarFallback>
                                          </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {item.car.make} {item.car.model} ({item.car.year})
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                    {purchase.items.length > 3 && (
                                      <Avatar className="h-8 w-8 border-2 border-white bg-gray-100">
                                        <AvatarFallback className="text-xs">
                                          +{purchase.items.length - 3}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  ${purchase.price.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(purchase.status)}
                                </TableCell>
                                <TableCell>
                                  {getPaymentStatusBadge(purchase.paymentStatus)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => router.push(`/purchases/${purchase.id}`)}
                                  >
                                    Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
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
                    {renderVerificationContent()}
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