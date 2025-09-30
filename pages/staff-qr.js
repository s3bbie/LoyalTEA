// pages/staff-qr.js
import Head from "next/head";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { QRCodeCanvas } from "qrcode.react";

export default function StaffQR({ staffToken }) {
  return (
    <>
      <Head><title>Staff QR – LoyalTEA</title></Head>
      <div className="staff-qr-page">
        <h1>Staff QR Code</h1>
        <p>Show this QR to customers for stamps or rewards</p>
        <div className="qr-wrapper">
        <QRCodeCanvas value="your-data-here" size={256} />
        </div>
      </div>
    </>
  );
}

// Protect server-side
export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token || null;

  if (!token) {
    return { redirect: { destination: "/", permanent: false } };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Allow only staff role
    if (decoded.role !== "staff") {
      return { redirect: { destination: "/home", permanent: false } };
    }

    // Generate a short-lived staff QR JWT
    const staffToken = jwt.sign(
      { type: "staff", exp: Math.floor(Date.now() / 1000) + 60 }, // 1 min expiry
      process.env.JWT_SECRET
    );

    return { props: { staffToken } };
  } catch (err) {
    return { redirect: { destination: "/", permanent: false } };
  }
}

export const config = {
  runtime: "nodejs",
};
