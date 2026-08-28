import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts';
import {
  Page, PageHeader, Card, SectionHeader, Icon, Btn, Tag, StatCard, SkeletonRows,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { analyze } from '../utils/insights';

/* ══════════════════════════════════════════════════════════════════════════
   AI Analitika

   Hisob-kitob `src/utils/insights.js` da — mobil ilova ham AYNAN shu
   fayldan foydalanadi. Shuning uchun kompyuterdagi prognoz bilan
   telefondagi prognoz bir xil chiqadi. Ilgari ikkalasi alohida
   hisoblardi va veb tomoni ancha sodda edi.

   Ekran kattaligidan foydalanamiz: telefonda sig'magan grafik va
   jadvallar bu yerda yonma-yon turadi.
   ══════════════════════════════════════════════════════════════════════ */

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
const short = n => {
  const a = Math.abs(n);
  if (a >= 1e9) return `${(n / 1e9).toFixed(1)} mlrd`;
  if (a >= 1e6) return `${(n / 1e6).toFixed(1)} mln`;
  if (a >= 1e3) return `${Math.round(n / 1e3)} ming`;
  return money(n);
};

const WEEKDAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba',
  'Payshanba', 'Juma', 'Shanba'];

const TONE = {
  critical: { color: 'var(--dang)', bg: 'var(--dangbg)', label: 'Shoshilinch' },
  warn: { color: 'var(--warn)', bg: 'var(--warnbg)', label: 'Diqqat' },
  info: { color: 'var(--color-accent)', bg: 'var(--color-accent-900)', label: 'Ma’lumot' },
  good: { color: 'var(--ok)', bg: 'var(--okbg)', label: 'Yaxshi' },
};

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState(null);

  const load = useCallback(async (storeId) => {
    setLoading(true);

    /* 92 kun — tahlil uchun yetarli va so'rov og'ir bo'lib ketmaydi.
       Chegarasiz olsak do'kon bir yil ishlagach har ochilishda
       megabaytlab ma'lumot tortiladi. */
    const since = new Date(Date.now() - 92 * 86400000).toISOString();

    const [prod, txn, debt, cust, mov] = await Promise.all([
      supabase.from('products').select('*').eq('store_id', storeId),
      supabase.from('transactions').select('*').eq('store_id', storeId)
        .gte('date', since).order('date', { ascending: false }).limit(5000),
      supabase.from('debts').select('*').eq('store_id', storeId),
      supabase.from('customers').select('*').eq('store_id', storeId),
      supabase.from('stock_movements').select('*').eq('store_id', storeId)
        .eq('type', 'tuzatish').gte('created_at', since).limit(300),
    ]);

    setRaw({
      products: prod.data || [],
      transactions: txn.data || [],
      debts: debt.data || [],
      customers: cust.data || [],
      movements: mov.data || [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.store_id) load(user.store_id);
  }, [user, load]);

  const r = useMemo(() => (raw ? analyze(raw) : null), [raw]);

  if (loading || !r) {
    return (
      <Page>
        <PageHeader title="AI Analitika" subtitle="Do‘kon holatini tahlil qilish" />
        <SkeletonRows count={5} widths={['100%']} />
      </Page>
    );
  }

  const thin = r.salesCount < 8;

  /* Prognoz grafigi: o'tgan 14 kun + keyingi 7 kun bitta chiziqda */
  const chart = [
    ...r.forecast.history.map(h => ({
      label: new Date(h.ts).getDate() + '',
      actual: h.value,
    })),
    ...r.forecast.days.map(d => ({
      label: new Date(d.ts).getDate() + '',
      forecast: d.value,
    })),
  ];

  return (
    <Page>
      <PageHeader
        title="AI Analitika"
        subtitle="Hisob-kitob shu kompyuterda bajariladi — ma’lumot hech qayerga yuborilmaydi"
      >
        <Btn variant="secondary" icon="arrows-clockwise" onClick={() => load(user.store_id)}>
          Yangilash
        </Btn>
      </PageHeader>

      {thin && (
        <Card padding="var(--space-6)" style={{
          display: 'flex', gap: 11, alignItems: 'flex-start',
          borderColor: 'var(--color-accent)',
        }}>
          <Icon name="info" size={19} color="var(--color-accent)" />
          <span style={{ fontSize: 13, color: 'var(--color-neutral-400)', lineHeight: 1.6 }}>
            Hozircha sotuvlar kam, shuning uchun xulosalar taxminiy.
            Bir-ikki hafta ishlagandan keyin tahlil ancha aniq bo‘ladi.
          </span>
        </Card>
      )}

      {/* ── Prognoz ── */}
      <Card padding="var(--space-7)" gap={0}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon name="sparkle" fill size={15} color="var(--color-accent)" />
              <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                Keyingi 7 kun prognozi
              </span>
            </div>

            {r.forecast.ready ? (
              <>
                <div className="num" style={{
                  fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 4,
                }}>
                  {money(r.forecast.week)}
                  <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--color-neutral-500)' }}> so‘m</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  {r.forecast.change != null && (
                    <Tag variant={r.forecast.change >= 0 ? 'ok' : 'dang'}>
                      {r.forecast.change >= 0 ? '▲ +' : '▼ '}{r.forecast.change}%
                    </Tag>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                    o‘tgan hafta {short(r.forecast.lastWeek)}
                  </span>
                </div>

                <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)', marginTop: 12, lineHeight: 1.6 }}>
                  Aniqlik darajasi: <b style={{ fontWeight: 500 }}>{r.forecast.confidence}</b>.
                  Hisobda haftaning qaysi kuni ekani ham inobatga olingan —
                  shanba va dushanba bir xil emas.
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 10, lineHeight: 1.6 }}>
                Prognoz uchun kamida bir haftalik sotuv kerak.
                Ilova ishlab turgani sari aniqroq bo‘lib boradi.
              </div>
            )}
          </div>

          {r.forecast.ready && (
            <div style={{ flex: 1, minWidth: 320, height: 190 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chart} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="var(--color-divider)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-neutral-500)' }}
                    axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={short} width={58}
                    tick={{ fontSize: 10, fill: 'var(--color-neutral-500)' }}
                    axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v, n) => [money(v) + ' so‘m', n === 'actual' ? 'Bo‘lgan' : 'Prognoz']}
                    contentStyle={{
                      background: 'var(--color-surface)', border: '1px solid var(--color-divider)',
                      borderRadius: 8, fontSize: 12,
                    }}
                  />
                  <ReferenceLine x={chart[r.forecast.history.length - 1]?.label}
                    stroke="var(--color-accent)" strokeDasharray="3 3" />
                  <Bar dataKey="actual" fill="var(--color-neutral-700)" radius={[3, 3, 0, 0]} />
                  <Line type="monotone" dataKey="forecast" stroke="var(--color-accent)"
                    strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>

      {/* ── Xulosalar ── */}
      <SectionHeader title="Nimaga e’tibor berish kerak" hint="Pul bahosi bo‘yicha tartiblangan — eng qimmati birinchi" />

      {r.insights.length === 0 ? (
        <Card padding="var(--space-7)" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Icon name="check-circle" fill size={26} color="var(--ok)" />
          <span style={{ fontSize: 14, color: 'var(--color-neutral-300)' }}>
            Diqqat talab qiladigan narsa topilmadi. Ombor, nasiya va
            foyda ko‘rsatkichlari normal.
          </span>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 12 }}>
          {r.insights.map(x => {
            const tone = TONE[x.severity] || TONE.info;
            return (
              <Card key={x.key} padding="var(--space-6)" gap={8}
                style={{ borderLeft: `3px solid ${tone.color}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Icon name={x.icon} size={19} color={tone.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.4 }}>{x.title}</div>
                  </div>
                  <Tag variant={x.severity === 'critical' ? 'dang'
                    : x.severity === 'warn' ? 'warn'
                      : x.severity === 'good' ? 'ok' : 'neutral'}>
                    {tone.label}
                  </Tag>
                </div>
                <div style={{
                  fontSize: 12.5, color: 'var(--color-neutral-400)',
                  lineHeight: 1.65, marginLeft: 29,
                }}>
                  {x.body}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Tugash xavfi ── */}
      {r.stockRisk.length > 0 && (
        <>
          <SectionHeader title="Tugayotgan tovarlar" hint="Sotuv tezligiga qarab hisoblangan" />
          <Card padding={0}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Tovar</th>
                    <th style={{ textAlign: 'right' }}>Qoldiq</th>
                    <th style={{ textAlign: 'right' }}>Kuniga</th>
                    <th style={{ textAlign: 'right' }}>Necha kun</th>
                    <th style={{ textAlign: 'right' }}>Kirim kerak</th>
                  </tr>
                </thead>
                <tbody>
                  {r.stockRisk.map(x => {
                    const days = Math.max(0, Math.round(x.daysLeft));
                    const c = days <= 3 ? 'var(--dang)' : days <= 7 ? 'var(--warn)' : 'var(--color-neutral-400)';
                    return (
                      <tr key={x.product.id}>
                        <td style={{ fontWeight: 500 }}>{x.product.name}</td>
                        <td className="num" style={{ textAlign: 'right' }}>{x.product.stock}</td>
                        <td className="num" style={{ textAlign: 'right', color: 'var(--color-neutral-500)' }}>
                          {x.velocity.toFixed(1)}
                        </td>
                        <td className="num" style={{ textAlign: 'right', color: c, fontWeight: 600 }}>
                          {days}
                        </td>
                        <td className="num" style={{ textAlign: 'right', color: 'var(--color-accent)' }}>
                          {x.reorder} dona
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* ── Foyda ── */}
      <SectionHeader title="Foyda tahlili" hint="Oxirgi 30 kun" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <StatCard label="Tushum" value={short(r.margins.revenue)} unit="so‘m" icon="coin"
          accent="var(--color-accent)" />
        <StatCard label="Yalpi foyda" value={short(r.margins.profit)} unit="so‘m" icon="chart-line-up"
          accent={r.margins.profit >= 0 ? 'var(--ok)' : 'var(--dang)'} />
        <StatCard label="Marja" value={`${Math.round(r.margins.percent)}%`} icon="percent"
          hint={r.margins.percent >= 25 ? 'yaxshi' : r.margins.percent >= 12 ? 'o‘rtacha' : 'past'}
          accent={r.margins.percent >= 25 ? 'var(--ok)' : r.margins.percent >= 12 ? 'var(--warn)' : 'var(--dang)'} />
        <StatCard label="Cheklar" value={r.salesCount} unit="ta" icon="receipt" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
        {r.margins.stars.length > 0 && (
          <Card padding="var(--space-6)" gap={10}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Eng ko‘p foyda keltirganlar</div>
            {r.margins.stars.map((s, i) => (
              <div key={s.name + i} style={{
                display: 'flex', alignItems: 'center', gap: 10, paddingTop: 7,
                borderTop: i ? '1px solid var(--color-divider)' : 'none',
              }}>
                <span style={{ width: 20, fontSize: 13, fontWeight: 600, color: 'var(--color-accent)' }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 13 }}>{s.name}</span>
                <span className="num" style={{ fontSize: 12, color: 'var(--color-neutral-500)', width: 46, textAlign: 'right' }}>
                  {Math.round(s.margin)}%
                </span>
                <span className="num" style={{
                  fontSize: 13, fontWeight: 500, width: 96, textAlign: 'right',
                  color: s.profit >= 0 ? 'var(--ok)' : 'var(--dang)',
                }}>
                  {money(s.profit)}
                </span>
              </div>
            ))}
          </Card>
        )}

        {r.margins.weak.length > 0 && (
          <Card padding="var(--space-6)" gap={10} style={{ borderColor: 'var(--warn)' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--warn)' }}>
              Marjasi past tovarlar
            </div>
            {r.margins.weak.map((w, i) => (
              <div key={w.name + i} style={{
                display: 'flex', justifyContent: 'space-between', gap: 10, paddingTop: 7,
                borderTop: i ? '1px solid var(--color-divider)' : 'none',
              }}>
                <span style={{ fontSize: 13 }}>{w.name}</span>
                <span className="num" style={{
                  fontSize: 13, fontWeight: 500,
                  color: w.margin < 0 ? 'var(--dang)' : 'var(--warn)',
                }}>
                  {Math.round(w.margin)}%
                </span>
              </div>
            ))}
          </Card>
        )}

        {r.deadStock.length > 0 && (
          <Card padding="var(--space-6)" gap={10}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              Qotib qolgan pul
              <span className="num" style={{ color: 'var(--warn)', marginLeft: 8 }}>
                {money(r.deadStock.reduce((s, x) => s + x.frozen, 0))} so‘m
              </span>
            </div>
            {r.deadStock.slice(0, 6).map((x, i) => (
              <div key={x.product.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, paddingTop: 7,
                borderTop: i ? '1px solid var(--color-divider)' : 'none',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13 }}>{x.product.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
                    {x.neverSold ? 'hech sotilmagan' : `${x.idleDays} kundan beri turibdi`}
                    {' · '}{x.product.stock} dona
                  </div>
                </div>
                <span className="num" style={{ fontSize: 13, fontWeight: 500, color: 'var(--warn)' }}>
                  {money(x.frozen)}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* ── Vaqt va mijozlar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
        {r.timing.count >= 5 && (
          <Card padding="var(--space-6)" gap={12}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Qachon odam ko‘p</div>
            <div style={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={r.timing.hours.slice(7, 23).map((v, i) => ({ h: `${i + 7}`, v }))}
                  margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                >
                  <CartesianGrid stroke="var(--color-divider)" vertical={false} />
                  <XAxis dataKey="h" tick={{ fontSize: 10, fill: 'var(--color-neutral-500)' }}
                    axisLine={false} tickLine={false} />
                  <YAxis width={28} tick={{ fontSize: 10, fill: 'var(--color-neutral-500)' }}
                    axisLine={false} tickLine={false} />
                  <Tooltip formatter={v => [`${v} ta chek`, 'Sotuv']}
                    contentStyle={{
                      background: 'var(--color-surface)', border: '1px solid var(--color-divider)',
                      borderRadius: 8, fontSize: 12,
                    }} />
                  <Bar dataKey="v" radius={[3, 3, 0, 0]}>
                    {r.timing.hours.slice(7, 23).map((v, i) => (
                      <Cell key={i} fill={v === Math.max(...r.timing.hours.slice(7, 23))
                        ? 'var(--color-accent)' : 'var(--color-neutral-700)'} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {r.timing.peak && (
              <div style={{ fontSize: 12.5, color: 'var(--color-neutral-400)', lineHeight: 1.6 }}>
                Eng gavjum vaqt —{' '}
                <b style={{ fontWeight: 500, color: 'var(--color-accent)' }}>
                  {String(r.timing.peak.from).padStart(2, '0')}:00–
                  {String(r.timing.peak.from + 3).padStart(2, '0')}:00
                </b>.
                Eng gavjum kun — {WEEKDAYS[r.timing.bestDow]},
                eng sust — {WEEKDAYS[r.timing.worstDow]}.
              </div>
            )}
          </Card>
        )}

        {r.customers.withPurchase > 0 && (
          <Card padding="var(--space-6)" gap={10}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Mijozlar</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div>
                <div className="num" style={{ fontSize: 22, fontWeight: 600 }}>
                  {Math.round(r.customers.repeatShare)}%
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
                  qaytib kelgan · {r.customers.repeat} ta
                </div>
              </div>
              <div>
                <div className="num" style={{ fontSize: 22, fontWeight: 600 }}>{r.customers.fresh}</div>
                <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
                  yangi · 30 kunda
                </div>
              </div>
              <div>
                <div className="num" style={{ fontSize: 22, fontWeight: 600, color: r.customers.churn.length ? 'var(--warn)' : undefined }}>
                  {r.customers.churn.length}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
                  yo‘qolgan
                </div>
              </div>
            </div>

            {r.customers.top.map((c, i) => (
              <div key={c.customer.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, paddingTop: 7,
                borderTop: '1px solid var(--color-divider)',
              }}>
                <span style={{ width: 20, fontSize: 13, fontWeight: 600, color: 'var(--color-accent)' }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 13 }}>{c.customer.name}</span>
                <span style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>{c.count} marta</span>
                <span className="num" style={{ fontSize: 13, fontWeight: 500, width: 100, textAlign: 'right' }}>
                  {money(c.sum)}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* ── Xavf ko'rsatkichlari ── */}
      <SectionHeader title="Xavf ko‘rsatkichlari" hint="Oxirgi 30 kun" />
      <Card padding={0}>
        <table className="table">
          <tbody>
            <RiskRow label="Qaytarishlar ulushi" value={`${r.risks.refundRate.toFixed(1)}%`}
              hint="Odatda 3% dan oshmaydi"
              ok={r.risks.refundRate <= 3} warn={r.risks.refundRate <= 7} />
            <RiskRow label="Nasiyaga sotuv" value={`${Math.round(r.risks.creditShare)}%`}
              hint="Uchdan biridan oshsa kassada aylanma pul qolmaydi"
              ok={r.risks.creditShare <= 20} warn={r.risks.creditShare <= 35} />
            <RiskRow label="Chegirmalar ulushi" value={`${r.risks.discountShare.toFixed(1)}%`}
              hint="Foydani sezdirmay yeydi"
              ok={r.risks.discountShare <= 5} warn={r.risks.discountShare <= 12} />
            <RiskRow label="Qo‘lda qoldiq tuzatish" value={`${r.risks.manualCount} marta`}
              hint="Har biri hisobga olinmagan narsani bildiradi"
              ok={r.risks.manualCount === 0} warn={r.risks.manualCount <= 2} />
            <RiskRow label="Muddati o‘tgan qarz" value={`${money(r.risks.overdueSum)} so‘m`}
              hint={`${r.risks.overdueCount} ta nasiya`}
              ok={r.risks.overdueSum === 0} warn={r.risks.overdueSum < 500000} last />
          </tbody>
        </table>
      </Card>

      <div style={{
        display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 4,
        fontSize: 11.5, color: 'var(--color-neutral-500)', lineHeight: 1.6,
      }}>
        <Icon name="shield-check" size={16} />
        <span>
          Barcha hisob-kitob shu kompyuterda bajarildi. Do‘kon ma’lumoti
          tahlil uchun hech qayerga yuborilmaydi. Mobil ilova ham aynan
          shu hisobdan foydalanadi — raqamlar bir xil chiqadi.
        </span>
      </div>
    </Page>
  );
}

function RiskRow({ label, value, hint, ok, warn, last }) {
  const color = ok ? 'var(--ok)' : warn ? 'var(--warn)' : 'var(--dang)';
  return (
    <tr style={last ? { borderBottom: 0 } : undefined}>
      <td style={{ width: 10 }}>
        <span style={{
          display: 'block', width: 8, height: 8, borderRadius: 4, background: color,
        }} />
      </td>
      <td>
        <div style={{ fontSize: 13.5 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>{hint}</div>
      </td>
      <td className="num" style={{ textAlign: 'right', fontWeight: 600, color }}>{value}</td>
    </tr>
  );
}
