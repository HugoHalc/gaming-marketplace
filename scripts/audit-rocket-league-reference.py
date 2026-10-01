"""Reproduce the public Nuxt tariff capture without a browser or application server.
Usage: python scripts/audit-rocket-league-reference.py /tmp/rocket-league-public-audit
Requires Python 3 and curl. Writes evidence only to the specified scratch directory.
"""
import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import re
import subprocess
import sys
from decimal import Decimal, ROUND_HALF_UP


def decode(values):
    cache = {}

    def resolve(index):
        if index < 0:
            return None
        if index in cache:
            return cache[index]
        value = values[index]
        if isinstance(value, dict):
            result = {}
            cache[index] = result
            result.update({key: resolve(ref) for key, ref in value.items()})
            return result
        if isinstance(value, list):
            if value and isinstance(value[0], str):
                return resolve(value[1]) if len(value) > 1 and isinstance(value[1], int) else value
            result = []
            cache[index] = result
            result.extend(resolve(ref) for ref in value)
            return result
        return value

    return resolve(0)


def capture(service, destination):
    url = f"https://boostingmarket.com/en/rocket-league-boost/rocket-league-{service}-boost"
    html = subprocess.check_output(["curl", "-fLsS", "--max-time", "30", url])
    text = html.decode()
    match = re.search(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>', text, re.S)
    if not match:
        raise ValueError(f"Missing public Nuxt payload: {url}")
    payload = decode(json.loads(match[1]))
    pack = payload["data"][f"get-game-pack-rocket-league-{service}-boost-en-primary-page"]["data"]
    destination.joinpath(f"{service}.html").write_bytes(html)
    destination.joinpath(f"{service}.json").write_text(json.dumps(payload, indent=2) + "\n")
    return service, pack, {"url": url, "htmlSha256": hashlib.sha256(html).hexdigest()}


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Provide an output directory outside the repository.")
    destination = pathlib.Path(sys.argv[1]).resolve()
    destination.mkdir(parents=True, exist_ok=True)
    services = ["rank", "wins", "tournament", "rewards", "placements"]
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(lambda service: capture(service, destination), services))
    packs = {service: pack for service, pack, _ in results}
    anchors = [
        ("rank", [18, 19], 1, [11535, 5652, 3391]),
        ("rank", [18, 19, 20], 1, [23724, 10201, 6121]),
        ("wins", [2], 1, [188, 103, 62]),
        ("wins", [2], 12, [2257, 1241, 745]),
        ("tournament", [2], 1, [3201, 1761, 1057]),
        ("rewards", [5], 1, [212, 117, 70]),
        ("placements", [3], 1, [199, 109, 65]),
    ]
    audit = {"capturedAtUtc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
             "sources": [source for _, _, source in results], "anchors": []}
    for service, indices, count, expected in anchors:
        raw = sum(Decimal(str(packs[service]["prices"][i]["price"])) for i in indices) * count * 100
        cents = int(raw.quantize(Decimal(1), rounding=ROUND_HALF_UP))
        bps = 1200 if cents >= 20000 else 900 if cents >= 15000 else 600 if cents >= 10000 else 300 if cents >= 5000 else 0
        discounted = (cents * (5500 - bps) + 5000) // 10000
        actual = [cents, discounted, (discounted * 6000 + 5000) // 10000]
        audit["anchors"].append({"service": service, "priceIndices": indices, "quantity": count,
                                "actual": actual, "expected": expected, "matches": actual == expected})
    destination.joinpath("audit.json").write_text(json.dumps(audit, indent=2) + "\n")
    print(json.dumps(audit, indent=2))
    if not all(anchor["matches"] for anchor in audit["anchors"]):
        raise SystemExit("Reference changed: do not update prices from this capture.")


if __name__ == "__main__":
    main()
