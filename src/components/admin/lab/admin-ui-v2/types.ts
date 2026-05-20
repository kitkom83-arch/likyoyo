export type DeviceMode = "phone" | "desktop";
export type ButtonStyle = "icon-left" | "image-full" | "text-only" | "card-left-image" | "text-panel";
export type TextAlign = "left" | "center" | "right";
export type LockType = "none" | "code" | "age" | "sensitive";

export type MockPage = {
  route: string;
  title: string;
  status: "active" | "draft" | "mock";
  detail: string;
  headline: string;
  previewNote: string;
};

export type PageStatus = "Draft" | "Published" | "Scheduled";
export type PageVisibility = "Public" | "Hidden" | "Password protected";
export type PageLanguage = "Thai" | "English";
export type FormFieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "file URL";
export type SubmissionDestination =
  | "Mock inbox"
  | "Email notification mock"
  | "Google Sheets mock"
  | "Webhook mock";
export type AnalyticsTimeRange = "Today" | "7 days" | "30 days" | "90 days";

export type PageSettings = {
  pageTitle: string;
  publicHandle: string;
  slug: string;
  status: PageStatus;
  visibility: PageVisibility;
  language: PageLanguage;
  timezone: "Asia/Bangkok";
  seoTitle: string;
  seoDescription: string;
  socialTitle: string;
  socialDescription: string;
  socialImageUrl: string;
  noindex: boolean;
};

export type MockBlock = {
  id: string;
  label: string;
  state: "enabled" | "disabled";
  detail: string;
  previewTitle: string;
  previewBody: string;
  controls: string[];
};

export type MockLinkItem = {
  id: string;
  title: string;
  description: string;
  body: string;
  url: string;
  actionLabel: string;
  enabled: boolean;
  prioritized: boolean;
  openInNewTab: boolean;
  buttonStyle: ButtonStyle;
  textAlignment: TextAlign;
  imageUrl: string;
  backgroundImageUrl: string;
  schedulePublishDate: string;
  scheduleHideDate: string;
  lockType: LockType;
  totalClicks: number;
  sevenDayClicks: number;
  ctr: string;
};

export type MockFormTemplate = {
  id: string;
  title: string;
  description: string;
  destinationLabel: SubmissionDestination;
  enabled: boolean;
  privacyNote: string;
};

export type MockFormField = {
  id: string;
  label: string;
  placeholder: string;
  type: FormFieldType;
  required: boolean;
  enabled: boolean;
  helpText: string;
  options: string;
  validationHint: string;
};

export type MockSubmissionRouting = {
  destination: SubmissionDestination | "";
  mockInbox: boolean;
  emailNotification: boolean;
  googleSheets: boolean;
  webhook: boolean;
};

export type MockMetric = {
  label: string;
  value: string;
  detail: string;
  trend: string;
};

export type MockTopLinkAnalytics = {
  id: string;
  title: string;
  clicks: number;
  views: number;
  ctr: string;
  conversions: number;
  trend: string;
  insight: string;
};

export type MockFormAnalytics = {
  id: string;
  title: string;
  views: number;
  starts: number;
  submissions: number;
  completionRate: string;
  dropOffHint: string;
  destination: SubmissionDestination;
};

export type MockSplitItem = {
  label: string;
  value: number;
  detail: string;
};

export type MockFunnelStep = {
  label: string;
  value: number;
  percent: string;
};

export type MockAnalyticsRangeData = {
  metrics: MockMetric[];
  topLinks: MockTopLinkAnalytics[];
  forms: MockFormAnalytics[];
  trafficSources: MockSplitItem[];
  deviceSplit: MockSplitItem[];
  regionSplit: MockSplitItem[];
  funnel: MockFunnelStep[];
  miniChartLabels: string[];
  rangeInsight: string;
  insights: string[];
};

export type QaChecklistStatus = "Ready" | "Manual check" | "Mock only" | "Safety guard";

export type QaChecklistItem = {
  label: string;
  expectedBehavior: string;
  status: QaChecklistStatus;
  note?: string;
};

export type QaChecklistGroup = {
  title: string;
  items: QaChecklistItem[];
};

export type DesignSettings = {
  theme: string;
  buttonStyle: ButtonStyle;
  radius: string;
  textAlignment: TextAlign;
  imageSourceMode: string;
  border: string;
  shadow: string;
  spacing: string;
  density: string;
  imageUrl: string;
  backgroundImageUrl: string;
  aspectRatio: "3:1" | "2:1";
  overlayOpacity: number;
  textOverlay: boolean;
  fontWeight: string;
  title: string;
  description: string;
  body: string;
};

export type UpdateDesignSetting = <K extends keyof DesignSettings>(
  key: K,
  value: DesignSettings[K]
) => void;

export type UpdateSelectedLink = <K extends keyof MockLinkItem>(
  key: K,
  value: MockLinkItem[K]
) => void;

export type UpdatePageSetting = <K extends keyof PageSettings>(
  key: K,
  value: PageSettings[K]
) => void;

export type UpdateFormField = <K extends keyof MockFormField>(
  key: K,
  value: MockFormField[K]
) => void;

export type UpdateSubmissionRouting = <K extends keyof MockSubmissionRouting>(
  key: K,
  value: MockSubmissionRouting[K]
) => void;
