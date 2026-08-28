import React, { useState, useRef, useEffect } from 'react';
import {
  View, Animated, Keyboard, Platform, StatusBar,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { Txt, Btn, Input, glow } from '../ui/base';
import Icon from '../ui/Icon';
import { useFeedback } from '../ui/Feedback';
import { R } from '../theme';

/* Kirish ekrani.

   Klaviatura ochilganda logotip kichrayib yuqoriga suriladi — aks
   holda 5 dyuymli telefonda parol maydoni klaviatura ostida qolib
   ketadi. */

export default function Login() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const { notify } = useFeedback();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const passRef = useRef(null);

  const logo = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => Animated.timing(logo, { toValue: 0, duration: 260, useNativeDriver: true }).start()
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => Animated.timing(logo, { toValue: 1, duration: 260, useNativeDriver: true }).start()
    );
    return () => { show.remove(); hide.remove(); };
  }, [logo]);

  const submit = async () => {
    if (busy) return;
    Keyboard.dismiss();
    setBusy(true);
    const res = await signIn(email, pass);
    setBusy(false);
    if (res.error) notify(res.error, 'error');
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: t.shell }}>
      <StatusBar barStyle={t.mode === 'light' ? 'dark-content' : 'light-content'} />
      <View style={{
        flex: 1, justifyContent: 'flex-end',
        padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20,
      }}>
        <Animated.View style={{
          flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14,
          opacity: logo.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
          transform: [
            { scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) },
            { translateY: logo.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) },
          ],
        }}>
          <View style={{
            width: 72, height: 72, borderRadius: 20,
            backgroundColor: t.card, borderWidth: 1, borderColor: t.accdim,
            alignItems: 'center', justifyContent: 'center',
            ...glow(t, 0.3, 32),
          }}>
            <Icon name="storefront" size={36} color={t.acc} />
          </View>
          <Txt size={24} weight="500">MyBazzar</Txt>
          <Txt size={13} color={t.t3}>Do‘koningiz — cho‘ntagingizda</Txt>
        </Animated.View>

        <View style={{ gap: 12, paddingBottom: 14 }}>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() => passRef.current?.focus()}
            inputStyle={{ height: 52, borderRadius: R.lg, backgroundColor: t.card }}
          />
          <Input
            ref={passRef}
            value={pass}
            onChangeText={setPass}
            placeholder="Parol"
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
            inputStyle={{ height: 52, borderRadius: R.lg, backgroundColor: t.card }}
          />
          <Btn title="Kirish" size="lg" onPress={submit} loading={busy} full />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
