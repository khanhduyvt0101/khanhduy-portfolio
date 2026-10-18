#!/usr/bin/env python3
"""Read-only smoke checks against a deployed portfolio. Uses public-trust TLS."""

import concurrent.futures
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser


class PageAssets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        values = []
        if tag in {"img", "script"}:
            values.append(attrs.get("src", ""))
        if tag == "link" and attrs.get("rel") in {"stylesheet", "preload"}:
            values.append(attrs.get("href", ""))
        for value in values:
            if value.startswith("/") and not value.startswith("//"):
                self.paths.add(value)


def get(base, path):
    request = urllib.request.Request(
        base + path,
        headers={"User-Agent": "PortfolioDeploymentSmokeTest/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, response.headers, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.headers, error.read()


def main():
    base = sys.argv[1].rstrip("/")
    preview = "--preview" in sys.argv[2:]
    status, headers, body = get(base, "/")
    assert status == 200, ("home", status)
    html = body.decode()
    assert "Khanh Duy" in html
    assert 'rel="canonical" href="https://www.khanhduy.com"' in html or (
        'rel="canonical" href="https://www.khanhduy.com/"' in html
    )
    assert "/_vercel/insights/" not in html
    assert "/_vercel/speed-insights/" not in html
    assert headers.get("X-Content-Type-Options") == "nosniff"
    if preview:
        assert "noindex" in headers.get("X-Robots-Tag", "")
    else:
        assert "noindex" not in headers.get("X-Robots-Tag", "")

    checked = ["/"]
    for path, content_type, marker in [
        ("/robots.txt", "text/plain", b"https://www.khanhduy.com/sitemap.xml"),
        ("/sitemap.xml", "xml", b"https://www.khanhduy.com"),
        ("/opengraph-image", "image/png", b"\x89PNG\r\n\x1a\n"),
        ("/twitter-image", "image/png", b"\x89PNG\r\n\x1a\n"),
        ("/icon.png", "image/png", b"\x89PNG\r\n\x1a\n"),
        ("/favicon.ico", "image/", None),
    ]:
        code, response_headers, data = get(base, path)
        assert code == 200, (path, code)
        assert content_type in response_headers.get("Content-Type", ""), path
        assert marker is None or marker in data, path
        checked.append(path)

    parser = PageAssets()
    parser.feed(html)
    paths = sorted(parser.paths)
    assert not any(path.startswith("/_next/image?") for path in paths)
    assert any(path.endswith(".webp") for path in paths)
    assert any(path.endswith(".css") for path in paths)
    assert any(".js" in path for path in paths)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(lambda path: (path, get(base, path)), paths))
    for path, (code, _, data) in results:
        assert code == 200 and data, (path, code)
    assert get(base, "/__deployment_missing_page__")[0] == 404
    print(json.dumps({
        "base": base,
        "preview": preview,
        "routes_passed": checked + ["404"],
        "assets_passed": len(paths),
        "tls_verification": (
            "system trust store (no insecure bypass)"
            if base.startswith("https://")
            else "not applicable: local HTTP preview"
        ),
        "result": "PASS",
    }, indent=2))


if __name__ == "__main__":
    main()
