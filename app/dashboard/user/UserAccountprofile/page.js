'use client';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouter, useParams } from 'next/navigation';
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
} from "lucide-react";
import { useAppStore,} from '@/app/stores/useAppStore';

export default function UserProfile() {
  const [user, setUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    profilePhoto: '',
    memberSince: '',
    lastLogin: ''
  });
  const  uservalue = useAppStore((state) => state. user);
  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState({});
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [testDrives, setTestDrives] = useState([]);
  const router = useRouter();


  

  
  
  

  
  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setTempUser(user);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`/api/users/${user.id}`, tempUser);
      setUser(response.data);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
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
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await axios.post(`/api/users/${user.id}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser(prev => ({ ...prev, profilePhoto: response.data.photoUrl }));
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error('Failed to upload photo');
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/auth/deleteAccount/${uservalue.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      
      });

      if (!res.ok) {
        throw new Error('Failed to delete user');
      }

      const data = await res.json();
     toast.success("Account deleted successfully")
     router.push('/Signup');
    } catch (err) {
      console.error('Error deleting user:', err);
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
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setOpenPasswordDialog(true)}>
                    <Key className="mr-2 h-4 w-4" />
                    <span>Change Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Account</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user.profilePhoto || '/default-avatar.jpg'} />
                  <AvatarFallback>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
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
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-10 w-10"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </label>
                )}
              </div>
              
              {editMode ? (
                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={tempUser.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={tempUser.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-xl font-semibold">
                   { uservalue?.name ?? "John Doe"} 
                  </h3>
                  <p className="text-sm text-muted-foreground">
                  { uservalue?.email ?? "JohnDoe@gmail.com"} 
                  </p>
                  <p className="text-sm text-muted-foreground">
                  { uservalue?.role ?? "User"} 
                  </p>
                </div>
              )}
              
              <div className="w-full border-t pt-4 space-y-4">
                {editMode ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={tempUser.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={tempUser.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={tempUser.address}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={tempUser.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={tempUser.state}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={tempUser.zipCode}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {user.email}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span> {user.phone || 'Not provided'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Address:</span> {user.address ? `${user.address}, ${user.city}, ${user.state} ${user.zipCode}` : 'Not provided'}
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleEditClick}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
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
                  <TabsTrigger value="services">
                    <History className="mr-2 h-4 w-4" />
                    Services
                  </TabsTrigger>
                  <TabsTrigger value="test-drives">
                    <Car className="mr-2 h-4 w-4" />
                    Test Drives
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="pt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Account Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      Welcome back to your account dashboard. Here you can manage your personal information, 
                      view your vehicle purchase history, and track service appointments.
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Last login:</span> {new Date(user.lastLogin).toLocaleString()}
                    </p>
                    
                    <h3 className="text-lg font-semibold pt-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">{purchaseHistory.length}</p>
                          <p className="text-sm text-muted-foreground">Vehicles Purchased</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">{serviceHistory.length}</p>
                          <p className="text-sm text-muted-foreground">Service Visits</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">{testDrives.length}</p>
                          <p className="text-sm text-muted-foreground">Test Drives</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">
                            {purchaseHistory.filter(p => p.warrantyActive).length}
                          </p>
                          <p className="text-sm text-muted-foreground">Active Warranties</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="purchases" className="pt-4">
                 
                </TabsContent>
                
                <TabsContent value="services" className="pt-4">
                 
                </TabsContent>
                
                <TabsContent value="test-drives" className="pt-4">
                 
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      
    </div>
  );
}