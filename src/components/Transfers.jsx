import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Icon, Btn, Tag, Field, EmptyState, SkeletonRows } from './UI';
import { supabase } from '../utils/supabaseClient';

/* ══════════════════════════════════════════════════════════════════════════
   Filiallar orasida tovar ko'chirish

   Oqim (baza funksiyalari — transfer_send / receive / cancel):
     1. Yuboruvchi filial tovarni tanlab jo'natadi → o'z qoldig'idan
        darhol yechiladi, ko'chirish "yo'lda" bo'ladi
     2. Qabul qiluvchi filial kelganini sanab tasdiqlaydi → shu filialga
        qo'shiladi. Kam kelsa — kelgan sonini yozadi, farq tarixda qoladi
     3. Yetib bormaguncha yuboruvchi bekor qila oladi → qoldiq qaytadi

   Yo'ldagi tovar hech bir filialda sotilmaydi — ikki joyda bir vaqtda
   "bor" bo'lib qolmasligi uchun.
   ══════════════════════════════════════════════════════════════════════ */

const fmtDate = (d) => (d ? new Date(d).toLocaleString('uz-UZ', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
}) : '');

const STATUS = {
  sent: { label: 'Yo‘lda', variant: 'warn' },
  received: { label: 'Qabul qilindi', variant: 'ok' },
  cancelled: { label: 'Bekor qilindi', variant: 'neutral' },
};

