import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Alert } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Sheet, Txt, Tap, Btn, Icon, Chip, Stepper, SearchBar, SectionLabel, Skeleton } from '../ui';
import { useFeedback, buzz } from '../ui/Feedback';
import { db } from '../lib/api';
import { R } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Filiallar o'rtasida ko'chirish (veb bilan bir xil oqim)

   · Yuborish — joriy filial qoldig'idan darhol yechiladi, "yo'lda" bo'ladi
   · Qabul — kelganini sanab tasdiqlash; kam kelsa farq tarixda qoladi
   · Bekor — yetib bormaguncha yuboruvchi qaytarib oladi

   Asosiy foydalanuvchi — filialdagi sotuvchi: mashina keldi, u telefonda
   sanab "qabul qildim" deydi. Shuning uchun kelayotganlar tepada.
   ══════════════════════════════════════════════════════════════════════ */

const when = (d) => (d ? new Date(d).toLocaleString('uz-UZ', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
}) : '');

export default function TransferSheet({ onClose }) {
  const { t } = useTheme();
  const { branches, branch, pinnedBranch, isOwner, user } = useAuth();
  const d = useData();
  const { notify } = useFeedback();
  const [list, setList] = useState(null);
  const [mode, setMode] = useState('in');       // in | send | history
  const canSend = isOwner || user?.role === 'manager' || Boolean(pinnedBranch);

  const nameOf = useCallback((id) => branches.find((b) => b.id === id)?.name || `#${id}`, [branches]);

  const load = useCallback(async () => {
    const { data, error } = await db.from('transfers').select('*').order('id', { ascending: false }).limit(40);
    if (error) notify(error.message, 'error');
    setList(data || []);
  }, [notify]);
  useEffect(() => { load(); }, [load]);

  const done = (msg) => { buzz('ok'); notify(msg, 'ok'); load(); d.reload({ silent: true }); };

  const incoming = (list || []).filter((x) => x.status === 'sent' && x.to_branch === branch);
  const outgoing = (list || []).filter((x) => x.status === 'sent' && x.from_branch === branch);
  const history = (list || []).filter((x) => x.status !== 'sent');

  return (
    <Sheet visible onClose={onClose} title="Filiallar o‘rtasida ko‘chirish" sub={`Joriy filial: ${nameOf(branch)}`}>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
        <Chip label="Kelayotgan" count={incoming.length} active={mode === 'in'} onPress={() => setMode('in')} style={{ flex: 1 }} />
        {canSend ? <Chip label="Yuborish" active={mode === 'send'} onPress={() => setMode('send')} style={{ flex: 1 }} /> : null}
        <Chip label="Tarix" active={mode === 'history'} onPress={() => setMode('history')} style={{ flex: 1 }} />
      </View>

      {list == null ? <Skeleton height={90} /> : null}

      {list && mode === 'in' ? (
        <View style={{ gap: 10 }}>
          {incoming.length === 0 ? (
            <Txt size={13} color={t.t3} style={{ textAlign: 'center', paddingVertical: 20 }}>
              Bu filialga kelayotgan tovar yo‘q
            </Txt>
          ) : incoming.map((x) => (
            <Incoming key={x.id} x={x} nameOf={nameOf} t={t} onDone={done} notify={notify} />
          ))}
          {outgoing.length > 0 ? (
            <>
              <SectionLabel icon="truck" style={{ marginTop: 8 }}>Yuborilgan, yo‘lda</SectionLabel>
              {outgoing.map((x) => (
                <Line key={x.id} x={x} nameOf={nameOf} t={t}
                  right={<CancelBtn id={x.id} onDone={done} notify={notify} />} />
              ))}
            </>
          ) : null}
        </View>
      ) : null}

      {list && mode === 'send' ? (
        <SendForm t={t} from={branch} branches={branches} products={d.products}
          nameOf={nameOf} notify={notify}
          onSent={(msg) => { setMode('in'); done(msg); }} />
      ) : null}

      {list && mode === 'history' ? (
        <View style={{ gap: 8 }}>
          {history.length === 0 ? (
            <Txt size={13} color={t.t3} style={{ textAlign: 'center', paddingVertical: 20 }}>Hali ko‘chirish bo‘lmagan</Txt>
          ) : history.slice(0, 25).map((x) => <Line key={x.id} x={x} nameOf={nameOf} t={t} />)}
        </View>
      ) : null}
    </Sheet>
  );
}

