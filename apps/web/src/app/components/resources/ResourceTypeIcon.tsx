import {
  BookOpenCheck,
  ClipboardCheck,
  Code2,
  FileArchive,
  FileQuestion,
  FileText,
  NotebookText,
  Presentation,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

const TYPE_ICONS: Array<{ match: string[]; icon: LucideIcon; classes: string }> = [
  { match: ["examen", "quiz", "prueba"], icon: ClipboardCheck, classes: "bg-red-100 text-red-600" },
  { match: ["apunte", "nota"], icon: NotebookText, classes: "bg-emerald-100 text-emerald-600" },
  { match: ["ejercicio", "practica", "práctica"], icon: FileQuestion, classes: "bg-purple-100 text-purple-600" },
  { match: ["codigo", "código", "code", "fuente"], icon: Code2, classes: "bg-orange-100 text-orange-600" },
  { match: ["resumen", "sintesis", "síntesis"], icon: ScrollText, classes: "bg-blue-100 text-blue-600" },
  { match: ["presentacion", "presentación", "diapositiva"], icon: Presentation, classes: "bg-cyan-100 text-cyan-600" },
  { match: ["libro", "lectura"], icon: BookOpenCheck, classes: "bg-indigo-100 text-indigo-600" },
  { match: ["zip", "archivo"], icon: FileArchive, classes: "bg-slate-100 text-slate-600" },
];

export function resourceTypeIcon(type: string) {
  const normalized = type.toLowerCase();
  return TYPE_ICONS.find((item) => item.match.some((word) => normalized.includes(word))) || {
    icon: FileText,
    classes: "bg-blue-100 text-blue-600",
  };
}

const FILE_ICON_BY_EXTENSION: Record<string, string> = {
  c: "/archivo-codigo.png",
  cpp: "/archivo-codigo.png",
  cs: "/archivo-codigo.png",
  css: "/archivo-codigo.png",
  csv: "/archivo-csv.png",
  doc: "/archivo-doc.png",
  docx: "/archivo-doc.png",
  html: "/archivo-codigo.png",
  java: "/archivo-codigo.png",
  js: "/archivo-codigo.png",
  json: "/archivo-codigo.png",
  link: "/link.png",
  md: "/archivo-txt.png",
  pdf: "/archivo-pdf.png",
  ppt: "/archivo-ppt.png",
  pptx: "/archivo-ppt.png",
  py: "/archivo-codigo.png",
  rar: "/archivo-zip.png",
  tar: "/archivo-targz.png",
  tgz: "/archivo-targz.png",
  ts: "/archivo-codigo.png",
  txt: "/archivo-txt.png",
  xls: "/archivo-csv.png",
  xlsx: "/archivo-csv.png",
  zip: "/archivo-zip.png",
};

function iconForExtension(fileExtension?: string | null) {
  if (!fileExtension) return null;
  const normalized = fileExtension.replace(/^\./, "").toLowerCase();
  return FILE_ICON_BY_EXTENSION[normalized] || null;
}

export function ResourceTypeIcon({
  type,
  fileExtension,
  className = "",
}: {
  type: string;
  fileExtension?: string | null;
  className?: string;
}) {
  const fileIcon = iconForExtension(fileExtension);
  if (fileIcon) {
    return (
      <span className={`inline-flex items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-blue-100 ${className}`}>
        <img src={fileIcon} alt="" className="h-7 w-7 object-contain" />
      </span>
    );
  }

  const { icon: Icon, classes } = resourceTypeIcon(type);
  return (
    <span className={`inline-flex items-center justify-center rounded-xl p-2 ${classes} ${className}`}>
      <Icon aria-hidden="true" className="h-5 w-5" />
    </span>
  );
}
