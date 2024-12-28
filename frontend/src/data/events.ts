export enum EventCategory {
  All = "All",
  WorkshopStudyGroup = "Workshop / Study Group",
  Hackathon = "Hackathon",
  SpeakerSessionTechTalk = "Speaker Session / Tech Talk",
  InfoSession = "Info session",
}
export interface Event {
  cropped_picture_url: string;
  description_short: string;
  event_type_title: EventCategory;
  start_date: string;
  title: string;
  url: string;
}

export const eventCategories = [
  EventCategory.All,
  EventCategory.WorkshopStudyGroup,
  EventCategory.Hackathon,
  EventCategory.SpeakerSessionTechTalk,
  EventCategory.InfoSession,
];
