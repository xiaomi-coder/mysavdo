import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './src/ThemeContext';
import { AuthProvider, useAuth } from './src/AuthContext';
import { DataProvider, useData } from './src/DataContext';
import { CartProvider } from './src/CartContext';
import { FeedbackProvider } from './src/ui/Feedback';
import { I18nProvider } from './src/i18n';

import TabBar from './src/nav/TabBar';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import POS from './src/screens/POS';
import Ombor from './src/screens/Ombor';
import Orders from './src/screens/Orders';
import More from './src/screens/More';
import Settings from './src/screens/Settings';
import Clients from './src/screens/Clients';
import Nasiya from './src/screens/Nasiya';
import Finance from './src/screens/Finance';
import Reports from './src/screens/Reports';
import ChekPrinter from './src/screens/ChekPrinter';
import Analytics from './src/screens/Analytics';
import Employees from './src/screens/Employees';
import Product from './src/screens/Product';
import History from './src/screens/History';
import BulkReceive from './src/screens/BulkReceive';
import Suppliers from './src/screens/Suppliers';
import Scanner from './src/screens/Scanner';

/* ══════════════════════════════════════════════════════════════════════════
   MyBazzar — do'kon boshqaruvi

   Ilova veb versiyaning qisqartmasi emas, to'liq o'rnini bosadi:
   ba'zi do'konlarda kompyuter yo'q va butun ish shu telefondan
   yuritiladi. Shuning uchun sotuv, ombor, nasiya, mijozlar, moliya,
   hisobot va chek — hammasi shu yerda.

   Pastdagi beshta bo'lim rolga qarab qisqaradi: sotuvchiga foyda va
   tannarx ko'rinmaydi.
   ══════════════════════════════════════════════════════════════════════ */

const Root = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();

function MoreNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <MoreStack.Screen name="Yana" component={More} />
      <MoreStack.Screen name="Mijozlar" component={Clients} />
      <MoreStack.Screen name="Nasiya" component={Nasiya} />
      <MoreStack.Screen name="Moliya" component={Finance} />
      <MoreStack.Screen name="Hisobot" component={Reports} />
      <MoreStack.Screen name="Analitika" component={Analytics} />
      <MoreStack.Screen name="Xodimlar" component={Employees} />
      <MoreStack.Screen name="Taminotchilar" component={Suppliers} />
      <MoreStack.Screen name="Chek" component={ChekPrinter} />
      <MoreStack.Screen name="Sozlamalar" component={Settings} />
    </MoreStack.Navigator>
  );
}

function MainTabs() {
  const { can } = useAuth();
  const d = useData();

  return (
    <Tabs.Navigator
      screenOptions={{ headerShown: false, lazy: true }}
      tabBar={(props) => <TabBar {...props} badges={{ Buyurtma: d.pendingOrders.length }} />}
      initialRouteName={can('dashboard') ? 'Asosiy' : 'Sotuv'}
    >
      {can('dashboard') ? (
        <Tabs.Screen name="Asosiy" component={Dashboard} options={{ tabIcon: 'house' }} />
      ) : null}
      <Tabs.Screen name="Sotuv" component={POS} options={{ tabIcon: 'storefront' }} />
      {can('inventory') ? (
        <Tabs.Screen name="Ombor" component={Ombor} options={{ tabIcon: 'package' }} />
      ) : null}
      {can('orders') ? (
        <Tabs.Screen name="Buyurtma" component={Orders} options={{ tabIcon: 'tray' }} />
      ) : null}
      <Tabs.Screen name="Yana" component={MoreNavigator} options={{ tabIcon: 'dots-three-circle' }} />
    </Tabs.Navigator>
  );
}

function Navigation() {
  const { t } = useTheme();
  const { user, loading } = useAuth();

  const navTheme = {
    ...DefaultTheme,
    dark: t.mode === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: t.acc,
      background: t.page,
      card: t.nav,
      text: t.t1,
      border: t.line,
      notification: t.err,
    },
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.shell, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={t.acc} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Root.Screen name="Login" component={Login} />
        ) : (
          <>
            <Root.Screen name="Tabs" component={MainTabs} />
            <Root.Screen
              name="Tovar"
              component={Product}
              options={{ animation: 'slide_from_right' }}
            />
            <Root.Screen
              name="Tarix"
              component={History}
              options={{ animation: 'slide_from_right' }}
            />
            <Root.Screen
              name="Kirim"
              component={BulkReceive}
              options={{ animation: 'slide_from_right' }}
            />
            <Root.Screen
              name="Scanner"
              component={Scanner}
              options={{ presentation: 'fullScreenModal', animation: 'fade' }}
            />
          </>
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}

/* Savat va ma'lumot faqat kirgandan keyin kerak — chiqilganda
   ular tozalanishi uchun user bo'yicha qayta yaratiladi. */
function Session() {
  const { user } = useAuth();
  if (!user) return <Navigation />;
  return (
    <DataProvider key={user.id}>
      <CartProvider>
        <Navigation />
      </CartProvider>
    </DataProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Klaviatura balandligini kuzatadi. Android edge-to-edge rejimida
          tizimning o'z "adjustResize" i ishlamaydi — maydonlar klaviatura
          ostida qolib ketadi. Shu provayder buni hal qiladi. */}
      <KeyboardProvider>
      <ThemeProvider>
        <I18nProvider>
          <FeedbackProvider>
            <AuthProvider>
              <Session />
            </AuthProvider>
          </FeedbackProvider>
          <StatusBar style="auto" />
        </I18nProvider>
      </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
