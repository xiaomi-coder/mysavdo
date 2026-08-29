-- Qulf ijrochisi (lock-worker) bot bilan bir xil rolda ishlaydi (mb_bot).
-- Unga kredit jadvallariga huquq beramiz: navbatni o'qiydi, holatni
-- yangilaydi, kechikkanlarni tekshiradi.
BEGIN;
GRANT SELECT, UPDATE ON lock_commands   TO mb_bot;
GRANT SELECT, UPDATE ON credit_devices  TO mb_bot;
GRANT SELECT         ON credit_schedule TO mb_bot;
GRANT EXECUTE ON FUNCTION credit_run_overdue(INTEGER) TO mb_bot;
GRANT USAGE, SELECT ON SEQUENCE lock_commands_id_seq TO mb_bot;
COMMIT;
