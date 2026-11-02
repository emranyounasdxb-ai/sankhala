// Public portfolio supplied by the owner; independent of private ATS client data.
// Original client logo artwork is exported from the supplied profile.
export type PortfolioClient = {
  name: string;
  logo?: string;
  width?: number;
  height?: number;
  darkVariant?: "monochrome";
};

export const portfolioClients: PortfolioClient[] = [
  {
    name: "Noon",
    logo: "noon",
    width: 277,
    height: 116,
    darkVariant: "monochrome",
  },
  { name: "Brands For Less", logo: "brands-for-less", width: 635, height: 115 },
  { name: "Mumzworld", logo: "mumzworld", width: 1000, height: 176 },
  { name: "GMG (Gulf Marketing Group)", logo: "gmg", width: 287, height: 89 },
  { name: "Sterling Perfumes", logo: "sterling", width: 233, height: 118 },
  { name: "Radisson Blu", logo: "radisson-blu", width: 512, height: 155 },
  {
    name: "Habtoor Leighton Group (HLG)",
    logo: "hlg",
    width: 294,
    height: 122,
  },
  {
    name: "Larsen & Toubro",
    logo: "larsen-toubro",
    width: 245,
    height: 97,
    darkVariant: "monochrome",
  },
  {
    name: "Fibrex Construction Group",
    logo: "fibrex",
    width: 147,
    height: 35,
    darkVariant: "monochrome",
  },
  {
    name: "Pivot Engineering",
    logo: "pivot",
    width: 200,
    height: 48,
    darkVariant: "monochrome",
  },
  { name: "JSW Steel" },
  { name: "Al Hamad Group", logo: "al-hamad", width: 402, height: 96 },
  { name: "Al Faraa General Contracting" },
  {
    name: "Concrete Technology LLC",
    logo: "concrete-technology",
    width: 345,
    height: 111,
  },
  { name: "Delma Investment" },
  { name: "Saudi Binladin Group" },
  { name: "Gulf Precast Concrete" },
  { name: "Al Jaber Group", logo: "al-jaber", width: 280, height: 91 },
  {
    name: "Dubai Civil Engineering (DCE)",
    logo: "dce",
    width: 439,
    height: 184,
  },
  { name: "Citiscape" },
  { name: "Chirag Group" },
  {
    name: "Rotana Hotels",
    logo: "rotana",
    width: 250,
    height: 88,
    darkVariant: "monochrome",
  },
  { name: "China State Construction" },
  { name: "Khansaheb", logo: "khansaheb", width: 244, height: 94 },
  {
    name: "Wahat Siwa Landscape Works",
    logo: "wahat-siwa",
    width: 247,
    height: 88,
    darkVariant: "monochrome",
  },
];
