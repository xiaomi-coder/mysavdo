/* ══════════════════════════════════════════════════════════════════════════
   Subdomain orqali do'konni aniqlash

   texno-bozor.mybazzar.uz  →  "texno-bozor"
   mybazzar.uz              →  null  (asosiy ilova)
   www.mybazzar.uz          →  null
   localhost                →  null

   Wildcard DNS (*.mybazzar.uz) serverga qaratilgan, nginx esa hamma
   subdomainni bir xil fayllarga beradi — do'konni frontend aniqlaydi.
   ══════════════════════════════════════════════════════════════════════ */

/** Do'kon subdomaini yoki null */
export function storeSlugFromHost(hostname = window.location.hostname) {
  const host = hostname.toLowerCase();

  // Ishlab chiqish muhitida subdomain yo'q
  if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return null;

  const parts = host.split('.');
  // mybazzar.uz → 2 bo'lak, subdomain yo'q
  if (parts.length < 3) return null;

  const sub = parts[0];
  if (sub === 'www' || sub === 'api' || sub === 'mail' || sub === 'webmail' || sub === 'ftp') {
    return null;
  }
  return sub;
}

/** Do'konning ulashish uchun to'liq havolasi */
export function storeUrl(slugOrId) {
  const host = window.location.hostname.toLowerCase();
  const parts = host.split('.');

  // Haqiqiy domenda subdomain beramiz, aks holda /shop/ yo'li bilan
  if (parts.length >= 2 && !/^\d/.test(host) && host !== 'localhost') {
    const root = parts.slice(-2).join('.');
    return `https://${slugOrId}.${root}`;
  }
  return `${window.location.origin}/shop/${slugOrId}`;
}
