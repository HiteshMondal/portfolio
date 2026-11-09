import json, html
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle as S
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem, HRFlowable, KeepTogether

d = json.load(open("src/data.json", encoding="utf8")); P = d["P"]
NAVY, GOLD, MUT, INK = colors.HexColor("#0a1a3a"), colors.HexColor("#ffd23f"), colors.HexColor("#46597f"), colors.HexColor("#111827")
e = html.escape
body = S("b", fontName="Helvetica", fontSize=8.8, leading=11.8, textColor=INK)
sm = S("s", parent=body, fontSize=8.2, textColor=MUT)
h = S("h", fontName="Helvetica-Bold", fontSize=9.6, leading=12, textColor=NAVY, spaceBefore=9)
ttl = S("t", parent=body, fontName="Helvetica-Bold", fontSize=9.6)
right = S("r", parent=sm, alignment=2)

def sec(t): return [Paragraph(e(t.upper()), h), HRFlowable(width="100%", thickness=.8, color=NAVY, spaceBefore=1, spaceAfter=4)]
def bullets(items): return ListFlowable([ListItem(Paragraph(e(i), body), leftIndent=10) for i in items], bulletType="bullet", bulletFontSize=6, leftIndent=10, bulletOffsetY=-1)
def row(l, r_, sub=None):
    t = Table([[Paragraph(l, ttl), Paragraph(e(r_), right)]], colWidths=[None, 42*mm])
    t.setStyle(TableStyle([("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),("TOPPADDING",(0,0),(-1,-1),1),("BOTTOMPADDING",(0,0),(-1,-1),0),("VALIGN",(0,0),(-1,-1),"TOP")]))
    return [t] + ([Paragraph(sub, sm)] if sub else [])

def page1(c, doc):
    W, H = A4
    c.setFillColor(NAVY); c.rect(0, H-36*mm, W, 36*mm, 0, 1)
    c.setFillColor(GOLD); c.rect(0, H-38*mm, W, 2*mm, 0, 1)
    c.setFillColor(colors.white); c.setFont("Helvetica-Bold", 25); c.drawString(16*mm, H-16*mm, P["name"])
    c.setFillColor(GOLD); c.setFont("Helvetica-Bold", 9.5); c.drawString(16*mm, H-22.5*mm, "Aspiring IT Engineer  |  Cloud Computing  |  DevOps  |  Platform Engineering  |  Linux")
    c.setFillColor(colors.HexColor("#d6e4ff")); c.setFont("Helvetica", 8.2)
    c.drawString(16*mm, H-28*mm, f'{P["email"]}  |  {P["phone"]}  |  Gachibowli, Hyderabad, Telangana, India (open to relocate)')
    c.drawString(16*mm, H-32.5*mm, "  |  ".join(P[k].replace("https://www.","").replace("https://","") for k in ("gh","li","lc")))

st = [Spacer(1, 31*mm)]
st += sec("Summary") + [Paragraph(e(d["SUMMARY"][0]) + " " + e(d["SUMMARY"][1]), body)]
st += sec("Skills") + [Paragraph(f"<b>{e(k)}:</b> {e(', '.join(v))}", body) for k, v in d["SKILLS"]]
j = d["JOB"]
st += sec("Experience") + row(e(j["role"]) + ", " + e(j["org"]), j["when"], e(j["place"])) + [bullets(j["pts"])]
st += sec("Projects")
for p in d["PROJ"]:
    st += [KeepTogether(row(e(p["name"]), p["when"], "GitHub: " + e(p["repo"])) + [bullets(p["pts"]), Spacer(1, 4)])]
st += sec("Achievements") + [bullets([(a["s"] if a["n"] is None else f'{a["n"]}{a["s"]}') + " " + a["t"] + " (" + a["src"] + ")" for a in d["ACH"]])]
st += sec("Education")
for a, b, c in d["EDU"]: st += row(e(a), c, e(b))
st += sec("Certifications") + [bullets([f"{a} ({b})" for a, b in d["CERTS"]])]
st += sec("Languages and interests") + [Paragraph(f'<b>Languages:</b> {e(d["LANGS"])}', body), Paragraph(f'<b>Hobbies:</b> {e(d["HOBBIES"])}', body)]
SimpleDocTemplate("resumes/Hitesh Mondal Resume.pdf", pagesize=A4, leftMargin=16*mm, rightMargin=16*mm, topMargin=13*mm, bottomMargin=12*mm, title="Hitesh Mondal Resume", author=P["name"]).build(st, onFirstPage=page1)
