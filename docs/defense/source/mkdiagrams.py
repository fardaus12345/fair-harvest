# -*- coding: utf-8 -*-
import os, html
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "diagrams")
os.makedirs(OUT, exist_ok=True)

GREEN="#14532d"; SOFT="#eef5f0"; AMBER="#b45309"; ASOFT="#fdf3e3"
BLUE="#1e3a8a"; BSOFT="#eef1fb"; RED="#9b1c1c"; RSOFT="#fdecec"
LINE="#8fa89b"; INK="#14211a"; MUT="#5a6b62"; GREY="#f4f6f5"

FONT = "Noto Sans, Noto Sans Bengali, DejaVu Sans, sans-serif"

def esc(t): return html.escape(str(t))

def svg(w, h, body, title=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'font-family="{FONT}">'
            f'<defs>'
            f'<marker id="ar" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">'
            f'<path d="M0,0 L8,3 L0,6 z" fill="{LINE}"/></marker>'
            f'<marker id="arg" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">'
            f'<path d="M0,0 L8,3 L0,6 z" fill="{GREEN}"/></marker>'
            f'<marker id="ara" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">'
            f'<path d="M0,0 L8,3 L0,6 z" fill="{AMBER}"/></marker>'
            f'<marker id="arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">'
            f'<path d="M0,0 L8,3 L0,6 z" fill="{RED}"/></marker>'
            f'</defs>'
            f'<rect width="{w}" height="{h}" fill="#ffffff"/>' + body + '</svg>')

def box(x, y, w, h, lines, fill=SOFT, stroke=GREEN, tc=None, fs=11, r=7, bold_first=True, sw=1.4):
    tc = tc or (GREEN if fill in (SOFT,) else INK)
    if isinstance(lines, str): lines = [lines]
    out = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
    n = len(lines); lh = fs + 4.5
    top = y + h/2 - (n-1)*lh/2 + fs*0.36
    for i, ln in enumerate(lines):
        fw = "700" if (i == 0 and bold_first) else "400"
        sz = fs if i == 0 else fs - 1.2
        col = tc if i == 0 else MUT
        out += (f'<text x="{x+w/2}" y="{top+i*lh}" text-anchor="middle" font-size="{sz}" '
                f'font-weight="{fw}" fill="{col}">{esc(ln)}</text>')
    return out

def label(x, y, t, fs=10, fill=MUT, anchor="middle", weight="400"):
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{fs}" '
            f'font-weight="{weight}" fill="{fill}">{esc(t)}</text>')

def arrow(x1, y1, x2, y2, color=LINE, m="ar", dash=None, w=1.6):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" '
            f'stroke-width="{w}" marker-end="url(#{m})"{d}/>')

def poly(pts, color=LINE, m="ar", dash=None, w=1.6):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    p = " ".join(f"{a},{b}" for a, b in pts)
    return (f'<polyline points="{p}" fill="none" stroke="{color}" stroke-width="{w}" '
            f'marker-end="url(#{m})"{d}/>')

def band(x, y, w, h, text, fill="#ffffff", stroke=LINE, dash="5,4"):
    out = (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="9" fill="{fill}" '
           f'stroke="{stroke}" stroke-width="1.2" stroke-dasharray="{dash}"/>')
    out += label(x+10, y+16, text, fs=9.5, fill=MUT, anchor="start", weight="700")
    return out

def write(name, content):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(content)
    print("wrote", name)

# ---------------------------------------------------------------- 1. System architecture
b = ""
b += band(14, 12, 872, 92, "CLIENT (browser)")
b += box(40, 36, 190, 54, ["Customer UI", "/marketplace /cart /orders"], fill=SOFT)
b += box(250, 36, 190, 54, ["Farmer UI", "/farmer/dashboard /verify"], fill=SOFT)
b += box(460, 36, 190, 54, ["Admin UI", "/admin/*"], fill=SOFT)
b += box(670, 36, 196, 54, ["localStorage", "JWT token + user"], fill=ASOFT, stroke=AMBER)

