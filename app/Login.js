import React, { useEffect } from 'react';
import { Alert, Button } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

// Move the useEffect outside the SignInWithGoogle function

GoogleSignin.configure({
  webClientId: '516316369812-cfrok6d7da81mlfkf91q8264so31jejr.apps.googleusercontent.com',
});

export const SignInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { idToken, user } = await GoogleSignin.signIn();
    const email = user.email;

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    const emailsSnapshot = await database().ref('/emails').once('value');
    const emails = emailsSnapshot.val() || {};
    const isAllowed = Object.values(emails).some(allowedEmail => allowedEmail === email);

    if (isAllowed) {
      const firebaseAuthResult = await auth().signInWithCredential(googleCredential);
      Alert.alert('Success', 'You are signed in!');

      // Revoke access after successful sign-in
      await GoogleSignin.revokeAccess();
    } else {
      Alert.alert('Sorry, it looks like your email is not registered with us.');
    }
  } catch (error) {
    console.log('Error during sign-in:', error);
  }
};
