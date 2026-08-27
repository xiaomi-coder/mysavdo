import React, { useState, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Btn, Icon, Header, SectionLabel, Skeleton,
} from '../ui';
import { db } from '../lib/api';
import { analyze } from '../lib/insights';
import { money, shortMoney, weekdayShort } from '../lib/format';
import { alpha, R } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   AI Analitika

   Bu ekran grafik ko'rsatish uchun emas — QAROR qabul qilish uchun.
   Shuning uchun tepasida "nimaga e'tibor berish kerak" turadi va har
   xulosa ostida to'g'ridan-to'g'ri kerakli ekranga olib boradigan
   tugma bor.

   Barcha hisob-kitob telefonda bajariladi: do'kon ma'lumoti hech
   qayerga yuborilmaydi va internetsiz ham ishlaydi.
   ══════════════════════════════════════════════════════════════════════ */

export default function Analytics({ navigation }) {
  const { t } = useTheme();
  const d = useData();
  const { store } = useAuth();

  const [wide, setWide] = useState(null);      // 90 kunlik sotuvlar
  const [moves, setMoves] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  /* Tahlil uchun uzoqroq tarix kerak — asosiy ro'yxat oxirgi 300 ta
     bilan cheklangan, bu esa faol do'konda bir haftaga ham yetmasligi
     mumkin. */
  const load = React.useCallback(async () => {
    if (!d.storeId) return;
    const since = new Date(Date.now() - 92 * 86400000).toISOString();

    const [tx, mv] = await Promise.all([
      db.from('transactions').select('*')
        .eq('store_id', d.storeId).gte('date', since)
        .order('date', { ascending: false }).limit(3000),
      db.from('stock_movements').select('*')
        .eq('store_id', d.storeId).eq('type', 'tuzatish')
        .order('created_at', { ascending: false }).limit(200),
    ]);

    setWide(tx.data || []);
    setMoves(mv.data || []);
  }, [d.storeId]);

  useEffect(() => { load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([load(), d.reload({ silent: true })]);
    setRefreshing(false);
  };

  const r = useMemo(() => {
    if (!wide) return null;
    return analyze({
      products: d.products,
      transactions: wide,
      debts: d.debts,
      customers: d.customers,
      movements: moves,
    });
  }, [wide, moves, d.products, d.debts, d.customers]);

  if (!r) {
    return (
      <Screen>
        <Header title="AI Analitika" onBack={() => navigation.goBack()} />
        <View style={{ gap: 12 }}>
          <Skeleton height={200} />
          <Skeleton height={110} />
          <Skeleton height={110} />
          <Skeleton height={160} />
        </View>
      </Screen>
    );
  }

  const thin = r.salesCount < 8;

  return (
    <Screen onRefresh={refresh} refreshing={refreshing} bottomPad={40}>
      <Header
        title="AI Analitika"
        sub={store?.name}
        onBack={() => navigation.goBack()}
      />

      {thin ? (
        <Card border={t.accdim} pad={14} style={{ marginBottom: 14, flexDirection: 'row', gap: 11 }}>
          <Icon name="info" size={19} color={t.acc} />
          <Txt size={12.5} color={t.t3} style={{ flex: 1, lineHeight: 18 }}>
            Hozircha sotuvlar kam, shuning uchun xulosalar taxminiy.
            Bir-ikki hafta ishlagandan keyin tahlil ancha aniq bo‘ladi.
          </Txt>
        </Card>
      ) : null}

      {/* ── Prognoz ── */}
      <Forecast f={r.forecast} />

      {/* ── Xulosalar ── */}
      {r.insights.length > 0 ? (
        <>
          <SectionLabel icon="sparkle" style={{ marginTop: 20 }}>
            NIMAGA E’TIBOR BERISH KERAK
          </SectionLabel>
          <View style={{ gap: 10 }}>
            {r.insights.map((x) => (
              <Insight key={x.key} data={x} navigation={navigation} />
            ))}
          </View>
        </>
      ) : (
        <Card pad={16} style={{ marginTop: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name="check-circle" size={26} color={t.ok} fill />
          <Txt size={14} color={t.t2} style={{ flex: 1, lineHeight: 20 }}>
            Diqqat talab qiladigan narsa topilmadi. Ombor, nasiya va
            foyda ko‘rsatkichlari normal.
          </Txt>
        </Card>
      )}

      {/* ── Tugayotgan tovarlar ── */}
      {r.stockRisk.length > 0 ? (
        <>
          <SectionLabel icon="package" style={{ marginTop: 22 }}>
            TUGAYOTGAN TOVARLAR
          </SectionLabel>
          <Card pad={0} style={{ overflow: 'hidden' }}>
            {r.stockRisk.slice(0, 8).map((x, i) => {
              const days = Math.max(0, Math.round(x.daysLeft));
              const c = days <= 3 ? t.err : days <= 7 ? t.warn : t.t3;
              return (
                <View key={x.product.id} style={{
                  paddingHorizontal: 14, paddingVertical: 12,
                  borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.line,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Txt size={14} weight="500" numberOfLines={1}>{x.product.name}</Txt>
                      <Txt size={11.5} color={t.t4} style={{ marginTop: 2 }}>
                        {x.product.stock} dona qoldi · kuniga {x.velocity.toFixed(1)} dona
                      </Txt>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Txt size={16} weight="600" color={c}>{days}</Txt>
                      <Txt size={10.5} color={c}>kun</Txt>
                    </View>
                  </View>

                  {/* Qancha qolgani — chiziq bilan */}
                  <View style={{
                    height: 3, borderRadius: 2, backgroundColor: t.line,
                    marginTop: 9, overflow: 'hidden',
                  }}>
                    <View style={{
                      width: `${Math.min(100, (days / 21) * 100)}%`,
                      height: '100%', backgroundColor: c, borderRadius: 2,
                    }} />
                  </View>

                  <Txt size={11.5} color={t.acctext} style={{ marginTop: 8 }}>
                    Bir oyga yetishi uchun {x.reorder} dona kirim qiling
                  </Txt>
                </View>
              );
            })}
          </Card>
        </>
      ) : null}

      {/* ── Foyda ── */}
      <SectionLabel icon="coin" style={{ marginTop: 22 }}>FOYDA TAHLILI · 30 KUN</SectionLabel>
      <Card pad={16}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14 }}>
          <View style={{ flex: 1 }}>
            <Txt size={12} color={t.t3}>Yalpi foyda</Txt>
            <Txt size={26} weight="600" color={r.margins.profit >= 0 ? t.t1 : t.err}
              style={{ marginTop: 2 }}>
              {money(r.margins.profit)} <Txt size={13} color={t.t4}>so‘m</Txt>
            </Txt>
          </View>
          <MarginGauge percent={r.margins.percent} />
        </View>

        {r.margins.stars.length > 0 ? (
          <>
            <Txt size={12} color={t.t4} style={{ marginTop: 16, marginBottom: 4 }}>
              Eng ko‘p foyda keltirganlar
            </Txt>
            {r.margins.stars.map((s, i) => (
              <View key={s.name + i} style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                paddingVertical: 7, borderTopWidth: 1, borderTopColor: t.line,
              }}>
                <Txt size={13} weight="600" color={t.acc} style={{ width: 20 }}>{i + 1}</Txt>
                <Txt size={13.5} style={{ flex: 1 }} numberOfLines={1}>{s.name}</Txt>
                <Txt size={11.5} color={t.t4} style={{ width: 46, textAlign: 'right' }}>
                  {Math.round(s.margin)}%
                </Txt>
                <Txt size={13.5} weight="500" color={s.profit >= 0 ? t.ok : t.err}
                  style={{ width: 78, textAlign: 'right' }}>
                  {money(s.profit)}
                </Txt>
              </View>
            ))}
          </>
        ) : null}

        {r.margins.weak.length > 0 ? (
          <View style={{
            marginTop: 14, padding: 12, borderRadius: R.md,
            backgroundColor: alpha(t.warnRgb, 0.08),
            borderWidth: 1, borderColor: alpha(t.warnRgb, 0.3),
          }}>
            <Txt size={12} weight="500" color={t.warn}>Marjasi past tovarlar</Txt>
            {r.margins.weak.map((w, i) => (
              <View key={w.name + i} style={{
                flexDirection: 'row', justifyContent: 'space-between', marginTop: 6,
              }}>
                <Txt size={12.5} color={t.t2} style={{ flex: 1 }} numberOfLines={1}>{w.name}</Txt>
                <Txt size={12.5} weight="500" color={w.margin < 0 ? t.err : t.warn}>
                  {Math.round(w.margin)}%
                </Txt>
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      {/* ── Qotib qolgan pul ── */}
      {r.deadStock.length > 0 ? (
        <>
          <SectionLabel icon="clock" style={{ marginTop: 22 }}>QOTIB QOLGAN PUL</SectionLabel>
          <Card pad={16}>
            <Txt size={26} weight="600">
              {money(r.deadStock.reduce((s, x) => s + x.frozen, 0))}{' '}
              <Txt size={13} color={t.t4}>so‘m</Txt>
            </Txt>
            <Txt size={12} color={t.t3} style={{ marginTop: 3, lineHeight: 17 }}>
              {r.deadStock.length} ta tovar 45 kundan beri sotilmadi
            </Txt>

            {r.deadStock.slice(0, 6).map((x, i) => (
              <View key={x.product.id} style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                paddingVertical: 8, marginTop: i === 0 ? 10 : 0,
                borderTopWidth: 1, borderTopColor: t.line,
              }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt size={13.5} numberOfLines={1}>{x.product.name}</Txt>
                  <Txt size={11} color={t.t4} style={{ marginTop: 1 }}>
                    {x.neverSold ? 'hech sotilmagan' : `${x.idleDays} kundan beri turibdi`}
                    {' · '}{x.product.stock} dona
                  </Txt>
                </View>
                <Txt size={13.5} weight="500" color={t.warn}>{money(x.frozen)}</Txt>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      {/* ── Ish vaqti ── */}
      {r.timing.count >= 5 ? (
        <>
          <SectionLabel icon="clock" style={{ marginTop: 22 }}>QACHON KO‘P SOTILADI</SectionLabel>
          <Card pad={16}>
            <HourChart hours={r.timing.hours} />
            {r.timing.peak ? (
              <Txt size={12.5} color={t.t2} style={{ marginTop: 12, lineHeight: 18 }}>
                Eng gavjum vaqt — <Txt size={12.5} weight="600" color={t.acctext}>
                  {String(r.timing.peak.from).padStart(2, '0')}:00–
                  {String(r.timing.peak.from + 3).padStart(2, '0')}:00
                </Txt>. Shu soatlarda kassada odam yetarli bo‘lsin.
              </Txt>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <DayBox label="Eng gavjum kun" value={weekdayShort(dowDate(r.timing.bestDow))} color={t.ok} />
              {r.timing.worstDow != null && r.timing.worstDow !== r.timing.bestDow ? (
                <DayBox label="Eng sust kun" value={weekdayShort(dowDate(r.timing.worstDow))} color={t.t3} />
              ) : null}
            </View>
          </Card>
        </>
      ) : null}

      {/* ── Mijozlar ── */}
      {r.customers.withPurchase > 0 ? (
        <>
          <SectionLabel icon="users" style={{ marginTop: 22 }}>MIJOZLAR</SectionLabel>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Metric label="Qaytib kelgan" value={`${Math.round(r.customers.repeatShare)}%`}
              sub={`${r.customers.repeat} mijoz`} />
            <Metric label="Yangi mijozlar" value={String(r.customers.fresh)} sub="30 kunda" />
          </View>

          {r.customers.top.length > 0 ? (
            <Card pad={16} style={{ marginTop: 10 }}>
              <Txt size={12} color={t.t4} style={{ marginBottom: 4 }}>Eng ko‘p xarid qilganlar</Txt>
              {r.customers.top.map((c, i) => (
                <View key={c.customer.id} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  paddingVertical: 7, borderTopWidth: 1, borderTopColor: t.line,
                }}>
                  <Txt size={13} weight="600" color={t.acc} style={{ width: 20 }}>{i + 1}</Txt>
                  <Txt size={13.5} style={{ flex: 1 }} numberOfLines={1}>{c.customer.name}</Txt>
                  <Txt size={11.5} color={t.t4}>{c.count} marta</Txt>
                  <Txt size={13.5} weight="500" style={{ width: 80, textAlign: 'right' }}>
                    {money(c.sum)}
                  </Txt>
                </View>
              ))}
            </Card>
          ) : null}
        </>
      ) : null}

      {/* ── Xavf ko'rsatkichlari ── */}
      <SectionLabel icon="shield" style={{ marginTop: 22 }}>XAVF KO‘RSATKICHLARI</SectionLabel>
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <RiskRow label="Qaytarishlar ulushi" value={`${r.risks.refundRate.toFixed(1)}%`}
          ok={r.risks.refundRate <= 3} warn={r.risks.refundRate <= 7} first />
        <RiskRow label="Nasiyaga sotuv" value={`${Math.round(r.risks.creditShare)}%`}
          ok={r.risks.creditShare <= 20} warn={r.risks.creditShare <= 35} />
        <RiskRow label="Chegirmalar ulushi" value={`${r.risks.discountShare.toFixed(1)}%`}
          ok={r.risks.discountShare <= 5} warn={r.risks.discountShare <= 12} />
        <RiskRow label="Qo‘lda tuzatish" value={`${r.risks.manualCount} marta`}
          ok={r.risks.manualCount === 0} warn={r.risks.manualCount <= 2} />
        <RiskRow label="Muddati o‘tgan qarz" value={money(r.risks.overdueSum)}
          ok={r.risks.overdueSum === 0} warn={r.risks.overdueSum < 500000} />
      </Card>

      <View style={{
        flexDirection: 'row', gap: 10, alignItems: 'flex-start',
        marginTop: 20, padding: 13, borderRadius: R.md, backgroundColor: t.inset,
      }}>
        <Icon name="shield" size={17} color={t.t4} />
        <Txt size={11.5} color={t.t4} style={{ flex: 1, lineHeight: 17 }}>
          Barcha hisob-kitob shu telefonda bajarildi. Do‘kon ma’lumoti
          tahlil uchun hech qayerga yuborilmaydi.
        </Txt>
      </View>
    </Screen>
  );
}

/* ── Prognoz kartasi ──────────────────────────────────────────────────── */
function Forecast({ f }) {
  const { t } = useTheme();

  if (!f.ready) {
    return (
      <Card pad={18}>
        <Txt size={12} color={t.t3}>Keyingi 7 kun prognozi</Txt>
        <Txt size={14} color={t.t3} style={{ marginTop: 10, lineHeight: 20 }}>
          Prognoz uchun kamida bir haftalik sotuv kerak. Ilova ishlab
          turgani sari aniqroq bo‘lib boradi.
        </Txt>
      </Card>
    );
  }

  const all = [...f.history.map((h) => h.value), ...f.days.map((d) => d.value)];
  const max = Math.max(1, ...all);
  const up = f.change != null && f.change >= 0;

  return (
    <Card pad={18}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name="sparkle" size={15} color={t.acc} fill />
        <Txt size={12} color={t.t3}>Keyingi 7 kun prognozi</Txt>
      </View>

      <Txt size={34} weight="600" style={{ marginTop: 4, letterSpacing: -0.5 }}>
        {money(f.week)} <Txt size={15} color={t.t4}>so‘m</Txt>
      </Txt>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
        {f.change != null ? (
          <View style={{
            borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
            borderColor: alpha(up ? t.okRgb : t.errRgb, 0.4),
          }}>
            <Txt size={12} weight="600" color={up ? t.ok : t.err}>
              {up ? '▲' : '▼'} {up ? '+' : ''}{f.change}%
            </Txt>
          </View>
        ) : null}
        <Txt size={12} color={t.t4}>
          o‘tgan hafta {shortMoney(f.lastWeek)}
        </Txt>
      </View>

      {/* Tarix (xira) + prognoz (akcent) */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 84, marginTop: 18 }}>
        {f.history.map((h, i) => (
          <View key={'h' + i} style={{
            flex: 1,
            height: `${Math.max(2, (h.value / max) * 100)}%`,
            borderRadius: 3,
            backgroundColor: t.line2,
            opacity: 0.55,
          }} />
        ))}
        <View style={{ width: 1, height: '100%', backgroundColor: t.accdim, marginHorizontal: 3 }} />
        {f.days.map((dd, i) => (
          <View key={'f' + i} style={{
            flex: 1,
            height: `${Math.max(2, (dd.value / max) * 100)}%`,
            borderTopLeftRadius: 4, borderTopRightRadius: 4,
            borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
            backgroundColor: alpha(t.accRgb, 0.3),
            borderWidth: 1, borderColor: t.acc,
          }} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Txt size={10} color={t.t4} style={{ flex: 14 }}>o‘tgan 2 hafta</Txt>
        <Txt size={10} color={t.acctext} style={{ flex: 7, textAlign: 'right' }}>prognoz</Txt>
      </View>

      <Txt size={11.5} color={t.t4} style={{ marginTop: 10, lineHeight: 16 }}>
        Aniqlik darajasi:{' '}
        <Txt size={11.5} weight="600" color={t.t3}>{f.confidence}</Txt>
        {'. '}
        Hisobda haftaning qaysi kuni ekani ham inobatga olingan —
        shanba va dushanba bir xil emas.
      </Txt>
    </Card>
  );
}

/* ── Xulosa kartasi ───────────────────────────────────────────────────── */
function Insight({ data, navigation }) {
  const { t } = useTheme();
  const tone = {
    critical: t.err,
    warn: t.warn,
    info: t.blue,
    good: t.ok,
  }[data.severity] || t.t3;

  return (
    <Card pad={0} style={{ overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 3, backgroundColor: tone }} />
        <View style={{ flex: 1, padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <Icon name={data.icon} size={19} color={tone} />
            <Txt size={14.5} weight="500" style={{ flex: 1, lineHeight: 20 }}>
              {data.title}
            </Txt>
          </View>

          <Txt size={12.5} color={t.t3} style={{ marginTop: 7, lineHeight: 18, marginLeft: 29 }}>
            {data.body}
          </Txt>

          {data.action ? (
            <View style={{ marginLeft: 29, marginTop: 11, flexDirection: 'row' }}>
              <Btn
                title={data.action.label}
                size="sm"
                variant="soft"
                iconRight="arrow-right"
                onPress={() => navigation.navigate(data.action.screen, data.action.params)}
              />
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

/* ── Marja doirachasi ─────────────────────────────────────────────────── */
function MarginGauge({ percent }) {
  const { t } = useTheme();
  const p = Math.max(0, Math.min(100, percent));
  const color = p >= 25 ? t.ok : p >= 12 ? t.warn : t.err;

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{
        width: 64, height: 64, borderRadius: 32,
        borderWidth: 5, borderColor: alpha(t.shimRgb, 0.08),
        alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Rangli yoy o'rniga to'ldirilgan halqa — RN da yoy chizish
            qimmat, bu yerda aniq foiz raqami muhimroq */}
        <View style={{
          position: 'absolute', top: -5, left: -5, right: -5, bottom: -5,
          borderRadius: 32, borderWidth: 5, borderColor: color,
          opacity: 0.25 + (p / 100) * 0.75,
        }} />
        <Txt size={17} weight="600" color={color}>{Math.round(p)}%</Txt>
      </View>
      <Txt size={10.5} color={t.t4} style={{ marginTop: 5 }}>marja</Txt>
    </View>
  );
}

/* ── Soatlar bo'yicha ustunlar ────────────────────────────────────────── */
function HourChart({ hours }) {
  const { t } = useTheme();
  const from = 7, to = 23;                 // do'kon odatda shu oraliqda ishlaydi
  const slice = hours.slice(from, to);
  const max = Math.max(1, ...slice);

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 64 }}>
        {slice.map((v, i) => (
          <View key={i} style={{
            flex: 1,
            height: `${Math.max(2, (v / max) * 100)}%`,
            borderRadius: 2,
            backgroundColor: v === max ? t.acc : alpha(t.accRgb, 0.28),
          }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
        <Txt size={10} color={t.t4}>07:00</Txt>
        <Txt size={10} color={t.t4}>15:00</Txt>
        <Txt size={10} color={t.t4}>23:00</Txt>
      </View>
    </View>
  );
}

function DayBox({ label, value, color }) {
  const { t } = useTheme();
  return (
    <View style={{
      flex: 1, borderWidth: 1, borderColor: t.line, borderRadius: R.md, padding: 11,
    }}>
      <Txt size={11} color={t.t4}>{label}</Txt>
      <Txt size={15} weight="600" color={color} style={{ marginTop: 2 }}>{value}</Txt>
    </View>
  );
}

function Metric({ label, value, sub }) {
  const { t } = useTheme();
  return (
    <Card pad={14} style={{ flex: 1 }}>
      <Txt size={12} color={t.t3}>{label}</Txt>
      <Txt size={22} weight="600" style={{ marginTop: 2 }}>{value}</Txt>
      <Txt size={11} color={t.t4} style={{ marginTop: 1 }}>{sub}</Txt>
    </Card>
  );
}

function RiskRow({ label, value, ok, warn, first }) {
  const { t } = useTheme();
  const color = ok ? t.ok : warn ? t.warn : t.err;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingHorizontal: 14, paddingVertical: 13,
      borderTopWidth: first ? 0 : 1, borderTopColor: t.line,
    }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
      <Txt size={13.5} color={t.t2} style={{ flex: 1 }}>{label}</Txt>
      <Txt size={13.5} weight="600" color={color}>{value}</Txt>
    </View>
  );
}

/* Hafta kuni raqamidan sana yasaydi — nom tilga qarab chiqishi uchun */
function dowDate(dow) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + (dow ?? 0));
  return d;
}
