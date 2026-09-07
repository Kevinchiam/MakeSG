import { NextResponse } from "next/server";

const TEST_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAIAAABt+uBvAAABF0lEQVR4nO3SsQ3CMBCG0axEwRwswAaslAFpKegZACkB2/Gd4yd9tf/Tk5f366mNlvALkgcIECBAgBIHCBCguYDW2zX8hlxA6+263bxAuzQZmMKA/tIJNIoBKtCJMgoAKtYJMeoNVKnT36grUBOdzkaA0gA11OlpBAgQIEATADXX6WbkBwECBAjQ+YAu90dBDXXKDgA0OFAro+L1AYDqjWqmxwCqMarcHQaozKh+dCSgf42aLA4G9CNTw60hgb69jnv8DECHBggQIECAEgcIECBAgBIHCBAgQIASBwgQIECAEgcIECBAgBIHCBAgQHMAzRMgQIAAAUocIECAAAFKHCBAgAABShwgQIAAAUocIECAAAFKHKCdPg+EB6Y3bvWhAAAAAElFTkSuQmCC";

export function GET() {
  return new NextResponse(Buffer.from(TEST_IMAGE_BASE64, "base64"), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
    },
  });
}
