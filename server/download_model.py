import urllib.request
import ssl
import sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://raw.githubusercontent.com/sarahkemi/thumos/master/model_pca_20_svm.json"
dst = "client/public/model_pca_20_svm.json"

req = urllib.request.Request(
    url,
    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
)

print(f"Downloading {url} to {dst}...")
try:
    with urllib.request.urlopen(req, context=ctx) as response, open(dst, "wb") as f:
        f.write(response.read())
    print("Download Succeeded!")
except Exception as e:
    print("Download Failed:", e)
    sys.exit(1)
