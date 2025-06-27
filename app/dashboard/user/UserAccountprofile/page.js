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
  Trash2,
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
  FileText,
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
      const response = await fetch(`/api/user/${uservalue.id}/verification`);
      if (response.ok) {
        const data = await response.json();
        setVerificationRequest(data);
      }
    } catch (error) {
      console.error('Error fetching verification request:', error);
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
  };

  const handleSave = async () => {
    try {
      setLoading(true);
  
      const res = await fetch(`/api/user/${uservalue.id}/updateinfo`, {
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
      
      setEditMode(false);
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
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await axios.post(`/api/user/${uservalue.id}/photo`, formData, {
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
    if (!verificationRequest) {
      return (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-md">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <p>Your account is not yet verified.</p>
          </div>
          <p className="text-sm mt-2">Verification gives you full access to all features.</p>
          <Button 
            onClick={() => router.push('/dashboard/verification')} 
            className="mt-3" 
            size="sm"
          >
            Start Verification
          </Button>
        </div>
      );
    }

    if (verificationRequest.status === 'pending') {
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

    if (verificationRequest.status === 'approved') {
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

    if (verificationRequest.status === 'rejected') {
      return (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <p>Your verification was rejected.</p>
          </div>
          {verificationRequest.comments && (
            <p className="text-sm mt-2">Reason: {verificationRequest.comments}</p>
          )}
          <Button 
            onClick={() => router.push('/dashboard/verification')} 
            className="mt-3" 
            size="sm"
          >
            Resubmit Information
          </Button>
        </div>
      );
    }
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
                          {uservalue?.verificationStatus !== 'approved' && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-6 p-0 text-sm"
                              onClick={() => router.push('/dashboard/verification')}
                            >
                              {uservalue?.verificationStatus ? 'Update' : 'Verify'}
                            </Button>
                          )}
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