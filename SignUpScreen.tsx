import React, { useEffect } from 'react';
import { Alert, Button } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const SignUpScreen = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '516316369812-cfrok6d7da81mlfkf91q8264so31jejr.apps.googleusercontent.com',
    });
  }, []);

  async function onGoogleButtonPress() {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken, user } = await GoogleSignin.signIn();
      const email = user.email;

      // Debug: Check if the email and idToken are correctly obtained
      console.log('Email:', email);
      console.log('ID Token:', idToken);

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      const emailsSnapshot = await database().ref('/emails').once('value');
      const emails = emailsSnapshot.val() || {};
      const isAllowed = Object.values(emails).some(allowedEmail => allowedEmail === email);

      if (isAllowed) {
        const firebaseAuthResult = await auth().signInWithCredential(googleCredential);
        // Debug: Log the result of Firebase Auth
        console.log('Firebase Auth Result:', firebaseAuthResult);
        Alert.alert('Success', 'You are signed in!');
      } else {
        Alert.alert('Access Denied', 'You are not a user.');
      }
    } catch (error: any) { // Explicitly define the type of the 'error' variable
      console.log('Error during sign-in:', error);
  
      // Check for user cancellation
      if (
        error.userInfo &&
        error.userInfo.NSLocalizedDescription === 'The user canceled the sign-in flow.'
      ) {
        Alert.alert('Sign-In Canceled', 'The user canceled the sign-in process.');
      } else {
        Alert.alert('Sign-In Error', `An error occurred during sign-in: ${error.message}`);
      }
    }
  }

  return (
    <Button
      title="Google Sign-In"
      onPress={onGoogleButtonPress}
    />
  );
};

export default SignUpScreen;