b += band(14, 124, 872, 210, "NEXT.JS 15 APPLICATION  (one deployment — UI + API together)")
b += box(40, 150, 300, 44, ["App Router — React Server + Client Components"], fill="#ffffff", stroke=LINE, tc=INK, fs=10.5)
b += box(360, 150, 240, 44, ["middleware.js — CORS allow-list"], fill="#ffffff", stroke=LINE, tc=INK, fs=10.5)
b += box(620, 150, 246, 44, ["lib/api.js  ·  @fair-harvest/sdk"], fill="#ffffff", stroke=LINE, tc=INK, fs=10.5)

b += box(40, 212, 200, 104, ["Route Handlers", "app/api/v1/**", "REST, /api/v1"], fill=SOFT)
b += box(258, 212, 190, 104, ["Auth layer", "requireUser", "requireRole", "requireOwnerOrRole"], fill=ASOFT, stroke=AMBER, tc=AMBER)
b += box(466, 212, 190, 104, ["Business logic", "reputation · reviews", "earnings · serializers"], fill=SOFT)
b += box(674, 212, 192, 104, ["Cross-cutting", "rateLimit · audit", "Zod validation · mask"], fill=SOFT)

b += band(14, 354, 872, 106, "DATA & STORAGE")
b += box(40, 380, 220, 62, ["Prisma Client 6.19.3", "type-safe query layer"], fill=BSOFT, stroke=BLUE, tc=BLUE)
b += box(286, 380, 250, 62, ["PostgreSQL (Neon)", "DATABASE_URL pooled / DIRECT_URL"], fill=BSOFT, stroke=BLUE, tc=BLUE)
b += box(562, 380, 150, 62, ["Vercel Blob", "product images"], fill=BSOFT, stroke=BLUE, tc=BLUE)
b += box(738, 380, 128, 62, ["Local disk", "(dev only)"], fill=GREY, stroke=LINE, tc=MUT)

b += arrow(440, 104, 440, 148, GREEN, "arg")
b += arrow(140, 196, 140, 210, LINE)
b += arrow(140, 316, 140, 378, GREEN, "arg")
b += arrow(150, 442, 286, 411, GREEN, "arg")
b += arrow(560, 316, 600, 378, GREEN, "arg")
b += label(455, 122, "HTTPS", fs=9, fill=MUT)
write("d1-architecture.svg", svg(900, 474, b))

# ---------------------------------------------------------------- 2. Roles
b = ""
b += box(360, 16, 180, 46, ["User (Role enum)"], fill=GREEN, stroke=GREEN, tc="#fff", fs=12)
b += arrow(450, 62, 190, 96, LINE); b += arrow(450, 62, 450, 96, LINE); b += arrow(450, 62, 712, 96, LINE)
b += box(60, 98, 260, 44, ["CONSUMER"], fill=SOFT, fs=12)
b += box(320, 98, 260, 44, ["FARMER"], fill=SOFT, fs=12)
b += box(580, 98, 260, 44, ["ADMIN"], fill=SOFT, fs=12)
c = ["Marketplace browse / search","Cart + checkout (demo pay)","Order history + tracking","Review (delivered only)","Wishlist · Rewards","/account dashboard"]
f = ["Farmer Card verification","Add / edit product","Archive + image upload","Trace events (own product)","Orders received + earnings","/farmer/dashboard"]
a = ["Verification queue approve/reject","Suspend / reinstate accounts","All products: edit / archive / restore","All orders + status change","Review moderation (hide)","Audit log · platform metrics"]
for i, (col, items) in enumerate([(60, c), (320, f), (580, a)]):
    b += f'<rect x="{col}" y="150" width="260" height="176" rx="7" fill="#ffffff" stroke="{LINE}" stroke-width="1.2"/>'
    for j, it in enumerate(items):
        b += f'<circle cx="{col+16}" cy="{173+j*27-4}" r="3" fill="{AMBER}"/>'
        b += label(col+28, 177+j*27-4, it, fs=9.6, fill=INK, anchor="start")