export default function Transfers({ products, branches, activeBranch, pinnedBranch, onChooseBranch, onDone, onError }) {
  const [list, setList] = useState(null);
  const current = typeof activeBranch === 'number' ? activeBranch : null;
  const nameOf = useCallback((id) => branches.find(b => b.id === id)?.name || `#${id}`, [branches]);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('transfers').select('*')
      .order('id', { ascending: false }).limit(60);
    if (error) onError(error.message);
    setList(data || []);
  }, [onError]);
  useEffect(() => { load(); }, [load]);

  const after = (msg) => { load(); onDone(msg); };

  if (branches.length < 2) {
    return (
      <Card padding="var(--space-6)">
        <EmptyState icon="map-pin" text="Hozircha bitta filial"
          sub="Ikkinchi filialni Sozlamalar → Filiallar bo‘limida qo‘shing — shundan keyin tovarni filiallar orasida ko‘chira olasiz." />
      </Card>
    );
  }

  const incoming = (list || []).filter(t => t.status === 'sent' && (current == null || t.to_branch === current));
  const outgoing = (list || []).filter(t => t.status === 'sent' && current != null && t.from_branch === current);
  const history = (list || []).filter(t => t.status !== 'sent');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 14, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {current == null ? (
          <Card padding="var(--space-6)" gap={10}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Qaysi filialdan yuborasiz?</div>
            <div style={{ fontSize: 12.5, color: 'var(--color-neutral-400)' }}>
              Hozir barcha filiallar birga ko‘rsatilmoqda. Yuborish uchun manba filialni tanlang.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {branches.map(b => (
                <Btn key={b.id} variant="secondary" size="sm" onClick={() => onChooseBranch(b.id)}>{b.name}</Btn>
              ))}
            </div>
          </Card>
        ) : (
          <SendCard products={products} branches={branches} from={current}
            nameOf={nameOf} onSent={after} onError={onError} />
        )}
        {outgoing.length > 0 && (
          <Card padding="var(--space-6)" gap={10}>
            <SectionTitle icon="truck" text="Yuborilgan, yo‘lda" count={outgoing.length} />
            {outgoing.map(t => (
              <TransferRow key={t.id} t={t} nameOf={nameOf}
                action={<CancelBtn t={t} onDone={after} onError={onError} />} />
            ))}
          </Card>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card padding="var(--space-6)" gap={10}>
          <SectionTitle icon="package" text={current == null ? 'Yo‘ldagi ko‘chirishlar' : 'Kelayotgan tovarlar'}
            count={incoming.length} />
          {list == null ? <SkeletonRows count={2} widths={['100%']} />
            : incoming.length === 0 ? (
              <div style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', padding: '6px 0' }}>
                Kutilayotgan ko‘chirish yo‘q
              </div>
            ) : incoming.map(t => (
              <ReceiveBlock key={t.id} t={t} nameOf={nameOf}
                canReceive={current === t.to_branch || (current == null && !pinnedBranch)}
                canCancel={current == null && !pinnedBranch}
                onDone={after} onError={onError} />
            ))}
        </Card>

        <Card padding="var(--space-6)" gap={10}>
          <SectionTitle icon="clock-counter-clockwise" text="Tarix" />
          {list == null ? <SkeletonRows count={3} widths={['100%']} />
            : history.length === 0 ? (
              <div style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', padding: '6px 0' }}>Hali ko‘chirish bo‘lmagan</div>
            ) : history.slice(0, 30).map(t => <TransferRow key={t.id} t={t} nameOf={nameOf} />)}
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({ icon, text, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
      <Icon name={icon} size={16} color="var(--color-accent)" />
      {text}
      {count > 0 && <Tag variant="accent">{count}</Tag>}
    </div>
  );
}

/* ── Yuborish: bir nechta tovar bitta ko'chirishda ── */
function SendCard({ products, branches, from, nameOf, onSent, onError }) {
  const targets = branches.filter(b => b.id !== from);
  const [to, setTo] = useState(targets[0]?.id ?? '');
  const [rows, setRows] = useState([]);          // [{id, qty}]
  const [pick, setPick] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!targets.some(b => b.id === Number(to))) setTo(targets[0]?.id ?? ''); }, [targets, to]);

  const byId = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products]);
  const avail = products.filter(p => p.stock > 0 && !rows.some(r => r.id === p.id));

  const add = (id) => {
    if (!id) return;
    setRows(r => [...r, { id: Number(id), qty: '1' }]);
    setPick('');
  };
  const setQty = (id, v) => setRows(r => r.map(x => (x.id === id ? { ...x, qty: v.replace(/\D/g, '') } : x)));
  const remove = (id) => setRows(r => r.filter(x => x.id !== id));

  const bad = rows.find(r => !(Number(r.qty) > 0) || Number(r.qty) > (byId[r.id]?.stock || 0));
  const valid = to && rows.length > 0 && !bad;
  const totalQty = rows.reduce((s, r) => s + (Number(r.qty) || 0), 0);

  const send = async () => {
    setSaving(true);
    const { error } = await supabase.rpc('transfer_send', {
      p_from: from, p_to: Number(to),
      p_items: rows.map(r => ({ product_id: r.id, qty: Number(r.qty) })),
      p_note: note.trim() || null,
    });
    setSaving(false);
    if (error) { onError(`Yuborilmadi: ${error.message}`); return; }
    setRows([]); setNote('');
    onSent(`${nameOf(Number(to))} filialiga ${totalQty} dona yuborildi — qabul qilinishini kutmoqda`);
  };

  return (
    <Card padding="var(--space-6)" gap={12}>
      <SectionTitle icon="truck" text="Tovar yuborish" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', marginBottom: 4 }}>Qayerdan</div>
          <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="map-pin" size={14} color="var(--color-accent)" /> {nameOf(from)}
          </div>
        </div>
        <Icon name="arrow-right" size={18} color="var(--color-neutral-500)" style={{ marginTop: 18 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', marginBottom: 4 }}>Qayerga</div>
          <select className="input" value={to} onChange={e => setTo(Number(e.target.value))}>
            {targets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <Field label="Tovar qo‘shish">
        <select className="input" value={pick} onChange={e => add(e.target.value)}>
          <option value="">Tovarni tanlang…</option>
          {avail.map(p => <option key={p.id} value={p.id}>{p.name} — bu filialda {p.stock}</option>)}
        </select>
      </Field>

      {rows.map(r => {
        const p = byId[r.id];
        const over = Number(r.qty) > (p?.stock || 0);
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p?.name}</div>
              <div style={{ fontSize: 11, color: over ? 'var(--dang)' : 'var(--color-neutral-500)' }}>
                {over ? `Bu filialda faqat ${p?.stock} dona bor` : `Qoldiq: ${p?.stock}`}
              </div>
            </div>
            <input className="input num" inputMode="numeric" value={r.qty} onChange={e => setQty(r.id, e.target.value)}
              style={{ width: 80, textAlign: 'center', borderColor: over ? 'var(--dang)' : undefined }} />
            <Btn variant="ghost" iconOnly icon="x" title="Olib tashlash" onClick={() => remove(r.id)} />
          </div>
        );
      })}

      <Field label="Izoh" hint="Masalan: haydovchi ismi yoki sabab">
        <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="ixtiyoriy" />
      </Field>

      <Btn variant="primary" icon="truck" block disabled={!valid} loading={saving} onClick={send} style={{ minHeight: 42 }}>
        {rows.length ? `Yuborish · ${totalQty} dona` : 'Yuborish'}
      </Btn>
      <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>
        Yuborilgan tovar shu filial qoldig‘idan darhol yechiladi. Qabul qiluvchi filial
        tasdiqlaganda unda paydo bo‘ladi.
      </div>
    </Card>
  );
}

