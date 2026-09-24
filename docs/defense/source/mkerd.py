# -*- coding: utf-8 -*-
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mkdiagrams import svg, label, poly, esc, GREEN, LINE, INK, MUT, RED, write, AMBER

E = {}
def ent(name, x, y, w, fields, accent=GREEN):
    h = 26 + len(fields)*15 + 8
    E[name] = (x, y, w, h)
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#ffffff" stroke="{accent}" stroke-width="1.4"/>'
    s += f'<rect x="{x}" y="{y}" width="{w}" height="24" rx="6" fill="{accent}"/>'
    s += f'<rect x="{x}" y="{y+16}" width="{w}" height="8" fill="{accent}"/>'
    s += label(x+w/2, y+16.5, name, fs=10.4, fill="#ffffff", weight="700")
    for i, f in enumerate(fields):
        bold = ("PK" in f or "UQ" in f)
        s += label(x+8, y+40+i*15, f, fs=8.3, fill=INK if bold else MUT, anchor="start",
                   weight="700" if bold else "400")
    return s

b = ""
# --- column 1
b += ent("User", 20, 20, 180, ["id  PK", "email  UQ", "passwordHash", "name, phone", "role, status"])
b += ent("Cart", 20, 190, 180, ["id  PK", "userId  FK UQ"])
b += ent("CartItem", 20, 310, 180, ["id  PK", "cartId  FK", "productId  FK", "quantityKg, unitPriceBdt", "UQ(cart, product, source)"])
b += ent("Order", 20, 450, 180, ["id  PK", "userId  FK", "status", "totalBdt, deliveryFeeBdt", "paymentMethod / Status"])
b += ent("OrderStatusEvent", 20, 600, 180, ["id  PK", "orderId  FK", "status, note", "createdAt"])
# --- column 2
b += ent("FarmerProfile", 250, 20, 200, ["id  PK", "userId  FK UQ", "farmerCardNumber", "nidNumber, district", "verificationStatus / Method", "reputationScore, badge"])
b += ent("Product", 250, 190, 200, ["id  PK", "farmerId  FK", "name, category", "priceBdt, quantityKg", "freshnessWindowDays", "trustScore, imageUrl", "status"])
b += ent("OrderItem", 250, 400, 200, ["id  PK", "orderId  FK", "productId  FK (RESTRICT)", "farmerId", "nameSnapshot", "quantityKg, unitPrice, lineTotal"])
b += ent("Payment", 250, 600, 200, ["id  PK", "orderId  FK UQ", "method, amountBdt", "status", "demoTransactionRef"])
# --- column 3
b += ent("GovFarmerCardRecord", 500, 20, 200, ["id  PK", "cardNumber  UQ", "nidNumber, fullName", "district, issueDate", "status, cropTypes"], accent="#1e3a8a")
b += ent("TraceEvent", 500, 190, 200, ["id  PK", "productId  FK", "stage", "timestamp, note", "gpsLat, gpsLng"])
b += ent("Review", 500, 400, 200, ["id  PK", "customerId  FK", "productId  FK", "farmerId", "orderItemId  FK UQ", "rating, comment, status", "UQ(customer, product)"])
# --- column 4
b += ent("AuditLog", 750, 20, 180, ["id  PK", "actorId, actorRole", "action", "targetType, targetId", "metadata (JSON string)"], accent=RED)
b += ent("WishlistItem", 750, 190, 180, ["id  PK", "userId  FK", "productId  FK", "UQ(user, product)"])
b += ent("RewardsLedger", 750, 340, 180, ["id  PK", "userId  FK", "points", "reason", "createdAt"])

def link(pts, txt="", tx=None, ty=None, col=LINE, dash=None):
    s = poly(pts, col, "ar", dash=dash, w=1.3)
    if txt:
        mx = tx if tx is not None else (pts[0][0]+pts[-1][0])/2
        my = ty if ty is not None else (pts[0][1]+pts[-1][1])/2 - 4
        s += label(mx, my, txt, fs=8, fill=col)
    return s

b += link([(200, 74), (248, 74)], "1:1", 224, 68)
b += link([(450, 74), (498, 74)], "lookup only — কোনো FK নেই", 474, 12, col=RED, dash="5,4")
b += link([(350, 144), (350, 188)], "1:N", 366, 170)
b += link([(110, 129), (110, 188)], "1:1", 126, 162)
b += link([(110, 254), (110, 308)], "1:N", 126, 285)
b += link([(250, 300), (225, 300), (225, 350), (202, 350)], "1:N", 232, 332)
b += link([(450, 240), (498, 240)], "1:N", 474, 234)
b += link([(350, 329), (350, 398)], "1:N", 366, 368)
b += link([(450, 315), (840, 315), (840, 288)], "1:N", 640, 310)
b += link([(170, 129), (170, 166), (840, 166), (840, 186)], "1:N", 500, 161)
b += link([(185, 129), (185, 178), (735, 178), (735, 383), (748, 383)], "1:N", 460, 173)
b += link([(20, 95), (8, 95), (8, 505), (18, 505)], "1:N", 28, 470)
b += link([(200, 505), (225, 505), (225, 462), (248, 462)], "1:N", 236, 488)
b += link([(110, 559), (110, 598)], "1:N", 126, 582)
b += link([(200, 540), (236, 540), (236, 650), (248, 650)], "1:1", 248, 600)
b += link([(450, 455), (498, 455)], "1:1", 474, 449)

b += label(20, 722, "PK = Primary Key   ·   FK = Foreign Key   ·   UQ = Unique constraint   ·   Review-এ productId ও farmerId denormalized reference হিসেবেও রাখা আছে", fs=8.2, fill=MUT, anchor="start")
write("d8-erd.svg", svg(950, 732, b))
print("erd rebuilt")
