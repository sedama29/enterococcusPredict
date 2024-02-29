import {StyleSheet, Text, View, Button} from 'react-native';
import React, {useEffect} from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

const SignUpScreen = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '516316369812-cfrok6d7da81mlfkf91q8264so31jejr.apps.googleusercontent.com',
    });
  }, []);

  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
  
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  
    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }

  return (

     <Button
        title="Google Sign-In"
        onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
      />
  
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  text_1: {
    fontSize: 20,
    color: 'gray',
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
