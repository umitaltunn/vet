import {
  Stethoscope, Syringe, Scissors, Smile, Scan, Sparkles, Siren, Bone, HeartPulse, FlaskConical, Microscope, Bird, Turtle, Rabbit,
  Heart, ShieldCheck, Home, Cat, Dog, Pill, type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  stethoscope: Stethoscope, syringe: Syringe, scissors: Scissors, smile: Smile, scan: Scan, sparkles: Sparkles, siren: Siren,
  bone: Bone, "heart-pulse": HeartPulse, flask: FlaskConical, microscope: Microscope, bird: Bird, turtle: Turtle, rabbit: Rabbit,
  heart: Heart, shield: ShieldCheck, home: Home, cat: Cat, dog: Dog, pill: Pill,
};

export function ServiceIcon({ name, size = 26 }: { name: string; size?: number }) {
  const I = SERVICE_ICONS[name] ?? Stethoscope;
  return <I size={size} strokeWidth={1.8} />;
}
