import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Lab of UI experiments";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "rgb(23,23,23)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          color: "white",
          padding: 30,
        }}
      >
        <p style={{ fontSize: 90 }}>Lab of UI</p>
        <p style={{ fontSize: 35 }}>@mariogyd</p>
      </div>
    ),
    {
      ...size,
    }
  );
}
