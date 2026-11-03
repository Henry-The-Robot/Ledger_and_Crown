"""Shared decoder for the study result code (projects/studio/STUDY-LOG-SCHEMA.md).

Code format: <base64url(deflate(JSON rows))>.<4 hex checksum>
Checksum: low 16 bits of CRC32 over the body text, 4 lowercase hex characters.
Use: python decode_result.py "<code>"   (prints the rows as JSON; exit 1 on a bad code)
"""
import base64
import json
import sys
import zlib


class BadChecksum(ValueError):
    pass


def checksum(body):
    return "%04x" % (zlib.crc32(body.encode("ascii")) & 0xFFFF)


def encode(rows):
    raw = json.dumps(rows, separators=(",", ":")).encode("utf-8")
    body = base64.urlsafe_b64encode(zlib.compress(raw, 9)).decode("ascii").rstrip("=")
    return body + "." + checksum(body)


def decode(code):
    code = "".join(code.split())
    body0, dot0, tail0 = code.rpartition(".")
    code = body0 + dot0 + tail0.lower()  # the checksum is hex: accept pasted upper case
    body, dot, tail = code.rpartition(".")
    if not dot or not body or not body.isascii() or tail != checksum(body):
        raise BadChecksum("bad checksum or malformed code")
    pad = "=" * (-len(body) % 4)
    try:
        raw = zlib.decompress(base64.urlsafe_b64decode(body + pad))
        return json.loads(raw.decode("utf-8"))
    except Exception as exc:
        raise BadChecksum("code body cannot be read: %s" % exc)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.stderr.write("usage: decode_result.py <code>\n")
        sys.exit(2)
    try:
        print(json.dumps(decode(sys.argv[1])))
    except BadChecksum as exc:
        sys.stderr.write("REJECTED: %s\n" % exc)
        sys.exit(1)