/* ── Qabul qilish: kelgan sonini sanab tasdiqlash ── */
function ReceiveBlock({ t, nameOf, canReceive, canCancel, onDone, onError }) {
  const [counts, setCounts] = useState(() => Object.fromEntries(t.items.map(i => [i.product_id, String(i.qty)])));
  const [saving, setSaving] = useState(false);

  const short = t.items.some(i => Number(counts[i.product_id] || 0) < i.qty);

  const receive = async () => {
    setSaving(true);
    const { error } = await supabase.rpc('transfer_receive', {
      p_id: t.id,
      p_items: t.items.map(i => ({ product_id: i.product_id, qty: Math.min(i.qty, Number(counts[i.product_id] || 0)) })),
    });
    setSaving(false);
    if (error) { onError(`Qabul qilinmadi: ${error.message}`); return; }
    onDone(short ? 'Qabul qilindi — kam kelgani tarixda qayd etildi' : 'Tovar to‘liq qabul qilindi');
  };

  return (
    <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <b style={{ fontWeight: 500 }}>{nameOf(t.from_branch)}</b>
        <Icon name="arrow-right" size={13} color="var(--color-neutral-500)" />
        <b style={{ fontWeight: 500 }}>{nameOf(t.to_branch)}</b>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>#{t.id} · {fmtDate(t.created_at)}</span>
      </div>
      {(t.sent_by || t.note) && (
        <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
          {[t.sent_by && `Yubordi: ${t.sent_by}`, t.note].filter(Boolean).join(' · ')}
        </div>
      )}
      {t.items.map(i => (
        <div key={i.product_id} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5 }}>
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.name}</span>
          <span style={{ color: 'var(--color-neutral-500)' }}>yuborildi {i.qty}</span>
          {canReceive && (
            <input className="input num" inputMode="numeric" title="Kelgan soni"
              value={counts[i.product_id]}
              onChange={e => setCounts(c => ({ ...c, [i.product_id]: e.target.value.replace(/\D/g, '') }))}
              style={{
                width: 70, textAlign: 'center',
                borderColor: Number(counts[i.product_id] || 0) < i.qty ? 'var(--warn)' : undefined,
              }} />
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {canCancel && <CancelBtn t={t} onDone={onDone} onError={onError} />}
        {canReceive && (
          <Btn variant="primary" size="sm" icon="check" loading={saving} onClick={receive}>
            {short ? 'Kam keldi — qabul qilish' : 'Qabul qilish'}
          </Btn>
        )}
      </div>
    </div>
  );
}

function CancelBtn({ t, onDone, onError }) {
  const [busy, setBusy] = useState(false);
  const cancel = async () => {
    if (!window.confirm('Ko‘chirish bekor qilinsinmi? Tovar yuborgan filialga qaytadi.')) return;
    setBusy(true);
    const { error } = await supabase.rpc('transfer_cancel', { p_id: t.id });
    setBusy(false);
    if (error) { onError(`Bekor qilinmadi: ${error.message}`); return; }
    onDone('Ko‘chirish bekor qilindi, tovar qaytdi');
  };
  return <Btn variant="ghost" size="sm" loading={busy} onClick={cancel}>Bekor qilish</Btn>;
}

function TransferRow({ t, nameOf, action }) {
  const st = STATUS[t.status] || STATUS.sent;
  const sent = t.items.reduce((s, i) => s + i.qty, 0);
  const got = Array.isArray(t.received) ? t.received.reduce((s, i) => s + (i.qty || 0), 0) : null;
  return (
    <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 9, display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          {nameOf(t.from_branch)} <Icon name="arrow-right" size={12} color="var(--color-neutral-500)" /> {nameOf(t.to_branch)}
          <Tag variant={st.variant}>{st.label}</Tag>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {t.items.map(i => `${i.name} × ${i.qty}`).join(', ')}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
          #{t.id} · {fmtDate(t.created_at)}
          {t.status === 'received' && got != null && got < sent && (
            <span style={{ color: 'var(--dang)' }}> · {sent - got} dona kam kelgan</span>
          )}
          {t.received_by && ` · ${t.received_by}`}
        </div>
      </div>
      {action}
    </div>
  );
}