b += box(60, 338, 780, 40, ["Sign-in door per role — /auth/customer · /auth/farmer · /admin/login (admins cannot self-register)"],
         fill=ASOFT, stroke=AMBER, tc=AMBER, fs=10)
write("d2-roles.svg", svg(900, 392, b))

# ---------------------------------------------------------------- 3. Auth sequence
actors = [("Browser", 95), ("POST /auth/login", 300), ("Prisma / DB", 520), ("auth.js (JWT)", 730)]
b = ""
for name, x in actors:
    b += box(x-88, 12, 176, 34, [name], fill=GREEN, stroke=GREEN, tc="#fff", fs=10.5)
    b += f'<line x1="{x}" y1="46" x2="{x}" y2="454" stroke="{LINE}" stroke-width="1" stroke-dasharray="4,4"/>'
steps = [
 (95,300,"1. email + password (JSON)", GREEN,"arg"),
 (300,300,"2. enforceRateLimit('auth-login', max 10 / 60s)", AMBER,"ara"),
 (300,300,"3. Zod loginSchema.safeParse → 422 if invalid", AMBER,"ara"),
 (300,520,"4. user.findUnique({ email })", GREEN,"arg"),
 (520,300,"5. User row (or null) + farmerProfile", LINE,"ar"),
 (300,300,"6. status === SUSPENDED → 401", RED,"arr"),
 (300,730,"7. bcrypt.compare(password, passwordHash)", GREEN,"arg"),
 (730,300,"8. true / false", LINE,"ar"),
 (300,730,"9. signToken({ sub, role, email }) HS256", GREEN,"arg"),
 (730,300,"10. JWT (exp = JWT_EXPIRES_IN, default 2h)", LINE,"ar"),
 (300,95,"11. { access_token, user }", GREEN,"arg"),
 (95,95,"12. localStorage: fairHarvestToken + fairHarvestUser", AMBER,"ara"),
]
y = 74
for x1, x2, txt, col, m in steps:
    if x1 == x2:
        b += poly([(x1, y-8), (x1+58, y-8), (x1+58, y+12), (x1+4, y+12)], col, m, w=1.4)
        b += label(x1+68, y+2, txt, fs=9.2, fill=INK, anchor="start")
        y += 34
    else:
        b += arrow(x1+(6 if x2 > x1 else -6), y, x2+(-6 if x2 > x1 else 6), y, col, m)
        b += label((x1+x2)/2, y-6, txt, fs=9.2, fill=INK)
        y += 30
b += box(60, y+2, 780, 34, ["পরবর্তী প্রতিটি protected request-এ:  Authorization: Bearer <JWT>  →  decodeToken() → requireUser / requireRole"],
         fill=ASOFT, stroke=AMBER, tc=AMBER, fs=9.6)
write("d3-auth.svg", svg(900, y+52, b))