/* ── Kelgan tovarni sanab qabul qilish ── */
function Incoming({ x, nameOf, t, onDone, notify }) {
  const [counts, setCounts] = useState(() => Object.fromEntries(x.items.map((i) => [i.product_id, String(i.qty)])));
  const [busy, setBusy] = useState(false);
  const short = x.items.some((i) => Number(counts[i.product_id] || 0) < i.qty);

  const receive = async () => {
    setBusy(true);
    const { error } = await db.rpc('transfer_receive', {
      p_id: x.id,
      p_items: x.items.map((i) => ({ product_id: i.product_id, qty: Number(counts[i.product_id] || 0) })),
    });
    setBusy(false);
    if (error) { notify(error.message, 'error'); return; }
    onDone(short ? 'Qabul qilindi · kam kelgani qayd etildi' : 'Tovar to‘liq qabul qilindi');
  };

  return (
    <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.accdim, padding: 13, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Txt size={14} weight="500">{nameOf(x.from_branch)}</Txt>
        <Icon name="arrow-right" size={14} color={t.t3} />
        <Txt size={14} weight="500" style={{ flex: 1 }}>{nameOf(x.to_branch)}</Txt>
        <Txt size={11} color={t.t3}>{when(x.created_at)}</Txt>
      </View>
      {x.sent_by || x.note ? (
        <Txt size={12} color={t.t3}>{[x.sent_by && `Yubordi: ${x.sent_by}`, x.note].filter(Boolean).join(' · ')}</Txt>
      ) : null}
      {x.items.map((i) => (
        <View key={i.product_id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt size={13} numberOfLines={1}>{i.name}</Txt>
            <Txt size={11} color={Number(counts[i.product_id] || 0) < i.qty ? t.warn : t.t3}>
              yuborildi {i.qty} dona
            </Txt>
          </View>
          <Stepper value={counts[i.product_id]} min={0} max={i.qty}
            onChange={(v) => setCounts((c) => ({ ...c, [i.product_id]: v }))} />
        </View>
      ))}
      <Btn title={short ? 'Kam keldi — qabul qilish' : 'Qabul qildim'} icon="check"
        variant={short ? 'secondary' : 'primary'} loading={busy} onPress={receive} full />
    </View>
  );
}

function CancelBtn({ id, onDone, notify }) {
  const [busy, setBusy] = useState(false);
  const run = () => Alert.alert('Bekor qilinsinmi?', 'Tovar yuborgan filialga qaytadi.', [
    { text: 'Yo‘q', style: 'cancel' },
    {
      text: 'Bekor qilish', style: 'destructive',
      onPress: async () => {
        setBusy(true);
        const { error } = await db.rpc('transfer_cancel', { p_id: id });
        setBusy(false);
        if (error) { notify(error.message, 'error'); return; }
        onDone('Ko‘chirish bekor qilindi, tovar qaytdi');
      },
    },
  ]);
  return <Btn title="Bekor" size="sm" variant="danger" loading={busy} onPress={run} />;
}

function Line({ x, nameOf, t, right }) {
  const sent = x.items.reduce((s, i) => s + i.qty, 0);
  const got = Array.isArray(x.received) ? x.received.reduce((s, i) => s + (i.qty || 0), 0) : null;
  const st = { sent: ['Yo‘lda', t.warn], received: ['Qabul qilindi', t.ok], cancelled: ['Bekor', t.t3] }[x.status] || ['', t.t3];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderTopWidth: 1, borderColor: t.line }}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt size={13} weight="500" numberOfLines={1}>
          {nameOf(x.from_branch)} → {nameOf(x.to_branch)} <Txt size={11} color={st[1]}>· {st[0]}</Txt>
        </Txt>
        <Txt size={12} color={t.t3} numberOfLines={1}>{x.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</Txt>
        <Txt size={11} color={t.t3}>
          {when(x.created_at)}
          {x.status === 'received' && got != null && got < sent ? ` · ${sent - got} dona kam kelgan` : ''}
        </Txt>
      </View>
      {right}
    </View>
  );
}

