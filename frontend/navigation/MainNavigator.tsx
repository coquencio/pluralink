import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import MyBookingsScreen from '../screens/booking/MyBookingsScreen';
import ProviderDashboardScreen from '../screens/provider/ProviderDashboardScreen';
import ProviderProfileScreen from '../screens/provider/ProviderProfileScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import BookingDetailsScreen from '../screens/booking/BookingDetailsScreen';
import AvailabilityScreen from '../screens/provider/AvailabilityScreen';
import ReviewScreen from '../screens/review/ReviewScreen';
import { useAuth } from '../context/AuthContext';

export type MainStackParamList = {
  Home: undefined;
  Search: undefined;
  ProviderProfile: { providerId: number };
  Booking: { providerId: number; serviceId: number };
  BookingDetails: { bookingId: number };
  MyBookings: undefined;
  ProviderDashboard: undefined;
  Availability: undefined;
  Review: { bookingId: number };
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<MainStackParamList>();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
    <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    <Stack.Screen name="Review" component={ReviewScreen} />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
    <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
  </Stack.Navigator>
);

const BookingsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
    <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    <Stack.Screen name="Review" component={ReviewScreen} />
  </Stack.Navigator>
);

export const MainNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      {user?.role === 'provider' && (
        <>
          <Tab.Screen name="Dashboard" component={ProviderDashboardScreen} />
          <Tab.Screen name="Availability" component={AvailabilityScreen} />
        </>
      )}
    </Tab.Navigator>
  );
};

