import React from 'react';
import { Tabs } from 'expo-router';
import { Text, Platform, View, ColorValue } from 'react-native';
import { Colors } from '@/constants/theme';

// Clean geometric icons using React Native primitives
function TabViewfinderIcon({ color }: { color: ColorValue | string }) {
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

function TabCardIcon({ color }: { color: ColorValue | string }) {
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 14,
          height: 18,
          borderRadius: 2,
          borderWidth: 2,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 2,
        }}
      >
        <View
          style={{
            width: 8,
            height: 5,
            borderRadius: 1,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

function TabShelfIcon({ color }: { color: ColorValue | string }) {
  return (
    <View
      style={{
        width: 18,
        height: 18,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 3,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 1, backgroundColor: color }} />
      <View style={{ width: 6, height: 6, borderRadius: 1, backgroundColor: color }} />
      <View style={{ width: 6, height: 6, borderRadius: 1, backgroundColor: color }} />
      <View style={{ width: 6, height: 6, borderRadius: 1, backgroundColor: color }} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1C22',
          borderTopColor: '#2C2F38',
          borderTopWidth: 1.5,
          height: Platform.OS === 'ios' ? 88 : 66,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.packaging.racingYellow,
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
          letterSpacing: 1.2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'SCAN',
          tabBarIcon: ({ color }) => <TabViewfinderIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="card"
        options={{
          title: 'CARDS',
          tabBarIcon: ({ color }) => <TabCardIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          title: 'SHELF',
          tabBarIcon: ({ color }) => <TabShelfIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
