// Mock data for development

export const trips = [
    { 
      id: 1, 
      name: 'Summer Camping Trip', 
      date: 'Jul 15-20, 2025', 
      progress: 68, 
      members: 5,
      itemsTotal: 42,
      itemsPacked: 29,
      itemsDelivered: 16,
      categories: [
        { id: 1, name: 'Essentials', items: 8, packed: 7 },
        { id: 2, name: 'Clothing', items: 12, packed: 9 },
        { id: 3, name: 'Cooking', items: 10, packed: 6 },
        { id: 4, name: 'Entertainment', items: 5, packed: 3 },
        { id: 5, name: 'Personal', items: 7, packed: 4 }
      ]
    },
    { 
      id: 2, 
      name: 'Beach Weekend', 
      date: 'Aug 5-7, 2025', 
      progress: 25, 
      members: 3,
      itemsTotal: 30,
      itemsPacked: 8,
      itemsDelivered: 0,
      categories: [
        { id: 1, name: 'Beach Gear', items: 10, packed: 3 },
        { id: 2, name: 'Clothing', items: 8, packed: 2 },
        { id: 3, name: 'Food & Drinks', items: 7, packed: 3 },
        { id: 4, name: 'Personal', items: 5, packed: 0 }
      ]
    },
    { 
      id: 3, 
      name: 'Business Conference', 
      date: 'Sep 10-12, 2025', 
      progress: 10, 
      members: 2,
      itemsTotal: 15,
      itemsPacked: 2,
      itemsDelivered: 0,
      categories: [
        { id: 1, name: 'Documents', items: 5, packed: 1 },
        { id: 2, name: 'Clothing', items: 6, packed: 1 },
        { id: 3, name: 'Electronics', items: 4, packed: 0 }
      ]
    }
  ];
  
  export const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Owner',
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      role: 'Admin',
      avatar: 'SS'
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael@example.com',
      role: 'Member',
      avatar: 'MB'
    },
    {
      id: 4,
      name: 'Alex Johnson',
      email: 'alex@example.com',
      role: 'Member',
      avatar: 'AJ'
    },
    {
      id: 5,
      name: 'Emily Williams',
      email: 'emily@example.com',
      role: 'Viewer',
      avatar: 'EW'
    }
  ];
  
  export const notifications = [
    { 
      id: 1, 
      userId: 4,
      message: 'Alex marked "Tent" as packed', 
      time: '15 minutes ago', 
      type: 'status' 
    },
    { 
      id: 2, 
      userId: 2,
      message: 'Sarah assigned "Cooking utensils" to you', 
      time: '1 hour ago', 
      type: 'assignment' 
    },
    { 
      id: 3, 
      userId: null,
      message: 'Possible duplicate: "Portable charger"', 
      time: '3 hours ago', 
      type: 'alert' 
    }
  ];
  
  export const recentActivity = [
    {
      id: 1,
      userId: 3,
      action: 'added 3 items to',
      target: 'Cooking',
      time: '10 minutes ago'
    },
    {
      id: 2,
      userId: 2,
      action: 'marked "Hiking Boots" as',
      target: 'Packed',
      time: '25 minutes ago'
    },
    {
      id: 3,
      userId: 4,
      action: 'delivered "Tent" to',
      target: 'Campsite',
      time: '1 hour ago'
    },
    {
      id: 4,
      userId: 1,
      action: 'created a new category',
      target: 'Entertainment',
      time: '2 hours ago'
    }
  ];
  
  export const items = [
    {
      id: 1,
      tripId: 1,
      categoryId: 1,
      name: 'Tent',
      assignedTo: 4,
      status: 'Delivered',
      notes: '4-person tent with rainfly'
    },
    {
      id: 2,
      tripId: 1,
      categoryId: 1,
      name: 'Sleeping Bags',
      assignedTo: 1,
      status: 'Packed',
      notes: 'Bring 5 sleeping bags'
    },
    {
      id: 3,
      tripId: 1,
      categoryId: 3,
      name: 'Cooking Utensils',
      assignedTo: 1,
      status: 'To Pack',
      notes: 'Spatula, serving spoons, tongs'
    },
    {
      id: 4,
      tripId: 1,
      categoryId: 3,
      name: 'Portable Stove',
      assignedTo: 3,
      status: 'Packed',
      notes: '2-burner propane stove'
    },
    {
      id: 5,
      tripId: 1,
      categoryId: 4,
      name: 'Board Games',
      assignedTo: 5,
      status: 'Packed',
      notes: 'Cards, Uno, travel-sized games'
    }
  ];