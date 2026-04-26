import Flag from "react-flagpack";

const CODE_MAP: Record<string, string> = {
  GB: "GB-UKM",
};

type CountryFlagProps = {
  code?: string | null;
  size?: "s" | "m" | "l";
};

export default function CountryFlag({ code, size = "m" }: CountryFlagProps) {
  if (!code || code === "UNKNOWN" || !/^[a-z]{2}$/i.test(code)) {
    return (
      <span className={size === "s" ? "text-[14px] leading-none" : "text-[18px] leading-none"}>
        🌐
      </span>
    );
  }

  const upper = code.toUpperCase();
  const flagCode = CODE_MAP[upper] || upper;

  return (
    <Flag
      code={flagCode}
      size={size}
      hasBorder={false}
      hasBorderRadius
      gradient="real-linear"
    />
  );
}
