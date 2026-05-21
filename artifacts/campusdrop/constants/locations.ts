export interface CampusLocation {
  id: string;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
}

// ─── Halls of Residence ───────────────────────────────────────────────────────
const HALLS: CampusLocation[] = [
  {
    id: "h1",
    name: "Independence Hall (Indy)",
    subtitle: "Male Hall of Residence",
    latitude: 7.4152,
    longitude: 3.9011,
  },
  {
    id: "h2",
    name: "Kuti Hall",
    subtitle: "Female Hall of Residence",
    latitude: 7.4121,
    longitude: 3.9008,
  },
  {
    id: "h3",
    name: "Mellanby Hall",
    subtitle: "Female Hall of Residence",
    latitude: 7.4130,
    longitude: 3.9020,
  },
  {
    id: "h4",
    name: "Sultan Bello Hall",
    subtitle: "Male Hall of Residence",
    latitude: 7.4145,
    longitude: 3.9025,
  },
  {
    id: "h5",
    name: "Queen Elizabeth Hall (QEH)",
    subtitle: "Female Hall of Residence",
    latitude: 7.4108,
    longitude: 3.9015,
  },
  {
    id: "h6",
    name: "Idia Hall",
    subtitle: "Female Hall of Residence",
    latitude: 7.4116,
    longitude: 3.9005,
  },
  {
    id: "h7",
    name: "Awolowo Hall (Awo)",
    subtitle: "Male Hall of Residence",
    latitude: 7.4160,
    longitude: 3.9030,
  },
  {
    id: "h8",
    name: "AHOO",
    subtitle: "Hall of Residence",
    latitude: 7.4140,
    longitude: 3.9038,
  },
  {
    id: "h9",
    name: "Iyalode Hall",
    subtitle: "Female Hall of Residence",
    latitude: 7.4112,
    longitude: 3.9022,
  },
  {
    id: "h10",
    name: "CBN Hall",
    subtitle: "Hall of Residence",
    latitude: 7.4126,
    longitude: 3.9028,
  },
  {
    id: "h11",
    name: "Emmanuel Hall",
    subtitle: "Hall of Residence",
    latitude: 7.4136,
    longitude: 3.9018,
  },
];

// ─── Faculties ────────────────────────────────────────────────────────────────
const FACULTIES: CampusLocation[] = [
  {
    id: "f1",
    name: "Faculty of Science",
    subtitle: "Sciences Complex",
    latitude: 7.4205,
    longitude: 3.9055,
  },
  {
    id: "f2",
    name: "Faculty of Arts",
    subtitle: "Arts & Humanities Complex",
    latitude: 7.4196,
    longitude: 3.9048,
  },
  {
    id: "f3",
    name: "Faculty of Social Sciences",
    subtitle: "Social Sciences Block",
    latitude: 7.4188,
    longitude: 3.9042,
  },
  {
    id: "f4",
    name: "Faculty of Law",
    subtitle: "Law Complex",
    latitude: 7.4180,
    longitude: 3.9038,
  },
  {
    id: "f5",
    name: "College of Medicine (UCH)",
    subtitle: "Medical Sciences Complex",
    latitude: 7.4168,
    longitude: 3.9062,
  },
  {
    id: "f6",
    name: "Faculty of Education",
    subtitle: "Education Complex",
    latitude: 7.4176,
    longitude: 3.9045,
  },
  {
    id: "f7",
    name: "Faculty of Agriculture & Forestry",
    subtitle: "Agriculture Complex",
    latitude: 7.4155,
    longitude: 3.9068,
  },
  {
    id: "f8",
    name: "Faculty of Technology",
    subtitle: "Engineering & Technology Block",
    latitude: 7.4212,
    longitude: 3.9058,
  },
  {
    id: "f9",
    name: "Faculty of Pharmacy",
    subtitle: "Pharmaceutical Sciences Block",
    latitude: 7.4172,
    longitude: 3.9052,
  },
  {
    id: "f10",
    name: "Faculty of Veterinary Medicine",
    subtitle: "Vet Medicine Complex",
    latitude: 7.4148,
    longitude: 3.9070,
  },
  {
    id: "f11",
    name: "Faculty of Public Health",
    subtitle: "Public Health Complex",
    latitude: 7.4162,
    longitude: 3.9058,
  },
];

// ─── Key Campus Landmarks ─────────────────────────────────────────────────────
const LANDMARKS: CampusLocation[] = [
  {
    id: "l1",
    name: "UI Main Gate",
    subtitle: "University of Ibadan Main Entrance",
    latitude: 7.4055,
    longitude: 3.8949,
  },
  {
    id: "l2",
    name: "Kenneth Dike Library",
    subtitle: "University Main Library",
    latitude: 7.4200,
    longitude: 3.9042,
  },
  {
    id: "l3",
    name: "Trenchard Hall",
    subtitle: "Main Auditorium",
    latitude: 7.4192,
    longitude: 3.9040,
  },
  {
    id: "l4",
    name: "Sports Complex",
    subtitle: "Sports & Recreation Centre",
    latitude: 7.4232,
    longitude: 3.9072,
  },
  {
    id: "l5",
    name: "University Health Service (UHS)",
    subtitle: "Campus Medical Centre",
    latitude: 7.4175,
    longitude: 3.9035,
  },
  {
    id: "l6",
    name: "NISER",
    subtitle: "Nigerian Institute of Social & Economic Research",
    latitude: 7.4082,
    longitude: 3.9088,
  },
  {
    id: "l7",
    name: "UI Post Office",
    subtitle: "Campus Post Office",
    latitude: 7.4165,
    longitude: 3.9032,
  },
  {
    id: "l8",
    name: "UI Staff Club",
    subtitle: "Staff Recreation Club",
    latitude: 7.4220,
    longitude: 3.9060,
  },
];

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  ...HALLS,
  ...FACULTIES,
  ...LANDMARKS,
];

export const UI_REGION = {
  latitude: 7.4178,
  longitude: 3.9036,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

export const MOCK_DRIVERS = [
  { id: "d1", name: "Emeka Okafor", phone: "08031234567", plate: "ABC-123KY", rating: 4.9 },
  { id: "d2", name: "Tunde Adewale", phone: "08059876543", plate: "XYZ-456UI", rating: 4.7 },
  { id: "d3", name: "Biodun Fashola", phone: "08145678901", plate: "DEF-789KN", rating: 4.8 },
  { id: "d4", name: "Chidi Nwosu", phone: "08067891234", plate: "GHI-012LS", rating: 4.6 },
  { id: "d5", name: "Seun Bakare", phone: "08076543210", plate: "JKL-345OY", rating: 4.8 },
  { id: "d6", name: "Femi Adesanya", phone: "08023456789", plate: "MNO-678IB", rating: 4.7 },
];
