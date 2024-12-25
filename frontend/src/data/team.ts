export interface TeamMember {
  id: string;
  name: string;
  mainRole: string; 
  otherRoles: string[];
  imageUrl: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
  };
}

export const roleTypes = {
  CORE: "Core Team Member",
  LEAD: {
    GDG: "GDG Lead",
    TM: "TM Committee Lead",
    MKT: "MKT Committee Lead",
    EER: "EER Committee Lead",
    TECH: "Technical Committee Lead",
  },
  COMMITTEE: {
    TM: "TM Committee Member",
    MKT: "MKT Committee Member",
    EER: "EER Committee Member",
    TECH: "Technical Committee Member",
  },
  MENTOR: "Mentor",
} as const;

export const teamCategories = [
  roleTypes.CORE,
  roleTypes.LEAD.GDG,
  roleTypes.LEAD.TM,
  roleTypes.LEAD.MKT,
  roleTypes.LEAD.EER,
  roleTypes.LEAD.TECH,
  roleTypes.COMMITTEE.TM,
  roleTypes.COMMITTEE.MKT,
  roleTypes.COMMITTEE.EER,
  roleTypes.MENTOR,
];

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Maryem Juini",
    mainRole: roleTypes.LEAD.GDG,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/maryem-juini.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/maryem-juini/",
      github: "https://github.com/maryem-juini",
    },
  },
  {
    id: "2",
    name: "Tesnim Mansour",
    mainRole: roleTypes.LEAD.MKT,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/tesnim-mansour.png",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/tesnim-mansour-30223222a/",
      github: "https://github.com/Tesnimma",
    },
  },
  {
    id: "3",
    name: "Fahd Labba",
    mainRole: roleTypes.LEAD.TECH,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/fahd-labba.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/fahd-labba/",
      github: "https://github.com/Fahdlabba",
    },
  },
  {
    id: "4",
    name: "Meriem Souiai",
    mainRole: roleTypes.LEAD.TM,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/meriam-souiai.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/meriamsouiai/",
      github: "https://github.com/meriamsouai",
    },
  },
  {
    id: "5",
    name: "Nagham Zerrim",
    mainRole: roleTypes.LEAD.EER,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/nagham-zerrim.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/nagham-zerrim-867060272/",
      github: "https://github.com/NaghamZerrim",
    },
  },
  {
    id: "6",
    name: "Ahmed Dziri",
    mainRole: roleTypes.MENTOR,
    otherRoles: [roleTypes.CORE, roleTypes.COMMITTEE.MKT],
    imageUrl: "/team/ahmed-dziri.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/ahmed-dziri-14bb24213/",
      github: "https://github.com/DziriAhmeed/DziriAhmeed",
    },
  },
  {
    id: "7",
    name: "Wajdi Zakhama",
    mainRole: roleTypes.MENTOR,
    otherRoles: [roleTypes.CORE, roleTypes.COMMITTEE.TM],
    imageUrl: "/team/wajdi-zakhama.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/wajdi-zakhama-2b13b0242/",
      github: "https://github.com/WAJDA9",
    },
  },
  {
    id: "8",
    name: "Ahmed Gharbi",
    mainRole: roleTypes.MENTOR,
    otherRoles: [roleTypes.CORE, roleTypes.COMMITTEE.EER],
    imageUrl: "/team/ahmed-gharbi.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/ahmedgharbi/",
      github: "https://github.com/MrGharbiii",
    },
  },
  {
    id: "9",
    name: "Eya larbi",
    mainRole: roleTypes.MENTOR,
    otherRoles: [roleTypes.CORE, roleTypes.COMMITTEE.MKT],
    imageUrl: "/team/eya-larbi.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/aymen-ben-othman-3b3b3b1b2/",
      github: "",
    },
  },
  {
    id: "10",
    name: "Eya Bokri",
    mainRole: roleTypes.MENTOR,
    otherRoles: [roleTypes.CORE, roleTypes.COMMITTEE.EER],
    imageUrl: "/team/eya-bokri.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/eya-bokri-9492b1210/",
      github: "https://github.com/bokrieya",
    },
  },
  {
    id: "11",
    name: "Farah abdelhedi",
    mainRole: roleTypes.MENTOR,
    otherRoles: [roleTypes.CORE, roleTypes.COMMITTEE.TM],
    imageUrl: "/team/farah-abdelhedi.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/farah-abdelhedi/",
      github: "https://github.com/abh22",
    },
  },
  {
    id: "12",
    name: "Minyar Meksi",
    mainRole: roleTypes.MENTOR,
    otherRoles: [roleTypes.CORE, roleTypes.COMMITTEE.MKT],
    imageUrl: "/team/minyar-meksi.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/minyar-meksi/",
      github: "",
    },
  },
  {
    id: "13",
    name: "Aziz Bouali",
    mainRole: roleTypes.MENTOR,
    otherRoles: [roleTypes.CORE, roleTypes.COMMITTEE.TM],
    imageUrl: "/team/aziz-bouali.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/aziz-bouali/",
      github: "https://github.com/saaya-code",
    },
  },
  {
    id: "14",
    name: "Meryem Maatallah",
    mainRole: roleTypes.MENTOR,
    otherRoles: [roleTypes.CORE, roleTypes.COMMITTEE.TM],
    imageUrl: "/team/meryem-maatallah.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/meryem-maatallah/",
      github: "https://github.com/meryoumahh",
    },
  },
  {
    id: "15",
    name: "Farah albouchi",
    mainRole: roleTypes.COMMITTEE.TM,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/farah-albouchi.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/farah-albouchi/",
      github: "https://github.com/Farah-albouchi",
    },
  },
  {
    id: "16",
    name: "Ons El Maleh",
    mainRole: roleTypes.COMMITTEE.TM,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/ons-elmaleh.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/ons-el-maleh-648531300/",
      github: "https://github.com/Ons-mlh",
    },
  },
  {
    id: "17",
    name: "Daly Chouikh",
    mainRole: roleTypes.COMMITTEE.TM,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/daly-chouikh.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/mohamedali-chouikh/",
      github: "https://github.com/DalyChouikh",
    },
  },
  {
    id: "18",
    name: "Fehmi Hamdi",
    mainRole: roleTypes.COMMITTEE.EER,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/fehmi-hamdi.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/fehmi-hamdi-4b67a02ba/",
      github: "",
    },
  },
  {
    id: "19",
    name: "Younes Chouikh",
    mainRole: roleTypes.COMMITTEE.TM,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/younes-chouikh.png",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/younes-chouikh/",
      github: "https://github.com/Younes-ch",
    },
  },
  {
    id: "20",
    name: "Yomna Jaafar",
    mainRole: roleTypes.COMMITTEE.MKT,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/yomna-jaafar.png",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/aya-ben-othman-3b3b3b1b2/",
      github: "https://github.com/ymnacodes",
    },
  },
  {
    id: "21",
    name: "Souha Abdallah",
    mainRole: roleTypes.COMMITTEE.MKT,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/souha-abdallah.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/souha-abdallah-337180299/",
      github: "https://github.com/ahuos09",
    },
  },
  {
    id: "22",
    name: "Eya Gaddour",
    mainRole: roleTypes.COMMITTEE.TM,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/placeholder-avatar-girl.png",
    socialLinks: {
      linkedin: "",
      github: "",
    },
  },
  {
    id: "23",
    name: "Ayoub Smaeen",
    mainRole: roleTypes.COMMITTEE.EER,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/ayoub-smaeen.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/ayoub-smaeen-505133330/",
      github: "https://github.com/ayoubbenismain",
    },
  },
  {
    id: "24",
    name: "Raja Barhoumi",
    mainRole: roleTypes.COMMITTEE.EER,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/raja-barhoumi.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/raja-barhoumi/",
      github: "https://github.com/RajaBarhoumi",
    },
  },
  {
    id: "25",
    name: "Aymen Sedki",
    mainRole: roleTypes.COMMITTEE.TM,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/aymen-sedki.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/aymen-sedki-79ba1820b/",
      github: "https://github.com/sedky02",
    },
  },
  {
    id: "26",
    name: "Nesrine Jouini",
    mainRole: roleTypes.COMMITTEE.MKT,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/placeholder-avatar-girl.png",
    socialLinks: {
      linkedin: "",
      github: "",
    },
  },
  {
    id: "27",
    name: "Sarra Ben Hamad",
    mainRole: roleTypes.COMMITTEE.MKT,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/sarra-ben-hamad.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/sarra-ben-hamad/",
      github: "https://github.com/SarraBenHamad",
    },
  },
  {
    id: "28",
    name: "Mohamed Aziz Krifa",
    mainRole: roleTypes.COMMITTEE.MKT,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/mohamed-aziz-krifa.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/krifa-mohamed-aziz-87bb02295/",
      github: "https://github.com/krifa-med-aziz",
    },
  },
  {
    id: "29",
    name: "Faidy Rhaiem",
    mainRole: roleTypes.COMMITTEE.MKT,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/faidy-rhaiem.png",
    socialLinks: {
      linkedin: "",
      github: "",
    },
  },
  {
    id: "30",
    name: "Ajmi Mrad",
    mainRole: roleTypes.COMMITTEE.EER,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/ajmi-mrad.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/ajmi-mrad-142a5621b/",
      github: "https://github.com/Ajmi-mrad",
    },
  },
  {
    id: "31",
    name: "Eya Zakhama",
    mainRole: roleTypes.COMMITTEE.MKT,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/eya-zakhama.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/eya-zakhama-232824285/",
      github: "https://github.com/eya-zakhama",
    },
  },
  {
    id: "32",
    name: "Fatima Ezzahra Bounkhilat",
    mainRole: roleTypes.COMMITTEE.TM,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/fatima-bounkhilat.jpg",
    socialLinks: {
      linkedin:
        "https://www.linkedin.com/in/fatima-ezzahraa-bounkhilat-6b80a3276/",
      github: "https://github.com/Bounkhilatfati",
    },
  },
  {
    id: "33",
    name: "Ahmed Amine Doudech",
    mainRole: roleTypes.COMMITTEE.MKT,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/ahmed-amine-doudech.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/ahmedaminedoudech/",
      github: "https://github.com/JustPowerful",
    },
  },
  {
    id: "34",
    name: "Baha Eddine Aoua",
    mainRole: roleTypes.COMMITTEE.MKT,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/baha-eddine-aoua.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/baha-eddine-aoua-598687244/",
      github: "https://github.com/baha-aoua",
    },
  },
  {
    id: "35",
    name: "Cyrine Lechiheb",
    mainRole: roleTypes.MENTOR,
    otherRoles: [roleTypes.CORE, roleTypes.COMMITTEE.EER],
    imageUrl: "/team/cyrine-lechiheb.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/cyrine-lechiheb-299ba8203/",
      github: "",
    },
  },
  {
    id: "36",
    name: "Louey Belkahla",
    mainRole: roleTypes.COMMITTEE.TM,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/louey-belkahla.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/belkahla/",
      github: "https://github.com/7louu",
    },
  },
  {
    id: "37",
    name: "Ons Saidi",
    mainRole: roleTypes.COMMITTEE.EER,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/ons-saidi.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/saidi-ons-04632b235/",
      github: "",
    },
  },
  {
    id: "38",
    name: "Ayatallah Trabelsi",
    mainRole: roleTypes.COMMITTEE.TM,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/ayatallah-trabelsi.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/ayatallah-trabelsi/",
      github: "https://github.com/Ayatallah-Trabelsi",
    },
  },
  {
    id: "39",
    name: "Yasmine Ghali",
    mainRole: roleTypes.COMMITTEE.MKT,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/yasmine-ghali.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/yasmine-ghali-/",
      github: "https://github.com/yasmineghali",
    },
  },
  {
    id: "40",
    name: "Mohamed Rayen Boukottaya",
    mainRole: roleTypes.COMMITTEE.EER,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/rayen-boukottaya.jpg",
    socialLinks: {
      linkedin: "",
      github: "",
    },
  },
  {
    id: "41",
    name: "Aziz Souiai",
    mainRole: roleTypes.COMMITTEE.TM,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/aziz-souiai.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/azizsouiai/",
      github: "",
    },
  },
  {
    id: "42",
    name: "Nour Gaboussa",
    mainRole: roleTypes.COMMITTEE.TM,
    otherRoles: [roleTypes.CORE],
    imageUrl: "/team/nour-gaboussa.jpg",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/nour-gaboussa/",
      github: "https://github.com/nour-gab",
    },
  },
];
