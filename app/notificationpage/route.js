'use client';

import { useState, useEffect } from 'react';
import { BellIcon, CheckIcon, ExclamationIcon, InformationCircleIcon, StarIcon, XIcon } from '@heroicons/react/outline';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate fetching notifications
    const mockNotifications = [
      {
        id: 1,
        type: 'new-arrival',
        title: 'New 2023 BMW M5 Just Arrived!',
        message: 'The brand new 2023 BMW M5 is now available for test drives. Limited stock available.',
        date: '2023-05-15T10:30:00',
        read: false,
        image: '/bmw-m5.jpg'
      },
      {
        id: 2,
        type: 'appointment',
        title: 'Service Appointment Reminder',
        message: 'Your scheduled maintenance for Toyota Camry is tomorrow at 2:00 PM.',
        date: '2023-05-14T09:15:00',
        read: false,
        image: '/service-icon.png'
      },
      {
        id: 3,
        type: 'promotion',
        title: 'Summer Special: 0% Financing',
        message: 'Get 0% APR financing on all 2022 models until June 30th. Limited time offer!',
        date: '2023-05-12T14:20:00',
        read: true,
        image: '/summer-sale.jpg'
      },
      {
        id: 4,
        type: 'test-drive',
        title: 'Test Drive Confirmation',
        message: 'Your test drive for the Ford Mustang Mach-E is confirmed for Friday at 11 AM.',
        date: '2023-05-10T16:45:00',
        read: true,
        image: '/mustang-mach-e.jpg'
      },
      {
        id: 5,
        type: 'maintenance',
        title: 'Your Vehicle Maintenance is Due',
        message: 'Based on your mileage, your Honda CR-V is due for an oil change and tire rotation.',
        date: '2023-05-08T08:00:00',
        read: false,
        image: '/maintenance-icon.png'
      },
      {
        id: 6,
        type: 'trade-in',
        title: 'Trade-In Value Update',
        message: 'Your 2019 Audi A4 has a new estimated trade-in value of $28,500. Schedule an appraisal today!',
        date: '2023-05-05T12:30:00',
        read: false,
        image: '/trade-in-icon.png'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => 
      ({ ...notification, read: true })
    );
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'new-arrival':
        return <StarIcon className="h-6 w-6 text-blue-500" />;
      case 'appointment':
        return <CheckIcon className="h-6 w-6 text-green-500" />;
      case 'promotion':
        return <ExclamationIcon className="h-6 w-6 text-yellow-500" />;
      case 'test-drive':
        return <InformationCircleIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Notifications</h1>
            </div>
            <div className="bg-blue-500 rounded-full px-4 py-1 flex items-center">
              <span className="font-semibold">{unreadCount} unread</span>
            </div>
          </div>
          
          {/* Filter tabs */}
          <div className="flex space-x-4 mt-6 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'all' ? 'bg-white text-blue-800' : 'bg-blue-700 text-white'}`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter('new-arrival')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'new-arrival' ? 'bg-white text-blue-800' : 'bg-blue-700 text-white'}`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => setFilter('promotion')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'promotion' ? 'bg-white text-blue-800' : 'bg-blue-700 text-white'}`}
            >
              Promotions
            </button>
            <button
              onClick={() => setFilter('appointment')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'appointment' ? 'bg-white text-blue-800' : 'bg-blue-700 text-white'}`}
            >
              Appointments
            </button>
            <button
              onClick={() => setFilter('test-drive')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'test-drive' ? 'bg-white text-blue-800' : 'bg-blue-700 text-white'}`}
            >
              Test Drives
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <button 
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
          <span className="text-sm text-gray-500">
            {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
          </span>
        </div>

        {/* Notifications list */}
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex space-x-4">
                  <div className="flex-shrink-0">
                    {notification.image ? (
                      <img 
                        className="h-12 w-12 rounded-md object-cover" 
                        src={notification.image} 
                        alt="Notification" 
                      />
                    ) : (
                      getNotificationIcon(notification.type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-blue-800' : 'text-gray-900'}`}>
                        {notification.title}
                      </p>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Mark as read"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Delete"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {formatDate(notification.date)}
                      </span>
                      {!notification.read && (
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? "You don't have any notifications yet." 
                  : `You don't have any ${filter.replace('-', ' ')} notifications.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}