# ---------------------------------------------------------------- 4. Farmer verification flow
b = ""
b += box(30, 20, 170, 50, ["Farmer registers", "role=farmer"], fill=SOFT)
b += arrow(200, 45, 236, 45, GREEN, "arg")
b += box(238, 20, 180, 50, ["FarmerProfile created", "status = PENDING"], fill=ASOFT, stroke=AMBER, tc=AMBER)
b += arrow(418, 45, 454, 45, GREEN, "arg")
b += box(456, 20, 190, 50, ["/farmer/verify form", "card + NID + name"], fill=SOFT)
b += arrow(646, 45, 682, 45, GREEN, "arg")
b += box(684, 12, 190, 66, ["POST /farmers/{id}/verify", "rate limit 8/min", "requireOwnerOrRole"], fill=SOFT, fs=10)
b += poly([(779, 78), (779, 104)], GREEN, "arg")
b += box(640, 106, 278, 52, ["verifyFarmerCard() → provider", "VERIFICATION_PROVIDER = demo | official"], fill=BSOFT, stroke=BLUE, tc=BLUE, fs=10.5)
b += poly([(779, 158), (779, 186)], GREEN, "arg")
b += f'<path d="M779,186 L899,232 L779,278 L659,232 Z" fill="{ASOFT}" stroke="{AMBER}" stroke-width="1.4"/>'
b += label(779, 228, "matched?", fs=11, fill=AMBER, weight="700")
b += label(779, 244, "card + NID + name", fs=8.6, fill=MUT)
b += poly([(659, 232), (540, 232)], GREEN, "arg"); b += label(600, 224, "না", fs=10, fill=RED, weight="700")
b += poly([(779, 278), (779, 306)], GREEN, "arg"); b += label(800, 296, "হ্যাঁ", fs=10, fill=GREEN, weight="700")
b += box(660, 308, 238, 58, ["VERIFIED (instant)", "method = DEMO_REGISTRY", "verifiedAt = now()"], fill=SOFT, fs=10.5)
b += box(300, 206, 238, 58, ["stays PENDING", "method = MANUAL", "→ admin queue"], fill=ASOFT, stroke=AMBER, tc=AMBER, fs=10.5)
b += poly([(419, 264), (419, 300)], GREEN, "arg")
b += box(300, 302, 238, 66, ["Admin /admin/verification", "Approve → VERIFIED", "Reject → REJECTED"], fill=BSOFT, stroke=BLUE, tc=BLUE, fs=10.5)
b += poly([(300, 335), (140, 335), (140, 300)], GREEN, "arg")
b += box(30, 240, 220, 58, ["recomputeFarmerReputation()", "+ recordAudit() on admin path"], fill=SOFT, fs=10)
b += poly([(140, 240), (140, 200)], GREEN, "arg")
b += box(30, 140, 220, 58, ["VERIFIED হলে তবেই", "POST /products অনুমোদিত"], fill=GREEN, stroke=GREEN, tc="#fff", fs=10.5)
write("d4-verification.svg", svg(940, 392, b))

# ---------------------------------------------------------------- 5. Farmer card decision
b = ""
b += box(300, 14, 300, 46, ["verifyWithDemoRegistry({card, nid, name})"], fill=SOFT, fs=10.5)
b += poly([(450, 60), (450, 86)], GREEN, "arg")
b += box(280, 88, 340, 42, ["GovFarmerCardRecord.findUnique({ cardNumber })"], fill=BSOFT, stroke=BLUE, tc=BLUE, fs=10)
ys = 150
rows = [
 ("record পাওয়া যায়নি", "matched=false · confidence 0 · card_not_found", RSOFT, RED),
 ("record.status ≠ ACTIVE", "matched=false · confidence 0 · card_revoked", RSOFT, RED),
 ("NID ✓ এবং নাম ✓", "matched=TRUE · confidence 0.98 · matched", SOFT, GREEN),
 ("শুধু একটি মিলেছে", "matched=false · confidence 0.5 · details_mismatch", ASOFT, AMBER),
 ("কোনোটিই মেলেনি", "matched=false · confidence 0.1 · details_mismatch", ASOFT, AMBER),
]
for i, (cond, res, fill, col) in enumerate(rows):
    y = ys + i*58
    b += poly([(450, y-14), (450, y)], LINE, "ar", w=1.2) if i == 0 else ""
    b += box(120, y, 250, 44, [cond], fill="#ffffff", stroke=col, tc=col, fs=10.5)
    b += arrow(370, y+22, 424, y+22, col, {"#9b1c1c":"arr","#14532d":"arg","#b45309":"ara"}[col])
    b += box(426, y, 356, 44, [res], fill=fill, stroke=col, tc=col, fs=10)
b += box(120, ys+5*58+6, 662, 44, ["matched === true হলেই verificationStatus = VERIFIED, নাহলে PENDING থাকে (manual review)"],
         fill=GREEN, stroke=GREEN, tc="#fff", fs=10.5)
write("d5-card.svg", svg(900, ys+5*58+66, b))

