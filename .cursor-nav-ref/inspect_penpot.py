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


def dump_tree(oid, indent=0, maxd=5):
    o = objs.get(oid)
    if not o:
        return
    sr = o.get("selrect") or {}
    print(
        "  " * indent
        + f"{str(o.get('type')):8} {str(o.get('name'))!r:30} "
        f"{round(sr.get('x') or 0):5} {round(sr.get('y') or 0):5} "
        f"{round(sr.get('width') or 0):4}x{round(sr.get('height') or 0):3}"
    )
    extra = []
    if o.get("type") == "bool":
        extra.append(f"bool={o.get('boolType') or o.get('bool-type')}")
    if o.get("content") and o.get("type") == "path":
        extra.append(f"cmds={len(o['content'])}")
    if extra:
        print("  " * indent + "  " + " ".join(extra))
    if indent >= maxd:
        return
    for cid in o.get("shapes") or []:
        dump_tree(cid, indent + 1, maxd)


wanted = {"BNB-25", "BNB-33", "BNB-39", "BNB-04", "BNB-05", "BNB-06"}
seen = set()
for o in objs.values():
    if o.get("name") not in wanted or o.get("type") != "frame":
        continue
    sr = o.get("selrect") or {}
    w = sr.get("width") or 0
    h = sr.get("height") or 0
    if not (350 <= w <= 500 and 60 <= h <= 160):
        continue
    if o["name"] in seen:
        continue
    seen.add(o["name"])
    print("\n====", o["name"], "====")
    dump_tree(o["id"], 0, 6)
