import React from 'react';
import {
  House, Storefront, Package, Tray, DotsThreeCircle, ShoppingCartSimple,
  Barcode, MagnifyingGlass, Calculator, Printer, Plus, Minus, PencilSimple,
  CaretRight, CaretLeft, CaretUp, CaretDown, Bell, Moon, Sun, Translate,
  ChatText, CloudArrowUp, ShieldCheck, GearSix, Users, Handshake,
  ChartLineUp, FileText, Sparkle, UserGear, Globe, SignOut, LockSimple,
  CheckCircle, XCircle, Warning, WarningCircle, Clock, Phone, CashRegister,
  X, Check, CloudSlash, Money, CreditCard, ArrowsLeftRight, Trash, Camera,
  ImageSquare, Receipt, ArrowUUpLeft, WifiSlash, ArrowClockwise, Palette,
  Percent, ClockCounterClockwise, CurrencyCircleDollar, User, Info,
  DotsThreeVertical, Funnel, ArrowRight, Star, Truck, Note,
} from 'phosphor-react-native';
import { useTheme } from '../ThemeContext';

/* Dizaynda ishlatilgan barcha belgilar. Nomlar dizayndagi
   `ph-house` kabi yozuvlarga mos — ekranlarni ko'chirish oson bo'lsin. */
const MAP = {
  house: House, storefront: Storefront, package: Package, tray: Tray,
  'dots-three-circle': DotsThreeCircle, 'shopping-cart': ShoppingCartSimple,
  barcode: Barcode, search: MagnifyingGlass, calculator: Calculator,
  printer: Printer, plus: Plus, minus: Minus, pencil: PencilSimple,
  'caret-right': CaretRight, 'caret-left': CaretLeft, 'caret-up': CaretUp,
  'caret-down': CaretDown, bell: Bell, moon: Moon, sun: Sun,
  translate: Translate, 'chat-text': ChatText, cloud: CloudArrowUp,
  shield: ShieldCheck, gear: GearSix, users: Users, handshake: Handshake,
  chart: ChartLineUp, 'file-text': FileText, sparkle: Sparkle,
  'user-gear': UserGear, globe: Globe, 'sign-out': SignOut, lock: LockSimple,
  'check-circle': CheckCircle, 'x-circle': XCircle, warning: Warning,
  'warning-circle': WarningCircle, clock: Clock, phone: Phone,
  'cash-register': CashRegister, x: X, check: Check, 'cloud-slash': CloudSlash,
  money: Money, card: CreditCard, transfer: ArrowsLeftRight, trash: Trash,
  camera: Camera, image: ImageSquare, receipt: Receipt, undo: ArrowUUpLeft,
  'wifi-slash': WifiSlash, refresh: ArrowClockwise, palette: Palette,
  percent: Percent, history: ClockCounterClockwise,
  coin: CurrencyCircleDollar, user: User, info: Info,
  'dots-vertical': DotsThreeVertical, funnel: Funnel, 'arrow-right': ArrowRight,
  star: Star, truck: Truck, note: Note,
};

export default function Icon({ name, size = 20, color, fill, weight, style }) {
  const { t } = useTheme();
  const C = MAP[name];
  if (!C) return null;
  return (
    <C
      size={size}
      color={color || t.t2}
      weight={weight || (fill ? 'fill' : 'regular')}
      style={style}
    />
  );
}

export { MAP as ICONS };
