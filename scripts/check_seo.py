#!/usr/bin/env python3
"""
SEO & Cloudflare Diagnostics Utility
Simulates search engine crawlers (Googlebot, Bingbot), inspects HTTP headers,
validates Schema.org JSON-LD, sitemap.xml, robots.txt, and Cloudflare WAF compatibility.

Usage:
    python3 scripts/check_seo.py [URL]
    python3 scripts/check_seo.py http://127.0.0.1:9000
    python3 scripts/check_seo.py https://baydev.my.id
"""

import sys
import json
import re
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET

GOOGLEBOT_UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
BINGBOT_UA = "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"

TARGET_KEYWORDS = [
    "bayu prastyo",
    "baydev",
    "bayukun",
    "masbay",
]

def make_request(url, user_agent=GOOGLEBOT_UA):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "id,en-US;q=0.9,en;q=0.8",
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            headers = dict(resp.getheaders())
            content = resp.read().decode("utf-8", errors="replace")
            return resp.status, headers, content, None
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read().decode("utf-8", errors="replace"), e
    except Exception as e:
        return 0, {}, "", e

def run_diagnostics(target_base):
    print("=" * 70)
    print(f"🚀 DIAGNOSTIK SEO & CLOUDFLARE AUDITOR")
    print(f"Target URL: {target_base}")
    print("=" * 70)

    # --------------------------------------------------------------------------
    # 1. Googlebot HTTP Access & Cloudflare WAF Check
    # --------------------------------------------------------------------------
    print("\n[1/6] Menguji Akses Googlebot & Deteksi WAF Cloudflare...")
    status, headers, body, err = make_request(target_base, GOOGLEBOT_UA)

    cf_ray = headers.get("cf-ray") or headers.get("CF-RAY")
    cf_cache = headers.get("cf-cache-status") or headers.get("CF-Cache-Status")
    server = headers.get("server") or headers.get("Server", "Unknown")

    if status == 200:
        print(f"  ✅ Googlebot HTTP Status: 200 OK")
    elif status in (301, 302):
        print(f"  ℹ️ HTTP Redirect ({status}) -> Menuju HTTPS / Canonical")
    else:
        print(f"  ❌ HTTP Status bermasalah: {status}")

    if cf_ray:
        print(f"  ☁️ Cloudflare Active: Terdeteksi CF-Ray ({cf_ray})")
        print(f"  ☁️ Edge Cache Status: {cf_cache or 'DYNAMIC / BYPASS'}")
    else:
        print(f"  ℹ️ Direct / Origin Server (Server: {server})")

    # Check for Cloudflare challenge indicators
    if "Attention Required! | Cloudflare" in body or "cf-challenge" in body:
        print("  ⚠️ PERINGATAN: Googlebot terkena Cloudflare Challenge / Captcha!")
    else:
        print("  ✅ Crawler bebas hambatan (Tidak ada challenge/captcha)")

    # --------------------------------------------------------------------------
    # 2. Meta Tags & Keywords Coverage
    # --------------------------------------------------------------------------
    print("\n[2/6] Memeriksa Ketercakupan Kata Kunci Target pada HTML...")
    for kw in TARGET_KEYWORDS:
        count = len(re.findall(re.escape(kw), body, re.IGNORECASE))
        if count > 0:
            print(f"  ✅ Kata kunci '{kw}': Ditemukan {count}x dalam HTML")
        else:
            print(f"  ❌ Kata kunci '{kw}': TIDAK ditemukan dalam HTML")

    # --------------------------------------------------------------------------
    # 3. Schema.org JSON-LD Structured Data
    # --------------------------------------------------------------------------
    print("\n[3/6] Memvalidasi Schema.org JSON-LD (Google Rich Snippets)...")
    json_ld_matches = re.findall(
        r'<script\s+type=[\'"]application/ld\+json[\'"]>(.*?)</script>',
        body,
        re.DOTALL | re.IGNORECASE
    )

    if json_ld_matches:
        for idx, raw_json in enumerate(json_ld_matches, 1):
            try:
                data = json.loads(raw_json.strip())
                print(f"  ✅ Script JSON-LD #{idx}: Sintaks JSON Valid 100%")
                # Check for Person & alternateName
                graph = data.get("@graph", [data])
                for entity in graph:
                    etype = entity.get("@type")
                    ename = entity.get("name")
                    alts = entity.get("alternateName", [])
                    print(f"     - Entity: {etype} (Name: \"{ename}\")")
                    if alts:
                        print(f"       Alternate Names: {alts}")
            except Exception as e:
                print(f"  ❌ Script JSON-LD #{idx}: Gagal parsing JSON ({e})")
    else:
        print("  ❌ Tidak ditemukan script application/ld+json dalam HTML!")

    # --------------------------------------------------------------------------
    # 4. Robots.txt Crawler Directives
    # --------------------------------------------------------------------------
    robots_url = target_base.rstrip("/") + "/robots.txt"
    print(f"\n[4/6] Memeriksa Direktif {robots_url}...")
    r_status, _, r_body, _ = make_request(robots_url, GOOGLEBOT_UA)
    if r_status == 200:
        print(f"  ✅ robots.txt dapat diakses (HTTP 200 OK)")
        if "User-agent: *" in r_body and "Allow: /" in r_body:
            print("  ✅ Crawler diizinkan merayapi seluruh halaman publik (Allow: /)")
        if "sitemap.xml" in r_body:
            print("  ✅ Tautan Sitemap tertera dalam robots.txt")
        if "Disallow: /admin" in r_body:
            print("  ✅ Halaman admin terlindungi dari indeksasi (Disallow: /admin)")
    else:
        print(f"  ❌ robots.txt mengembalikan status {r_status}")

    # --------------------------------------------------------------------------
    # 5. Sitemap.xml XML Validation
    # --------------------------------------------------------------------------
    sitemap_url = target_base.rstrip("/") + "/sitemap.xml"
    print(f"\n[5/6] Memvalidasi Format XML {sitemap_url}...")
    s_status, _, s_body, _ = make_request(sitemap_url, GOOGLEBOT_UA)
    if s_status == 200:
        try:
            root = ET.fromstring(s_body)
            # Count url entries
            ns = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            urls = root.findall("ns:url", ns) or root.findall("url")
            print(f"  ✅ sitemap.xml valid (XML Well-Formed, Ditemukan {len(urls)} URLs)")
            for u in urls[:3]:
                loc = u.find("ns:loc", ns)
                if loc is None:
                    loc = u.find("loc")
                if loc is not None and loc.text:
                    print(f"     - Sample URL: {loc.text}")
        except Exception as e:
            print(f"  ❌ sitemap.xml gagal diparsing XML ({e})")
    else:
        print(f"  ❌ sitemap.xml mengembalikan status {s_status}")

    # --------------------------------------------------------------------------
    # 6. Ringkasan Diagnostik
    # --------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("🎯 RINGKASAN REKOMENDASI AUDIT:")
    print("1. Buka Google Rich Results Test: https://search.google.com/test/rich-results")
    print("   Uji URL atau salin HTML untuk sertifikasi resmi Googlebot.")
    print("2. Daftarkan dan verifikasi properti di Google Search Console (GSC).")
    print("3. Submit URL sitemap https://baydev.my.id/sitemap.xml di GSC.")
    print("4. Pastikan opsi 'Verified Bots' di Cloudflare WAF diset ke 'Allow'.")
    print("=" * 70)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:9000"
    run_diagnostics(target)
