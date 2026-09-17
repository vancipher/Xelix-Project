import json
import zipfile

z = zipfile.ZipFile(
    r"C:\Users\txcwu\OneDrive\Desktop\50 Mobile Bottom Navigation Bar (Community).penpot"
)
prefix = "files/83a5f771-50ad-805a-8007-87f7625cf0d1/pages/83a5f771-50ad-805a-8007-87f7632e1410/"
objs = {}
for n in z.namelist():
    if not n.startswith(prefix) or not n.endswith(".json"):
        continue
    o = json.loads(z.read(n))
    objs[o["id"]] = o


def find_bnb(name):
    for o in objs.values():
        if o.get("name") != name or o.get("type") != "frame":
            continue
        sr = o.get("selrect") or {}
        w = sr.get("width") or 0
        h = sr.get("height") or 0
        if 350 <= w <= 500 and 60 <= h <= 160:
            return o
    return None


def dump_path(o, label):
    sr = o.get("selrect") or {}
    print("\n##", label, o.get("name"), o.get("type"))
    print("selrect", {k: round(sr.get(k) or 0, 2) for k in ("x", "y", "width", "height")})
    if o.get("type") == "circle":
        print("circle")
    content = o.get("content")
    if content:
        ox, oy = sr.get("x") or 0, sr.get("y") or 0
        print("relative commands:")
        for cmd in content:
            p = cmd.get("params") or {}
            rel = {k: round((p[k] - (ox if "x" in k else oy)), 2) for k in p}
            print(" ", cmd.get("command"), rel)


for bnb_name in ("BNB-04", "BNB-05", "BNB-33"):
    root = find_bnb(bnb_name)
    print("\n====", bnb_name, "====")
    stack = [root["id"]]
    while stack:
        oid = stack.pop(0)
        o = objs[oid]
        if o.get("name") in ("Subtract", "bg", "Union", "Vector", "Rectangle 373", "Ellipse 205", "Ellipse 206", "Ellipse 207") or o.get("type") in ("path", "circle", "bool", "rect"):
            dump_path(o, bnb_name)
        for cid in o.get("shapes") or []:
            stack.append(cid)