# ---------------------------------------------------------------- 6. Product lifecycle
b = ""
b += box(40, 30, 180, 48, ["farmer submits form"], fill="#ffffff", stroke=LINE, tc=INK)
b += arrow(220, 54, 258, 54, GREEN, "arg")
b += box(260, 20, 200, 68, ["POST /api/v1/products", "verified farmer only", "403 otherwise"], fill=ASOFT, stroke=AMBER, tc=AMBER, fs=10)
b += arrow(460, 54, 500, 54, GREEN, "arg")
b += box(502, 30, 150, 48, ["ACTIVE"], fill=SOFT, fs=13)
b += label(577, 96, "marketplace-এ দৃশ্যমান · cart-এ যোগ করা যায়", fs=9.4, fill=MUT)
b += poly([(652, 54), (700, 54), (700, 150)], GREEN, "arg")
b += box(620, 152, 160, 48, ["OUT_OF_STOCK"], fill=ASOFT, stroke=AMBER, tc=AMBER, fs=12)
b += label(700, 216, "তালিকায় নেই · order করা যায় না", fs=9.4, fill=MUT)
b += poly([(620, 176), (560, 176), (560, 78)], GREEN, "arg")
b += label(548, 130, "আবার active", fs=9, fill=MUT, anchor="end")
b += poly([(502, 66), (420, 66), (420, 150)], RED, "arr")
b += box(330, 152, 180, 48, ["ARCHIVED"], fill=RSOFT, stroke=RED, tc=RED, fs=12)
b += label(420, 130, "DELETE /products/{id}", fs=9, fill=RED, anchor="middle")
b += label(420, 216, "marketplace থেকে লুকানো · row মুছে যায় না", fs=9.4, fill=MUT)
b += poly([(330, 176), (250, 176), (250, 250)], GREEN, "arg")
b += box(120, 252, 262, 52, ["Restore = PATCH { status: 'active' }", "farmer বা admin করতে পারে"], fill=SOFT, fs=10.5)
b += poly([(382, 278), (560, 278), (560, 200)], GREEN, "arg")
b += box(500, 252, 380, 66, ["কেন hard delete নয়?", "OrderItem.productId → Product (onDelete: RESTRICT)",
                             "row মুছলে পুরোনো order, review ও trace ইতিহাস নষ্ট হতো"],
         fill=BSOFT, stroke=BLUE, tc=BLUE, fs=10)
write("d6-product.svg", svg(900, 332, b))

# ---------------------------------------------------------------- 7. Order lifecycle
b = ""
b += box(30, 100, 150, 50, ["Cart", "CartItem rows"], fill="#ffffff", stroke=LINE, tc=INK)
b += arrow(180, 125, 216, 125, GREEN, "arg")
b += box(218, 86, 200, 78, ["POST /orders/{userId}", "/checkout", "$transaction"], fill=ASOFT, stroke=AMBER, tc=AMBER, fs=10)
b += arrow(418, 125, 452, 125, GREEN, "arg")
states = [("PENDING", 454), ("CONFIRMED", 596), ("SHIPPED", 738)]
for name, x in states:
    b += box(x, 100, 128, 50, [name], fill=SOFT, fs=11)
b += arrow(582, 125, 594, 125, GREEN, "arg")
b += arrow(724, 125, 736, 125, GREEN, "arg")
b += poly([(802, 150), (802, 196)], GREEN, "arg")
b += box(738, 198, 128, 50, ["DELIVERED"], fill=GREEN, stroke=GREEN, tc="#fff", fs=11)
b += poly([(518, 150), (518, 196)], RED, "arr")
b += box(454, 198, 128, 50, ["CANCELLED"], fill=RSOFT, stroke=RED, tc=RED, fs=11)
b += label(600, 172, "যেকোনো পর্যায় থেকে", fs=9, fill=MUT)
b += box(30, 198, 400, 76, ["checkout transaction যা করে:",
                            "Order + OrderItem (nameSnapshot, unitPriceBdt) তৈরি",
                            "Product.quantityKg decrement · Payment row · +20 reward point",
                            "OrderStatusEvent(PENDING) · CartItem মুছে ফেলা"],
         fill=BSOFT, stroke=BLUE, tc=BLUE, fs=9.6, r=7)