/* ── Yuborish ── */
function SendForm({ t, from, branches, products, nameOf, notify, onSent }) {
  const targets = branches.filter((b) => b.id !== from);
  const [to, setTo] = useState(targets[0]?.id ?? null);
  const [rows, setRows] = useState({});          // product_id → qty (string)
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  const picked = Object.entries(rows).filter(([, v]) => Number(v) > 0);
  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const found = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products
      .filter((p) => p.stock > 0 && !(p.id in rows))
      .filter((p) => !s || [p.name, p.barcode, p.phone_imei1].some((v) => String(v || '').toLowerCase().includes(s)))
      .slice(0, 8);
  }, [products, rows, q]);
  const total = picked.reduce((s, [, v]) => s + Number(v), 0);

  const send = async () => {
    setBusy(true);
    const { error } = await db.rpc('transfer_send', {
      p_from: from, p_to: to,
      p_items: picked.map(([id, v]) => ({ product_id: Number(id), qty: Number(v) })),
      p_note: null,
    });
    setBusy(false);
    if (error) { notify(error.message, 'error'); return; }
    onSent(`${nameOf(to)} filialiga ${total} dona yuborildi`);
  };

  if (targets.length === 0) {
    return <Txt size={13} color={t.t3}>Boshqa filial yo‘q</Txt>;
  }

  return (
    <View style={{ gap: 12 }}>
      <SectionLabel icon="map-pin">Qayerga</SectionLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {targets.map((b) => <Chip key={b.id} label={b.name} active={to === b.id} onPress={() => setTo(b.id)} />)}
      </View>

      {picked.length > 0 ? (
        <View style={{ gap: 8 }}>
          {Object.keys(rows).map((id) => {
            const p = byId[id];
            return (
              <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt size={13} numberOfLines={1}>{p?.name}</Txt>
                  <Txt size={11} color={t.t3}>qoldiq {p?.stock}</Txt>
                </View>
                <Stepper value={rows[id]} min={0} max={p?.stock || 0}
                  onChange={(v) => setRows((r) => ({ ...r, [id]: v }))} />
              </View>
            );
          })}
        </View>
      ) : null}

      <SearchBar value={q} onChangeText={setQ} placeholder="Tovar qidirish" onClear={() => setQ('')} />
      {found.map((p) => (
        <Tap key={p.id} onPress={() => { setRows((r) => ({ ...r, [p.id]: '1' })); setQ(''); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
          <Icon name="plus" size={16} color={t.acc} />
          <Txt size={13} style={{ flex: 1 }} numberOfLines={1}>{p.name}</Txt>
          <Txt size={12} color={t.t3}>{p.stock} dona</Txt>
        </Tap>
      ))}

      <Btn title={picked.length ? `Yuborish · ${total} dona` : 'Yuborish'} icon="truck"
        disabled={!to || picked.length === 0} loading={busy} onPress={send} full />
      <Txt size={11} color={t.t3} style={{ lineHeight: 16 }}>
        Tovar shu filial qoldig‘idan darhol yechiladi va qabul qiluvchi tasdiqlaganda unda paydo bo‘ladi.
      </Txt>
    </View>
  );
}
