import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "../utils/authClient";
import { v4 as uuidv4 } from "uuid";

const ShowQRScreen = ({ userId, onBack }) => {
  const [qrImage, setQrImage] = useState(null);

  useEffect(() => {
    const generateQR = async () => {
      const token = uuidv4();

      const { error } = await supabase.from("qr_tokens").insert([
        {
          user_id: userId,
          token,
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      const url = `https://your-app.com/redeem?token=${token}`;
      const image = await QRCode.toDataURL(url);
      setQrImage(image);
    };

    generateQR();
  }, [userId]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Show this QR at the till</h2>
      {qrImage ? (
        <img src={qrImage} alt="QR Code" style={{ width: 240 }} />
      ) : (
        <p>Loading QR...</p>
      )}
      <button onClick={onBack}>Back</button>
    </div>
  );
};

export default ShowQRScreen;
