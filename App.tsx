import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './app/main'; // Your App component
import Disclaimer from './SignUpScreen'; // Your Disclaimer component]

const Stack = createStackNavigator();

const App = () =>{
return (
  <NavigationContainer>
  <Stack.Navigator>
    <Stack.Screen name="Home" component={LoginPage} options={{ headerShown: false }} />
    <Stack.Screen name="Disclaimer" component={Disclaimer} options={{ headerShown: false }} />
  </Stack.Navigator>
</NavigationContainer>)
}

export default App