b += box(30, 288, 836, 52, ["প্রতিটি status পরিবর্তনে OrderStatusEvent যোগ হয়  ·  DELIVERED বা CANCELLED হলে সেই order-এর প্রতিটি farmer-এর reputation পুনরায় গণনা হয়  ·  DELIVERED হলেই customer review দিতে পারে"],
         fill=ASOFT, stroke=AMBER, tc=AMBER, fs=9.6)
b += box(30, 20, 836, 54, ["PATCH /api/v1/orders/{orderId}/status  —  শুধু ADMIN, অথবা সেই order-এ নিজের item আছে এমন FARMER (403 otherwise)"],
         fill=GREEN, stroke=GREEN, tc="#fff", fs=10)
write("d7-order.svg", svg(900, 356, b))

# ---------------------------------------------------------------- 8. ERD
ents = {
 "User":        (20, 20, 176, ["id PK","email UQ","passwordHash","name, phone","role, status"]),
 "FarmerProfile":(240, 20, 200, ["id PK","userId FK UQ","farmerCardNumber","nidNumber, district","verificationStatus","reputationScore, badge"]),
 "GovFarmerCardRecord": (480, 20, 210, ["id PK","cardNumber UQ","nidNumber, fullName","district, issueDate","status, cropTypes"]),
 "AuditLog":    (726, 20, 170, ["id PK","actorId, actorRole","action","targetType/targetId","metadata (JSON str)"]),
 "Cart":        (20, 186, 176, ["id PK","userId FK UQ"]),
 "CartItem":    (20, 268, 176, ["id PK","cartId FK","productId FK","quantityKg","unitPriceBdt, source"]),
 "Product":     (240, 170, 200, ["id PK","farmerId FK","name, category","priceBdt, quantityKg","freshnessWindowDays","trustScore, imageUrl","status"]),
 "TraceEvent":  (480, 170, 200, ["id PK","productId FK","stage","timestamp, note","gpsLat, gpsLng"]),
 "WishlistItem":(726, 170, 170, ["id PK","userId FK","productId FK","UQ(user, product)"]),
 "Order":       (20, 416, 176, ["id PK","userId FK","status","totalBdt, deliveryFee","paymentMethod/Status"]),
 "OrderItem":   (240, 380, 200, ["id PK","orderId FK","productId FK RESTRICT","farmerId","nameSnapshot","quantityKg, prices"]),
 "OrderStatusEvent": (20, 552, 176, ["id PK","orderId FK","status, note","createdAt"]),
 "Payment":     (240, 552, 200, ["id PK","orderId FK UQ","method, amountBdt","status","demoTransactionRef"]),
 "Review":      (480, 380, 200, ["id PK","customerId FK","productId FK","farmerId","orderItemId FK UQ","rating, comment, status","UQ(customer, product)"]),
 "RewardsLedger":(726, 380, 170, ["id PK","userId FK","points","reason","createdAt"]),
}
b = ""
for name, (x, y, w, fields) in ents.items():
    h = 26 + len(fields)*15 + 8
    b += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#ffffff" stroke="{GREEN}" stroke-width="1.4"/>'
    b += f'<rect x="{x}" y="{y}" width="{w}" height="24" rx="6" fill="{GREEN}"/>'
    b += f'<rect x="{x}" y="{y+16}" width="{w}" height="8" fill="{GREEN}"/>'
    b += label(x+w/2, y+16.5, name, fs=10.5, fill="#ffffff", weight="700")
    for i, f_ in enumerate(fields):
        b += label(x+8, y+40+i*15, f_, fs=8.4, fill=INK if ("PK" in f_ or "UQ" in f_) else MUT, anchor="start")
    ents[name] = (x, y, w, h)
def rel(a, b_, pa, pb, txt="", col=LINE, dash=None):
    ax, ay, aw, ah = ents[a]; bx, by, bw, bh = ents[b_]
    P = {"t": lambda x,y,w,h: (x+w/2, y), "b": lambda x,y,w,h: (x+w/2, y+h),
         "l": lambda x,y,w,h: (x, y+h/2), "r": lambda x,y,w,h: (x+w, y+h/2)}
    x1, y1 = P[pa](ax, ay, aw, ah); x2, y2 = P[pb](bx, by, bw, bh)
    s = f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{col}" stroke-width="1.3"'
    s += f' stroke-dasharray="{dash}"' if dash else ''
    s += '/>'
    if txt: s += label((x1+x2)/2, (y1+y2)/2 - 3, txt, fs=8, fill=col)
    return s
