import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

import Svg, { Path } from 'react-native-svg';

// Custom SVG Hamburger Icon
const HamburgerIcon = () => (
  <Svg height="20" width="20" viewBox="0 0 20 20">
    <Path d="M0,4 20,4" stroke="black" strokeWidth="2"/>
    <Path d="M0,9 20,9" stroke="black" strokeWidth="2"/>
    <Path d="M0,14 20,14" stroke="black" strokeWidth="2"/>
  </Svg>
);

const CustomHeader = ({ title, showHeader }) => {
  const navigation = useNavigation();

  if (!showHeader) {
    return null;
  }

  return (
    <View style={{
      height: Platform.OS === 'ios' ? 80 : 50, 
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: Platform.OS === 'ios' ? 40 : 0,
    }}>
      <TouchableOpacity
        onPress={() => navigation.openDrawer()}
        style={{ marginLeft: 10 }}
      >
        <HamburgerIcon />
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ fontSize: 20, color: 'black' }}>{title}</Text>
      </View>
      <View style={{ width: 30 }} />
    </View>
  );
};

export default CustomHeader;
