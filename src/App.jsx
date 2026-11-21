import { useMemo, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  AlertCircle,
  Car,
  Check,
  Copy,
  Download,
  ExternalLink,
  Lightbulb,
  MessageCircle,
  Phone,
  Printer,
  QrCode,
  ShieldCheck,
} from "lucide-react";

const LABELS = {
  en: {
    tag: "SCAN TO CONTACT DRIVER",
    sub: "Point camera to call or message on WhatsApp",
    foot: "CARPING • DIRECT DRIVER CONTACT",
  },
  ar: {
    tag: "امسح الكود للتواصل مع السائق",
    sub: "وجّه الكاميرا للاتصال أو إرسال رسالة واتساب",
    foot: "CARPING • تواصل مباشر مع السائق",
  },
};

function normalizePhone(rawPhone, defaultCountryCode = "20") {
  let digits = (rawPhone || "").replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0") && defaultCountryCode) {
    digits = `${defaultCountryCode}${digits.slice(1)}`;
  } else if (digits.length === 10 && defaultCountryCode) {
    digits = `${defaultCountryCode}${digits}`;
  }

  return digits;
}

function Generator() {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [lang, setLang] = useState("en");
  const [copiedLink, setCopiedLink] = useState(false);

  const qrWrapperRef = useRef(null);
  const t = LABELS[lang];

  const normalizedDigits = normalizePhone(phone, "20");
  const internationalPhone = normalizedDigits ? `+${normalizedDigits}` : "";

  const shareUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (name.trim()) params.set("name", name.trim());
    if (model.trim()) params.set("model", model.trim());
    if (internationalPhone) params.set("phone", internationalPhone);
    if (note.trim()) params.set("note", note.trim());
    params.set("lang", lang);
    return `${window.location.origin}/car?${params.toString()}`;
  }, [name, model, internationalPhone, note, lang]);

  const isReady =
    name.trim().length > 0 &&
    model.trim().length > 0 &&
    normalizedDigits.length >= 8;

  const handleCopyLink = async () => {
    if (!isReady) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  const handleDownloadPng = () => {
    const qrCanvas = qrWrapperRef.current?.querySelector("canvas");
    if (!qrCanvas || !isReady) return;

    const width = 680;
    const height = 900;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 8;
    ctx.strokeRect(18, 18, width - 36, height - 36);

    ctx.fillStyle = "#2563eb";
    ctx.fillRect(22, 22, width - 44, 155);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(t.tag, width / 2, 110);

    const qrSize = 390;
    const qrX = (width - qrSize) / 2;
    const qrY = 215;
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = "#1e3a8a";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(model.trim(), width / 2, 660);

    ctx.fillStyle = "#334155";
    ctx.font = "600 22px sans-serif";
    ctx.fillText(`Driver: ${name.trim()}`, width / 2, 702);

    ctx.fillStyle = "#64748b";
    ctx.font = "20px sans-serif";
    ctx.fillText(t.sub, width / 2, 742);

    ctx.fillStyle = "#eff6ff";
    ctx.fillRect(22, 815, width - 44, 63);
    ctx.fillStyle = "#1d4ed8";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(t.foot, width / 2, 853);

    const link = document.createElement("a");
    const slug =
      model
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") || "carping";
    link.download = `${slug}-carping-card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/90 via-white to-blue-50/50 text-slate-900">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-blue-100 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/25">
              <Car className="w-5 h-5" />
            </div>
            <div className="truncate">
              <span className="font-bold text-lg tracking-tight text-blue-950">
                CarPing
              </span>
              <span className="ml-2 hidden sm:inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                Zero Backend
              </span>
            </div>
          </div>

          <div className="inline-flex rounded-xl bg-blue-50 p-1 border border-blue-200/70 shrink-0">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                lang === "en"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-blue-900/70 hover:text-blue-950"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                lang === "ar"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-blue-900/70 hover:text-blue-950"
              }`}
            >
              عربي
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 max-w-2xl print:hidden">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-950">
            Create Your CarPing QR Card
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1.5">
            Encode your name, car model, and phone number directly into a QR
            link—ready to print for your windshield.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <section className="lg:col-span-7 bg-white rounded-2xl border border-blue-100 shadow-sm p-5 sm:p-7 space-y-5 print:hidden">
            <div className="flex items-center justify-between pb-3 border-b border-blue-50">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-950">
                <QrCode className="w-4 h-4 text-blue-600" />
                Vehicle & Contact Details
              </div>
              <span className="text-xs text-blue-700/80 font-medium">
                * Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-blue-950 mb-1.5">
                  Driver Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mohamed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-blue-50/40 border border-blue-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-950 mb-1.5">
                  Car Model *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyundai Elantra"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-blue-50/40 border border-blue-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-blue-950 mb-1.5">
                Phone / WhatsApp Number (with country code) *
              </label>
              <input
                type="tel"
                placeholder="e.g. +201012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-blue-50/40 border border-blue-200 text-sm text-slate-900 placeholder:text-slate-400 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition"
              />
              <p className="text-xs text-slate-500 mt-1">
                Include your country code (such as{" "}
                <span className="font-mono text-blue-900">+20</span>)—local{" "}
                <span className="font-mono">010...</span> numbers also default
                to <span className="font-mono">+20</span>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-blue-950 mb-1.5">
                Optional Note on Scan Page
              </label>
              <input
                type="text"
                placeholder="e.g. Nearby—happy to move right away"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-blue-50/40 border border-blue-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition"
              />
            </div>

            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-blue-950/80">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                No database or backend required—your details are encoded
                straight into the QR code link.
              </span>
            </div>
          </section>

          <section className="lg:col-span-5 bg-white rounded-2xl border border-blue-100 shadow-sm p-5 sm:p-6 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900/70">
                Card Preview
              </span>
              {isReady && (
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Ready
                </span>
              )}
            </div>

            <div
              dir={lang === "ar" ? "rtl" : "ltr"}
              className="w-full max-w-[300px] rounded-2xl overflow-hidden bg-white border-2 border-blue-600 shadow-sm"
            >
              <div className="bg-blue-600 text-white px-4 py-4 text-center">
                <p className="text-sm sm:text-base font-extrabold tracking-wide">
                  {t.tag}
                </p>
              </div>

              <div className="p-5 flex flex-col items-center text-center bg-white">
                <div
                  ref={qrWrapperRef}
                  className="p-3 rounded-xl bg-white border border-blue-100"
                >
                  <QRCodeCanvas
                    value={shareUrl}
                    size={184}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#1e3a8a"
                  />
                </div>

                <p className="mt-3.5 text-base font-bold text-blue-950 line-clamp-1">
                  {model.trim() || "Car Model"}
                </p>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  {name.trim() || "Driver Name"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">{t.sub}</p>
              </div>

              <div className="bg-blue-50 border-t border-blue-100 text-blue-800 text-[10px] font-bold tracking-wider text-center py-2 px-3">
                {t.foot}
              </div>
            </div>

            <div className="w-full max-w-[300px] mt-5 space-y-2.5 print:hidden">
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={!isReady}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-100 disabled:text-blue-300 text-white shadow-sm shadow-blue-600/20 transition cursor-pointer disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download Card (PNG)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={!isReady}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 disabled:opacity-40 text-blue-900 border border-blue-200/80 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  {copiedLink ? "Copied" : "Copy Link"}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  disabled={!isReady}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 disabled:opacity-40 text-blue-900 border border-blue-200/80 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  Print
                </button>
              </div>

              {isReady && (
                <Link
                  to={shareUrl.replace(window.location.origin, "")}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white hover:bg-blue-50/70 text-blue-700 border border-blue-200 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Scan Page
                </Link>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const REASONS = [
  {
    id: "blocked",
    label: "Blocking my car",
    icon: Car,
    text: "Hi, your car seems to be blocking mine.",
  },
  {
    id: "lights",
    label: "Lights left on",
    icon: Lightbulb,
    text: "Hi, your car lights look like they are left on.",
  },
  {
    id: "alert",
    label: "Quick check",
    icon: AlertCircle,
    text: "Hi, could you please check on your car?",
  },
];

function CarScanPage() {
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState(REASONS[0]);
  const [copied, setCopied] = useState(false);

  const name = searchParams.get("name")?.trim() || "Driver";
  const model = searchParams.get("model")?.trim() || "Vehicle";
  const rawPhone = searchParams.get("phone")?.trim() || "";
  const note = searchParams.get("note")?.trim() || "";

  const waDigits = normalizePhone(rawPhone, "20");
  const displayPhone = waDigits ? `+${waDigits}` : rawPhone;

  const waMessage = encodeURIComponent(
    `Hello ${name} (${model}): ${selected.text}`,
  );

  const copyPhone = async () => {
    if (!displayPhone) return;
    await navigator.clipboard.writeText(displayPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (waDigits.length < 8) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white border border-blue-100 rounded-2xl p-6 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-9 h-9 text-blue-600 mx-auto" />
          <h1 className="text-lg font-bold text-blue-950">
            Missing Contact Details
          </h1>
          <p className="text-sm text-slate-600">
            This QR code doesn’t contain a valid phone number.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
          >
            Create a CarPing Card
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-blue-600 text-white px-6 py-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full">
            <Car className="w-3.5 h-3.5" /> CarPing
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-2">{model}</h1>
          <p className="text-sm text-blue-100 mt-0.5">Owner: {name}</p>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {note && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-950">
              <span className="font-bold text-blue-700 block mb-0.5">
                Note from driver
              </span>
              {note}
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-blue-950 mb-2">
              Reason for reaching out
            </p>
            <div className="space-y-2">
              {REASONS.map((item) => {
                const Icon = item.icon;
                const active = selected.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(item)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium border transition cursor-pointer ${
                      active
                        ? "border-blue-600 bg-blue-50 text-blue-950"
                        : "border-blue-100 bg-white text-slate-700 hover:bg-blue-50/40"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${active ? "text-blue-600" : "text-slate-400"}`}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-2.5 gap-2">
            <div className="min-w-0">
              <span className="text-[11px] text-slate-500 block">
                Phone number
              </span>
              <span className="font-mono text-sm font-semibold text-blue-950 truncate block">
                {displayPhone}
              </span>
            </div>
            <button
              type="button"
              onClick={copyPhone}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-blue-900 shrink-0 transition cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-blue-600" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            <a
              href={`tel:${displayPhone}`}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-sm shadow-blue-600/20 transition"
            >
              <Phone className="w-4 h-4" />
              Call {name}
            </a>

            <a
              href={`https://wa.me/${waDigits}?text=${waMessage}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 font-bold py-3.5 px-4 rounded-xl text-sm border-2 border-blue-600 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Message on WhatsApp
            </a>
          </div>

          <div className="text-center pt-1">
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-blue-700 underline"
            >
              Create a free CarPing card
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Generator />} />
          <Route path="/car" element={<CarScanPage />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </>
  );
}