b += rel("User","FarmerProfile","r","l","1:1")
b += rel("User","Cart","b","t","1:1")
b += rel("User","Order","b","t","1:N")
b += rel("Cart","CartItem","b","t","1:N")
b += rel("FarmerProfile","Product","b","t","1:N")
b += rel("Product","CartItem","l","r","1:N")
b += rel("Product","TraceEvent","r","l","1:N")
b += rel("Product","OrderItem","b","t","1:N")
b += rel("Product","WishlistItem","r","t","1:N")
b += rel("Order","OrderItem","r","l","1:N")
b += rel("Order","OrderStatusEvent","b","t","1:N")
b += rel("Order","Payment","b","l","1:1")
b += rel("OrderItem","Review","r","l","1:1")
b += rel("User","RewardsLedger","r","t","1:N")
b += rel("FarmerProfile","GovFarmerCardRecord","r","l","lookup only (কোনো FK নেই)", col=RED, dash="5,4")
b += label(800, 148, "AuditLog-এ ইচ্ছাকৃতভাবে কোনো FK নেই", fs=8.4, fill=RED)
write("d8-erd.svg", svg(916, 680, b))

# ---------------------------------------------------------------- 9. Deployment
b = ""
b += box(24, 30, 180, 60, ["Developer", "git push"], fill="#ffffff", stroke=LINE, tc=INK)
b += arrow(204, 60, 244, 60, GREEN, "arg")
b += box(246, 20, 210, 80, ["GitHub", "fardaus12345/fair-harvest", "branch: main / feature"], fill=SOFT, fs=10.5)
b += arrow(456, 60, 496, 60, GREEN, "arg"); b += label(476, 50, "webhook", fs=8.6, fill=MUT)
b += box(498, 10, 380, 100, ["Vercel Build", "npm run build →  prisma generate  ·  prisma migrate deploy  ·  next build",
                             "Production = main · Preview = অন্য প্রতিটি branch"], fill=ASOFT, stroke=AMBER, tc=AMBER, fs=10)
b += poly([(688, 110), (688, 142)], GREEN, "arg")
b += box(498, 144, 380, 60, ["Vercel Serverless Functions + CDN", "Next.js app (UI + /api/v1) একই deployment-এ"], fill=SOFT, fs=10.5)
b += poly([(560, 204), (560, 244)], GREEN, "arg"); b += poly([(820, 204), (820, 244)], GREEN, "arg")
b += box(454, 246, 220, 62, ["Neon PostgreSQL", "pooled = DATABASE_URL", "direct = DIRECT_URL"], fill=BSOFT, stroke=BLUE, tc=BLUE, fs=10.5)
b += box(704, 246, 190, 62, ["Vercel Blob", "product image CDN", "BLOB_READ_WRITE_TOKEN"], fill=BSOFT, stroke=BLUE, tc=BLUE, fs=10.5)
b += box(24, 144, 440, 64, ["Environment Variables (Vercel Project Settings)",
                            "DATABASE_URL · DIRECT_URL · JWT_SECRET · STORAGE_PROVIDER=object · BLOB_*"],
         fill=GREY, stroke=LINE, tc=INK, fs=9.6)
b += arrow(464, 176, 496, 176, LINE)
b += box(24, 246, 400, 62, ["প্রতিটি build-এ prisma migrate deploy চলে", "→ নতুন migration স্বয়ংক্রিয়ভাবে production DB-তে প্রয়োগ হয়"],
         fill=ASOFT, stroke=AMBER, tc=AMBER, fs=9.8)
write("d9-deploy.svg", svg(910, 326, b))

