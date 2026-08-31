-- ══════════════════════════════════════════════════════════════════════════
-- credit_device_view — kredit telefon + to'lov jadvali agregatlari
--
-- Sahifa har telefon uchun aniq moliyaviy holatni ko'rsatishi uchun:
-- qolgan qarz, keyingi to'lov, necha oy to'langan, muddati o'tgan summa.
-- ══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW credit_device_view AS
SELECT
  d.*,
  COALESCE(s.total, d.price - d.down_payment)      AS sched_total,
  COALESCE(s.paid, 0)                              AS sched_paid,
  COALESCE(s.total, d.price - d.down_payment)
    - COALESCE(s.paid, 0)                          AS sched_left,
  COALESCE(s.months_total, d.months)               AS months_total,
  COALESCE(s.months_paid, 0)                       AS months_paid,
  s.next_due_date,
  s.next_due_amount,
  COALESCE(s.overdue_amount, 0)                    AS overdue_amount,
  COALESCE(s.overdue_count, 0)                     AS overdue_count,
  s.overdue_days,
  s.last_paid_at,
  -- Oylik to'lov (jadvaldan aniq, birinchi oy summasi)
  COALESCE(s.monthly, CASE WHEN d.months > 0
    THEN CEIL((d.price - d.down_payment) / d.months / 1000) * 1000 ELSE 0 END) AS monthly
FROM credit_devices d
LEFT JOIN LATERAL (
  SELECT
    SUM(cs.amount)                                             AS total,
    SUM(cs.paid_amount)                                        AS paid,
    COUNT(*)                                                   AS months_total,
    COUNT(*) FILTER (WHERE cs.paid_amount >= cs.amount)        AS months_paid,
    MIN(cs.due_date) FILTER (WHERE cs.paid_amount < cs.amount) AS next_due_date,
    -- keyingi to'lanmagan oyning qolgan summasi
    (SELECT c2.amount - c2.paid_amount FROM credit_schedule c2
      WHERE c2.device_id = d.id AND c2.paid_amount < c2.amount
      ORDER BY c2.due_date LIMIT 1)                            AS next_due_amount,
    SUM(cs.amount - cs.paid_amount)
      FILTER (WHERE cs.paid_amount < cs.amount
              AND cs.due_date < CURRENT_DATE)                  AS overdue_amount,
    COUNT(*) FILTER (WHERE cs.paid_amount < cs.amount
              AND cs.due_date < CURRENT_DATE)                  AS overdue_count,
    (CURRENT_DATE - MIN(cs.due_date) FILTER (WHERE cs.paid_amount < cs.amount
              AND cs.due_date < CURRENT_DATE))                 AS overdue_days,
    MAX(cs.paid_at)                                            AS last_paid_at,
    MIN(cs.amount)                                             AS monthly
  FROM credit_schedule cs
  WHERE cs.device_id = d.id
) s ON true;

-- PostgREST orqali ilova o'qishi uchun
GRANT SELECT ON credit_device_view TO mb_anon;
GRANT SELECT ON credit_device_view TO mb_bot;
