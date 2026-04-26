import {
  FaApple,
  FaDesktop,
  FaEdge,
  FaInternetExplorer,
  FaMobileAlt,
  FaQuestion,
  FaTabletAlt,
  FaWindows,
} from "react-icons/fa";
import {
  SiAndroid,
  SiArchlinux,
  SiBrave,
  SiDuckduckgo,
  SiFedora,
  SiFirefoxbrowser,
  SiGooglechrome,
  SiLinux,
  SiOpera,
  SiSafari,
  SiSamsung,
  SiUbuntu,
  SiVivaldi,
} from "react-icons/si";
import { TbDeviceTv, TbWorld } from "react-icons/tb";

const SIZE = 14;

function browserIcon(name = "") {
  const value = name.toLowerCase();
  if (value.includes("chrome")) return <SiGooglechrome size={SIZE} color="#4285F4" />;
  if (value.includes("safari")) return <SiSafari size={SIZE} color="#1B88CA" />;
  if (value.includes("firefox")) return <SiFirefoxbrowser size={SIZE} color="#FF7139" />;
  if (value.includes("edge")) return <FaEdge size={SIZE} color="#0078D7" />;
  if (value.includes("brave")) return <SiBrave size={SIZE} color="#FB542B" />;
  if (value.includes("opera")) return <SiOpera size={SIZE} color="#FF1B2D" />;
  if (value.includes("vivaldi")) return <SiVivaldi size={SIZE} color="#EF3939" />;
  if (value.includes("duckduckgo")) return <SiDuckduckgo size={SIZE} color="#DE5833" />;
  if (value.includes("samsung")) return <SiSamsung size={SIZE} color="#1428A0" />;
  if (value.includes("ie") || value.includes("explorer")) return <FaInternetExplorer size={SIZE} color="#1EBBEE" />;
  return <TbWorld size={SIZE} />;
}

function osIcon(name = "") {
  const value = name.toLowerCase();
  if (value.includes("windows")) return <FaWindows size={SIZE} color="#0078D6" />;
  if (value.includes("mac") || value.includes("ios") || value.includes("darwin")) return <FaApple size={SIZE} />;
  if (value.includes("android")) return <SiAndroid size={SIZE} color="#3DDC84" />;
  if (value.includes("ubuntu")) return <SiUbuntu size={SIZE} color="#E95420" />;
  if (value.includes("arch")) return <SiArchlinux size={SIZE} color="#1793D1" />;
  if (value.includes("fedora")) return <SiFedora size={SIZE} color="#294172" />;
  if (value.includes("chrome")) return <SiGooglechrome size={SIZE} color="#4285F4" />;
  if (value.includes("linux")) return <SiLinux size={SIZE} />;
  return <FaQuestion size={SIZE} />;
}

function deviceIcon(name = "") {
  const value = name.toLowerCase();
  if (value.includes("mobile") || value.includes("phone")) return <FaMobileAlt size={SIZE} />;
  if (value.includes("tablet") || value.includes("ipad")) return <FaTabletAlt size={SIZE} />;
  if (value.includes("tv") || value.includes("console")) return <TbDeviceTv size={SIZE} />;
  return <FaDesktop size={SIZE} />;
}

export default function TechIcon({
  type,
  name,
}: {
  type: "browser" | "os" | "device";
  name?: string | null;
}) {
  const icon =
    type === "browser"
      ? browserIcon(name || "")
      : type === "os"
        ? osIcon(name || "")
        : deviceIcon(name || "");

  return (
    <span className="inline-flex size-[14px] shrink-0 items-center justify-center text-[var(--text-secondary)]">
      {icon}
    </span>
  );
}
