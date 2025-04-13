import React, { createContext, useState, useContext} from 'react';
import { trips, items, notifications, recentActivity } from '../data/mockData';

const PackingContext = createContext();

export const usePacking = () => useContext(PackingContext);

export const PackingProvider = ({ children }) => {
  const [userTrips, setUserTrips] = useState(trips);
  const [tripItems, setTripItems] = useState(items);
  const [userNotifications, setUserNotifications] = useState(notifications);
  const [activityFeed, setActivityFeed] = useState(recentActivity);
  const [activeTrip, setActiveTrip] = useState(trips[0]);

  // Get trip by ID
  const getTrip = (tripId) => {
    return userTrips.find(trip => trip.id === parseInt(tripId));
  };

  // Get items for a specific trip
  const getTripItems = (tripId) => {
    return tripItems.filter(item => item.tripId === parseInt(tripId));
  };

  // Add new trip
  const addTrip = (tripData) => {
    const newTrip = {
      id: userTrips.length + 1,
      ...tripData,
      progress: 0,
      itemsTotal: 0,
      itemsPacked: 0,
      itemsDelivered: 0,
      categories: []
    };
    setUserTrips([...userTrips, newTrip]);
    return newTrip;
  };

  // Add category to trip
  const addCategory = (tripId, categoryName) => {
    const trip = getTrip(tripId);
    if (!trip) return null;

    const newCategory = {
      id: trip.categories.length + 1,
      name: categoryName,
      items: 0,
      packed: 0
    };

    const updatedTrips = userTrips.map(t => {
      if (t.id === parseInt(tripId)) {
        return {
          ...t,
          categories: [...t.categories, newCategory]
        };
      }
      return t;
    });

    setUserTrips(updatedTrips);
    return newCategory;
  };

  // Add item to trip
  const addItem = (tripId, item) => {
    const newItem = {
      id: tripItems.length + 1,
      tripId: parseInt(tripId),
      ...item,
      status: 'To Pack'
    };

    setTripItems([...tripItems, newItem]);

    // Update trip statistics
    const updatedTrips = userTrips.map(trip => {
      if (trip.id === parseInt(tripId)) {
        const categoryIndex = trip.categories.findIndex(c => c.id === item.categoryId);
        
        const updatedCategories = [...trip.categories];
        if (categoryIndex !== -1) {
          updatedCategories[categoryIndex] = {
            ...updatedCategories[categoryIndex],
            items: updatedCategories[categoryIndex].items + 1
          };
        }

        return {
          ...trip,
          itemsTotal: trip.itemsTotal + 1,
          categories: updatedCategories
        };
      }
      return trip;
    });

    setUserTrips(updatedTrips);
    
    // Add to activity feed
    addActivity({
      userId: item.assignedTo,
      action: 'added item',
      target: item.name,
      time: 'just now'
    });

    return newItem;
  };

  // Update item status
  const updateItemStatus = (itemId, status) => {
    const item = tripItems.find(i => i.id === parseInt(itemId));
    if (!item) return null;

    const previousStatus = item.status;
    
    // Update the item
    const updatedItems = tripItems.map(i => {
      if (i.id === parseInt(itemId)) {
        return { ...i, status };
      }
      return i;
    });
    
    setTripItems(updatedItems);
    
    // Update trip statistics
    const updatedTrips = userTrips.map(trip => {
      if (trip.id === item.tripId) {
        let itemsPacked = trip.itemsPacked;
        let itemsDelivered = trip.itemsDelivered;
        
        // Adjust counters based on status change
        if (previousStatus !== 'Packed' && status === 'Packed') {
          itemsPacked += 1;
        } else if (previousStatus === 'Packed' && status !== 'Packed') {
          itemsPacked -= 1;
        }
        
        if (previousStatus !== 'Delivered' && status === 'Delivered') {
          itemsDelivered += 1;
          if (previousStatus !== 'Packed') {
            itemsPacked += 1;
          }
        } else if (previousStatus === 'Delivered' && status !== 'Delivered') {
          itemsDelivered -= 1;
        }
        
        // Update category statistics
        const updatedCategories = trip.categories.map(category => {
          if (category.id === item.categoryId) {
            let packed = category.packed;
            
            if (previousStatus !== 'Packed' && previousStatus !== 'Delivered' && 
                (status === 'Packed' || status === 'Delivered')) {
              packed += 1;
            } else if ((previousStatus === 'Packed' || previousStatus === 'Delivered') && 
                      status === 'To Pack') {
              packed -= 1;
            }
            
            return { ...category, packed };
          }
          return category;
        });
        
        // Calculate new progress
        const progress = Math.round((itemsPacked / trip.itemsTotal) * 100);
        
        return {
          ...trip,
          itemsPacked,
          itemsDelivered,
          progress,
          categories: updatedCategories
        };
      }
      return trip;
    });
    
    setUserTrips(updatedTrips);
    
    // Add to activity feed
    addActivity({
      userId: item.assignedTo,
      action: `marked "${item.name}" as`,
      target: status,
      time: 'just now'
    });
    
    // Add notification
    addNotification({
      userId: item.assignedTo,
      message: `Item "${item.name}" status changed to ${status}`,
      type: 'status'
    });
    
    return item;
  };

  // Assign item to user
  const assignItem = (itemId, userId) => {
    const updatedItems = tripItems.map(item => {
      if (item.id === parseInt(itemId)) {
        return { ...item, assignedTo: userId };
      }
      return item;
    });
    
    setTripItems(updatedItems);
    
    const item = tripItems.find(i => i.id === parseInt(itemId));
    
    // Add notification
    addNotification({
      userId,
      message: `You were assigned "${item.name}"`,
      type: 'assignment'
    });
    
    return item;
  };

  // Add notification
  const addNotification = (notification) => {
    const newNotification = {
      id: userNotifications.length + 1,
      ...notification,
      time: 'just now'
    };
    
    setUserNotifications([newNotification, ...userNotifications]);
    return newNotification;
  };

  // Add activity
  const addActivity = (activity) => {
    const newActivity = {
      id: activityFeed.length + 1,
      ...activity
    };
    
    setActivityFeed([newActivity, ...activityFeed]);
    return newActivity;
  };

  // Check for duplicate items
  const checkDuplicates = (tripId, itemName) => {
    const items = getTripItems(tripId);
    return items.filter(item => 
      item.name.toLowerCase() === itemName.toLowerCase()
    );
  };

  const value = {
    trips: userTrips,
    items: tripItems,
    notifications: userNotifications,
    activities: activityFeed,
    activeTrip,
    setActiveTrip,
    getTrip,
    getTripItems,
    addTrip,
    addCategory,
    addItem,
    updateItemStatus,
    assignItem,
    addNotification,
    addActivity,
    checkDuplicates
  };

  return (
    <PackingContext.Provider value={value}>
      {children}
    </PackingContext.Provider>
  );
};