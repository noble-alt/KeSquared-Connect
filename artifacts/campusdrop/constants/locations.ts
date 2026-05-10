export interface CampusLocation {
  id: string;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
}

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  { id: "1", name: "UI Main Gate", subtitle: "University of Ibadan Main Entrance", latitude: 7.3775, longitude: 3.9470 },
  { id: "2", name: "Nnamdi Azikiwe Hall", subtitle: "Hall of Residence", latitude: 7.3784, longitude: 3.9478 },
  { id: "3", name: "Queen Idia Hall", subtitle: "Female Hall of Residence", latitude: 7.3770, longitude: 3.9465 },
  { id: "4", name: "Independence Hall", subtitle: "Hall of Residence", latitude: 7.3792, longitude: 3.9484 },
  { id: "5", name: "Alexander Brown Hall", subtitle: "Hall of Residence", latitude: 7.3768, longitude: 3.9472 },
  { id: "6", name: "Trenchard Hall", subtitle: "Lecture Hall", latitude: 7.3780, longitude: 3.9466 },
  { id: "7", name: "Faculty of Science", subtitle: "Sciences Block", latitude: 7.3788, longitude: 3.9476 },
  { id: "8", name: "Faculty of Arts", subtitle: "Arts & Humanities Block", latitude: 7.3783, longitude: 3.9480 },
  { id: "9", name: "Sports Complex", subtitle: "Sports & Recreation", latitude: 7.3760, longitude: 3.9460 },
  { id: "10", name: "University Health Service", subtitle: "UHS Medical Centre", latitude: 7.3773, longitude: 3.9474 },
  { id: "11", name: "Faculty of Law", subtitle: "Law Block", latitude: 7.3785, longitude: 3.9462 },
  { id: "12", name: "NISER", subtitle: "Nigerian Institute of Social & Economic Research", latitude: 7.3755, longitude: 3.9455 },
  { id: "13", name: "Faculty of Social Sciences", subtitle: "Social Sciences Block", latitude: 7.3779, longitude: 3.9469 },
  { id: "14", name: "Kenneth Dike Library", subtitle: "University Library", latitude: 7.3777, longitude: 3.9475 },
];

export const UI_REGION = {
  latitude: 7.3775,
  longitude: 3.9470,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export const MOCK_DRIVERS = [
  { id: "d1", name: "Emeka Okafor", phone: "08031234567", plate: "ABC-123KY", rating: 4.9 },
  { id: "d2", name: "Tunde Adewale", phone: "08059876543", plate: "XYZ-456UI", rating: 4.7 },
  { id: "d3", name: "Biodun Fashola", phone: "08145678901", plate: "DEF-789KN", rating: 4.8 },
  { id: "d4", name: "Chidi Nwosu", phone: "08067891234", plate: "GHI-012LS", rating: 4.6 },
];