# ---------------------------------------------------------------- 10. Image upload flow
b = ""
steps = [
 ("Farmer ছবি নির্বাচন করে", "ProductImageUploader.js", SOFT, GREEN),
 ("Client-side pre-check", "type ∈ {jpeg,png,webp} · ≤ 3 MB", "#ffffff", LINE),
 ("POST /uploads/product-image", "multipart/form-data + Bearer JWT", SOFT, GREEN),
 ("requireUser + role gate", "শুধু VERIFIED farmer বা ADMIN — নাহলে 403", ASOFT, AMBER),
 ("enforceRateLimit", "product-image-upload · 20 / 60s", ASOFT, AMBER),
 ("validateImageUpload()", "MIME + size — SVG ইচ্ছাকৃতভাবে নিষিদ্ধ", "#ffffff", LINE),
 ("buildStorageKey()", "products/<randomUUID>.<ext> — client filename ব্যবহার হয় না", "#ffffff", LINE),
 ("putObject() → provider", "STORAGE_PROVIDER: local disk | Vercel Blob", BSOFT, BLUE),
 ("{ image_url } ফেরত আসে", "ছবি এখনো কোনো product-এর সাথে যুক্ত নয়", SOFT, GREEN),
 ("POST/PATCH /products { image_url }", "DB-তে শুধু URL সংরক্ষিত হয়, কখনো bytes নয়", GREEN, GREEN),
]
y = 16
for i, (t, sub, fill, col) in enumerate(steps):
    tc = "#ffffff" if fill == GREEN else col
    b += box(150, y, 600, 46, [t, sub], fill=fill, stroke=col, tc=tc, fs=10.5)
    b += f'<circle cx="122" cy="{y+23}" r="13" fill="{col}"/>'
    b += label(122, y+27, str(i+1), fs=10.5, fill="#ffffff", weight="700")
    if i < len(steps)-1:
        b += arrow(450, y+46, 450, y+58, LINE, w=1.4)
    y += 60
b += box(150, y+4, 600, 44, ["পুরোনো ছবি প্রতিস্থাপিত হলে storageKeyFromUrl() দিয়ে key বের করে deleteObject() — orphan file থাকে না"],
         fill=ASOFT, stroke=AMBER, tc=AMBER, fs=9.8)
write("d10-upload.svg", svg(800, y+62, b))

# ---------------------------------------------------------------- 11. Reputation
b = ""
b += box(30, 20, 250, 56, ["Verification status", "VERIFIED 90 · PENDING 60 · REJECTED 30"], fill=SOFT, fs=10.5)
b += box(30, 92, 250, 56, ["Average review rating", "(avg / 5) × 100 · review না থাকলে 70"], fill=SOFT, fs=10.5)
b += box(30, 164, 250, 56, ["Delivery completion", "(delivered / total) × 100 · order না থাকলে 75"], fill=SOFT, fs=10.5)
for yy, w in [(48, "× 0.35"), (120, "× 0.40"), (192, "× 0.25")]:
    b += arrow(280, yy, 348, 120, GREEN, "arg")
    b += label(316, yy + (10 if yy == 192 else -6), w, fs=10, fill=AMBER, weight="700")
b += box(350, 92, 210, 56, ["clamp(0 … 100)", "overall_score"], fill=GREEN, stroke=GREEN, tc="#fff", fs=11.5)
b += arrow(560, 120, 600, 120, GREEN, "arg")
b += box(602, 60, 268, 120, ["badgeForScore()", "≥ 90 → Trusted Seller", "≥ 75 → Reliable Farmer",
                             "≥ 55 → Growing Farmer", "< 55 → New Farmer"], fill=ASOFT, stroke=AMBER, tc=AMBER, fs=10.5)
b += box(30, 238, 840, 58, ["পুনরায় গণনা হয় যখন:  নতুন review জমা পড়ে  ·  admin verification approve/reject করে  ·  order DELIVERED / CANCELLED হয়  ·  admin কোনো review hide/republish করে",
                            "recomputeFarmerReputation() → FarmerProfile.reputationScore ও badge ডাটাবেসে লিখে রাখে"],
         fill=BSOFT, stroke=BLUE, tc=BLUE, fs=9.8)
write("d11-reputation.svg", svg(900, 312, b))
print("ALL DIAGRAMS DONE")
