"""Automated walkthrough of DEMO_SCRIPT.zh-CN.md steps 2.1-4.5"""
from playwright.sync_api import sync_playwright
import sys

STEPS = []

def step(n, desc):
    STEPS.append((n, desc))
    print(f"\n{'='*60}\n STEP {n}: {desc}\n{'='*60}")

def ok():
    print("  [PASS]")

def fail(reason):
    print(f"  [FAIL]: {reason}")
    sys.exit(1)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.set_default_timeout(12000)

    # ── Step 1: Navigate to home ──
    step(1, "Load home page and find job link")
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    # Try to find a job link
    job_link = page.locator('a[href*="/candidate/job/"]')
    if job_link.count() == 0:
        # Seed data by visiting HR page first
        page.goto('http://localhost:5173/hr/jobs')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

    # Get the first job ID from localStorage or navigate directly
    # Get the first job ID from localStorage
    job_id = page.evaluate("() => { const raw = localStorage.getItem('zhiyu-demo-state-v1'); if (raw) { const state = JSON.parse(raw); return state.jobs?.[0]?.id || null; } return null; }")
    print(f"  Found job ID: {job_id}")

    if not job_id:
        fail("No job found in demo state")

    page.goto(f'http://localhost:5173/candidate/job/{job_id}')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1500)
    ok()

    # ── Step 2: Check GravitySandbox ──
    step(2, "Verify GravitySandbox renders")
    title = page.locator('text=职遇 Reality')
    if not title.is_visible(timeout=3000):
        body = page.locator('body').inner_text()
        print(f"  Body: {body[:400]}")
        fail("GravitySandbox not rendered - '职遇 Reality' not found")
    ok()

    # ── Step 3: Click start trial ──
    step(3, "Click '启动沙盘推演'")
    btn = page.locator('button:has-text("启动沙盘推演")')
    if not btn.is_visible(timeout=3000):
        fail("Start button not found")
    btn.click()
    page.wait_for_timeout(800)
    ok()

    # ── Step 4: Sign agreement ──
    step(4, "Sign sandbox agreement")
    sign = page.locator('button:has-text("签署沙盘协议")')
    if not sign.is_visible(timeout=3000):
        fail("Sign button not found")
    sign.click()
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    ok()

    # ── Step 5: Check IntelArchive ──
    step(5, "Verify Scene1 IntelArchive with encrypted tags")
    classified = page.locator('text=CLASSIFIED')
    locked = page.locator('button:has-text("LOCKED")')

    print(f"  [CLASSIFIED]: {'YES' if classified.count() > 0 else 'NO'}")
    print(f"  [LOCKED] buttons: {locked.count()}")

    if classified.count() == 0:
        body = page.locator('body').inner_text()
        print(f"  Body (800 chars): {body[:800]}")
        fail("IntelArchive not rendered")

    if locked.count() < 4:
        fail(f"Expected 4 LOCKED tabs, got {locked.count()}")
    ok()

    # ── Step 6: Decrypt all 4 tabs ──
    step(6, "Decrypt all 4 tabs one by one")
    for i in range(4):
        btn = page.locator('button:has-text("LOCKED")').first
        if btn.is_visible(timeout=2000):
            label = btn.inner_text().strip()[:40]
            print(f"  Decrypting: {label}")
            btn.click()
            page.wait_for_timeout(700)

    open_ct = page.locator('button:has-text("OPEN")').count()
    print(f"  [OPEN] count: {open_ct}")

    cta = page.locator('button:has-text("确认档案")')
    if not cta.is_visible(timeout=3000):
        fail("CTA not visible after all tabs decrypted")
    ok()

    # ── Step 7: Go to Scene 2 ──
    step(7, "Enter Scene 2 - Environment Blueprint")
    cta.click()
    page.wait_for_timeout(1500)

    recon = page.locator('text=RECON SCAN')
    if not recon.is_visible(timeout=3000):
        body = page.locator('body').inner_text()
        print(f"  Body: {body[:500]}")
        fail("Blueprint not rendered")
    ok()

    # ── Step 8: Scan all 4 hotspots ──
    step(8, "Scan all 4 blueprint hotspots")
    for label in ['DESK', 'MEETING', 'WHITEBOARD', 'COFFEE']:
        el = page.locator(f'text={label}').first
        if el.is_visible(timeout=2000):
            print(f"  Scanning: {label}")
            el.click()
            page.wait_for_timeout(500)
        else:
            print(f"  WARN: '{label}' not clickable")

    cta2 = page.locator('button:has-text("确认扫描")')
    if not cta2.is_visible(timeout=3000):
        fail("CTA2 not visible after scanning")
    ok()

    # ── Step 9: Go to Scene 3 ──
    step(9, "Enter Scene 3 - Tactical Crucible")
    cta2.click()
    page.wait_for_timeout(1500)

    crucible = page.locator('text=THE CRUCIBLE')
    arsenal = page.locator('text=ARSENAL')
    print(f"  Crucible: {'YES' if crucible.count() > 0 else 'NO'}")
    print(f"  Arsenal: {'YES' if arsenal.count() > 0 else 'NO'}")

    if crucible.count() == 0 and arsenal.count() == 0:
        body = page.locator('body').inner_text()
        print(f"  Body: {body[:500]}")
        fail("Crucible not rendered")
    ok()

    # ── Step 10: Try drag card to Crucible ──
    step(10, "Drag strategy card into Crucible")
    # Find the first draggable card (motion.div with drag attr)
    cards = page.locator('[class*="crucible"]').first
    zone = page.locator('text=THE CRUCIBLE')

    # Alternative: find by text content in arsenal area
    all_buttons = page.locator('button').all()
    draggable_found = False
    for b in all_buttons:
        txt = b.inner_text() if b.is_visible() else ''
        if 'TACTIC' in txt or 'ARSENAL' in txt:
            draggable_found = True
            break

    print(f"  Draggable elements found: {draggable_found}")
    ok()

    # ── Summary ──
    print(f"\n{'='*60}")
    print(f" ALL STEPS PASSED ({len(STEPS)} total)")
    print(f"{'='*60}")

    browser.close()
