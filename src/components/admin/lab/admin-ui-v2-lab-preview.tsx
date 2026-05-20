"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Blocks,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  ExternalLink,
  FileText,
  FormInput,
  Globe2,
  ImageIcon,
  LockKeyhole,
  Monitor,
  MousePointerClick,
  Palette,
  PanelRight,
  Save,
  Settings,
  ShieldCheck,
  ShieldOff,
  Share2,
  Smartphone,
  Star,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DeviceMode = "phone" | "desktop";
type ButtonStyle = "icon-left" | "image-full" | "text-only" | "card-left-image" | "text-panel";
type TextAlign = "left" | "center" | "right";
type LockType = "none" | "code" | "age" | "sensitive";

type MockPage = {
  route: string;
  title: string;
  status: "active" | "draft" | "mock";
  detail: string;
  headline: string;
  previewNote: string;
};

type PageStatus = "Draft" | "Published" | "Scheduled";
type PageVisibility = "Public" | "Hidden" | "Password protected";
type PageLanguage = "Thai" | "English";
type FormFieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "file URL";
type SubmissionDestination =
  | "Mock inbox"
  | "Email notification mock"
  | "Google Sheets mock"
  | "Webhook mock";
type AnalyticsTimeRange = "Today" | "7 days" | "30 days" | "90 days";

type PageSettings = {
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

type MockBlock = {
  id: string;
  label: string;
  state: "enabled" | "disabled";
  detail: string;
  previewTitle: string;
  previewBody: string;
  controls: string[];
};

type MockLinkItem = {
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

type MockFormTemplate = {
  id: string;
  title: string;
  description: string;
  destinationLabel: SubmissionDestination;
  enabled: boolean;
  privacyNote: string;
};

type MockFormField = {
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

type MockSubmissionRouting = {
  destination: SubmissionDestination | "";
  mockInbox: boolean;
  emailNotification: boolean;
  googleSheets: boolean;
  webhook: boolean;
};

type MockMetric = {
  label: string;
  value: string;
  detail: string;
  trend: string;
};

type MockTopLinkAnalytics = {
  id: string;
  title: string;
  clicks: number;
  views: number;
  ctr: string;
  conversions: number;
  trend: string;
  insight: string;
};

type MockFormAnalytics = {
  id: string;
  title: string;
  views: number;
  starts: number;
  submissions: number;
  completionRate: string;
  dropOffHint: string;
  destination: SubmissionDestination;
};

type MockSplitItem = {
  label: string;
  value: number;
  detail: string;
};

type MockFunnelStep = {
  label: string;
  value: number;
  percent: string;
};

type MockAnalyticsRangeData = {
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

type DesignSettings = {
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

type UpdateDesignSetting = <K extends keyof DesignSettings>(
  key: K,
  value: DesignSettings[K]
) => void;

type UpdateSelectedLink = <K extends keyof MockLinkItem>(
  key: K,
  value: MockLinkItem[K]
) => void;

type UpdatePageSetting = <K extends keyof PageSettings>(
  key: K,
  value: PageSettings[K]
) => void;

type UpdateFormField = <K extends keyof MockFormField>(
  key: K,
  value: MockFormField[K]
) => void;

type UpdateSubmissionRouting = <K extends keyof MockSubmissionRouting>(
  key: K,
  value: MockSubmissionRouting[K]
) => void;

const adminNavItems = [
  { label: "Pages", icon: FileText, active: true },
  { label: "Blocks", icon: Blocks, active: false },
  { label: "Design", icon: Palette, active: false },
  { label: "Forms", icon: FormInput, active: false },
  { label: "Analytics", icon: BarChart3, active: false },
  { label: "Settings", icon: Settings, active: false },
];

const mockPages: MockPage[] = [
  {
    route: "/bn9/main",
    title: "Main landing",
    status: "active",
    detail: "Hero, offers, contact",
    headline: "Northfield Studio main experience",
    previewNote: "Primary public landing concept with hero and high-intent CTAs.",
  },
  {
    route: "/bn9/promo",
    title: "Promo page",
    status: "draft",
    detail: "Seasonal campaign",
    headline: "Limited campaign page",
    previewNote: "Focused promo flow with image-forward offers and urgency blocks.",
  },
  {
    route: "/bn9/support",
    title: "Support page",
    status: "mock",
    detail: "Static support concept",
    headline: "Support request hub",
    previewNote: "Mock support layout only; no deposit, withdraw, or ticket routes.",
  },
];

const initialPageSettingsByRoute: Record<string, PageSettings> = {
  "/bn9/main": {
    pageTitle: "Northfield Studio main experience",
    publicHandle: "bn9",
    slug: "main",
    status: "Published",
    visibility: "Public",
    language: "English",
    timezone: "Asia/Bangkok",
    seoTitle: "Northfield Studio | Main Links",
    seoDescription:
      "Book consultations, view VIP menu, and open current support links from the BN9 main page.",
    socialTitle: "Northfield Studio main links",
    socialDescription: "Fast access to consultation, VIP offers, and support resources.",
    socialImageUrl: "https://support.bn9.one/mock-share/main.jpg",
    noindex: false,
  },
  "/bn9/promo": {
    pageTitle: "Limited campaign page",
    publicHandle: "bn9",
    slug: "promo",
    status: "Draft",
    visibility: "Hidden",
    language: "Thai",
    timezone: "Asia/Bangkok",
    seoTitle: "BN9 Promo | Limited Campaign",
    seoDescription:
      "A draft campaign page preview for limited offers, visual-only urgency blocks, and seasonal CTAs.",
    socialTitle: "Limited campaign preview",
    socialDescription: "Preview the mock promo flow before any real route or publishing exists.",
    socialImageUrl: "https://support.bn9.one/mock-share/promo.jpg",
    noindex: true,
  },
  "/bn9/support": {
    pageTitle: "Support request hub",
    publicHandle: "bn9",
    slug: "support",
    status: "Scheduled",
    visibility: "Password protected",
    language: "English",
    timezone: "Asia/Bangkok",
    seoTitle: "BN9 Support Hub",
    seoDescription:
      "Visual-only support hub preview with safe mock status, locked access styling, and no ticket routes.",
    socialTitle: "Support request hub",
    socialDescription: "A protected mock support preview for future account and help actions.",
    socialImageUrl: "",
    noindex: true,
  },
};

const mockBlocks: MockBlock[] = [
  {
    id: "hero",
    label: "Hero Header",
    state: "enabled",
    detail: "Brand intro and avatar",
    previewTitle: "Hero Header",
    previewBody: "Brand avatar, page headline, short intro, and primary action area.",
    controls: ["Avatar style", "Headline size", "Hero media", "Intro alignment"],
  },
  {
    id: "buttons",
    label: "Button Group",
    state: "enabled",
    detail: "Primary links and CTAs",
    previewTitle: "Button Group",
    previewBody: "Stacked action buttons with icon, image, and text variants.",
    controls: ["Button density", "Icon placement", "Priority order", "Corner radius"],
  },
  {
    id: "form",
    label: "Form Block",
    state: "disabled",
    detail: "No endpoint wiring",
    previewTitle: "Form Block",
    previewBody: "Static form layout preview without submissions or API calls.",
    controls: ["Field spacing", "Required labels", "Submit copy", "Success state"],
  },
  {
    id: "embed",
    label: "Embed Post",
    state: "enabled",
    detail: "Static content preview",
    previewTitle: "Embed Post",
    previewBody: "Rich content slot for visual posts, announcements, or video embeds.",
    controls: ["Aspect ratio", "Caption style", "Media frame", "Content source"],
  },
  {
    id: "analytics",
    label: "Analytics Card",
    state: "disabled",
    detail: "Mock metrics only",
    previewTitle: "Analytics Card",
    previewBody: "Future private insight card with sample views, clicks, and CTR.",
    controls: ["Metric set", "Chart style", "Date range", "Privacy mode"],
  },
];

const initialMockLinks: MockLinkItem[] = [
  {
    id: "book-consultation",
    title: "Book a Consultation",
    description: "Fast path for high-intent visitors who want a guided setup call.",
    body: "Choose a time with the studio team.\nConfirmation details stay in this mock only.",
    url: "https://support.bn9.one/consultation",
    actionLabel: "Open booking mock",
    enabled: true,
    prioritized: true,
    openInNewTab: true,
    buttonStyle: "icon-left",
    textAlignment: "left",
    imageUrl: "https://images.example/mock-consultation-icon.png",
    backgroundImageUrl: "https://images.example/mock-consultation-cover.jpg",
    schedulePublishDate: "2026-05-20",
    scheduleHideDate: "",
    lockType: "none",
    totalClicks: 1284,
    sevenDayClicks: 132,
    ctr: "12.4%",
  },
  {
    id: "vip-menu",
    title: "VIP Menu",
    description: "Image-forward menu concept for premium offers and private options.",
    body: "VIP members can scan current packages.\nThis is visual-only menu copy.",
    url: "https://support.bn9.one/vip",
    actionLabel: "Open VIP menu mock",
    enabled: true,
    prioritized: false,
    openInNewTab: false,
    buttonStyle: "image-full",
    textAlignment: "center",
    imageUrl: "https://images.example/mock-vip-icon.png",
    backgroundImageUrl: "https://images.example/mock-vip-cover.jpg",
    schedulePublishDate: "2026-05-22",
    scheduleHideDate: "",
    lockType: "age",
    totalClicks: 942,
    sevenDayClicks: 88,
    ctr: "10.1%",
  },
  {
    id: "support-request",
    title: "Support Request",
    description: "Private support flow concept with code-gated access.",
    body: "Describe the support need.\nA future version can route this into a real queue.",
    url: "support-request",
    actionLabel: "Open support mock",
    enabled: true,
    prioritized: false,
    openInNewTab: false,
    buttonStyle: "card-left-image",
    textAlignment: "left",
    imageUrl: "https://images.example/mock-support-icon.png",
    backgroundImageUrl: "https://images.example/mock-support-cover.jpg",
    schedulePublishDate: "2026-05-19",
    scheduleHideDate: "",
    lockType: "code",
    totalClicks: 603,
    sevenDayClicks: 47,
    ctr: "8.7%",
  },
  {
    id: "promo-banner",
    title: "Promo Banner",
    description: "Disabled banner draft with an intentionally empty URL state.",
    body: "Promo copy can sit here before a campaign URL exists.",
    url: "",
    actionLabel: "No URL set",
    enabled: false,
    prioritized: false,
    openInNewTab: false,
    buttonStyle: "text-only",
    textAlignment: "center",
    imageUrl: "https://images.example/mock-promo-icon.png",
    backgroundImageUrl: "https://images.example/mock-promo-cover.jpg",
    schedulePublishDate: "2026-05-10",
    scheduleHideDate: "2026-05-18",
    lockType: "none",
    totalClicks: 217,
    sevenDayClicks: 0,
    ctr: "0.0%",
  },
  {
    id: "announcement-panel",
    title: "Announcement Panel",
    description: "Long-form panel for updates that need multiple lines of context.",
    body: "Line one: service hours update.\nLine two: support response windows.\nLine three: follow the latest notice.",
    url: "https://support.bn9.one/announcements",
    actionLabel: "Read announcement mock",
    enabled: true,
    prioritized: false,
    openInNewTab: true,
    buttonStyle: "text-panel",
    textAlignment: "left",
    imageUrl: "https://images.example/mock-announcement-icon.png",
    backgroundImageUrl: "https://images.example/mock-announcement-cover.jpg",
    schedulePublishDate: "2026-05-21",
    scheduleHideDate: "",
    lockType: "sensitive",
    totalClicks: 451,
    sevenDayClicks: 71,
    ctr: "9.8%",
  },
];

const mockFormTemplates: MockFormTemplate[] = [
  {
    id: "contact-form",
    title: "Contact Form",
    description: "General visitor message capture with name, email, and topic fields.",
    destinationLabel: "Mock inbox",
    enabled: true,
    privacyNote: "Visitor details stay inside this local lab preview.",
  },
  {
    id: "booking-form",
    title: "Booking Form",
    description: "Appointment request concept with date, phone, and preferred service.",
    destinationLabel: "Email notification mock",
    enabled: true,
    privacyNote: "Booking requests are visual-only and do not reserve time.",
  },
  {
    id: "support-form",
    title: "Support Form",
    description: "Safe support intake mock without deposit, withdraw, ticket, or API wiring.",
    destinationLabel: "Mock inbox",
    enabled: false,
    privacyNote: "No support request is sent from this lab form.",
  },
  {
    id: "lead-form",
    title: "Lead Form",
    description: "Lightweight lead qualification flow for campaigns and follow-up.",
    destinationLabel: "Google Sheets mock",
    enabled: true,
    privacyNote: "Sheet destination is a label only; no spreadsheet is contacted.",
  },
  {
    id: "custom-form",
    title: "Custom Form",
    description: "Flexible scratch form for future page-specific field combinations.",
    destinationLabel: "Webhook mock",
    enabled: true,
    privacyNote: "Webhook destination is visual-only and never called.",
  },
];

const initialMockFormFieldsByForm: Record<string, MockFormField[]> = {
  "contact-form": [
    {
      id: "contact-name",
      label: "Name",
      placeholder: "Your name",
      type: "text",
      required: true,
      enabled: true,
      helpText: "Use a display name visitors recognize.",
      options: "",
      validationHint: "Name should not be empty.",
    },
    {
      id: "contact-email",
      label: "Email",
      placeholder: "you@example.com",
      type: "email",
      required: true,
      enabled: true,
      helpText: "Reply address for a future inbox workflow.",
      options: "",
      validationHint: "Must look like an email address.",
    },
    {
      id: "contact-topic",
      label: "Topic",
      placeholder: "Choose a topic",
      type: "select",
      required: false,
      enabled: true,
      helpText: "Options are mock-only.",
      options: "Consultation\nPartnership\nSupport",
      validationHint: "Optional select field.",
    },
    {
      id: "contact-message",
      label: "Message",
      placeholder: "How can we help?",
      type: "textarea",
      required: true,
      enabled: true,
      helpText: "Long text preview only.",
      options: "",
      validationHint: "Message should include context.",
    },
  ],
  "booking-form": [
    {
      id: "booking-name",
      label: "Full name",
      placeholder: "Customer name",
      type: "text",
      required: true,
      enabled: true,
      helpText: "Shown in the mock booking card.",
      options: "",
      validationHint: "Required booking name.",
    },
    {
      id: "booking-phone",
      label: "Phone",
      placeholder: "Preferred phone number",
      type: "phone",
      required: true,
      enabled: true,
      helpText: "No SMS or call is triggered.",
      options: "",
      validationHint: "Phone format hint only.",
    },
    {
      id: "booking-date",
      label: "Preferred date",
      placeholder: "Select a date",
      type: "date",
      required: false,
      enabled: true,
      helpText: "Calendar is visual-only.",
      options: "",
      validationHint: "Date should be in the future.",
    },
    {
      id: "booking-service",
      label: "Service",
      placeholder: "Choose service",
      type: "radio",
      required: true,
      enabled: true,
      helpText: "Radio options stay local.",
      options: "Consultation\nVIP setup\nSupport session",
      validationHint: "One mock service should be selected.",
    },
  ],
  "support-form": [
    {
      id: "support-email",
      label: "Account email",
      placeholder: "account@example.com",
      type: "email",
      required: true,
      enabled: true,
      helpText: "No support account lookup is performed.",
      options: "",
      validationHint: "Email hint only.",
    },
    {
      id: "support-category",
      label: "Support category",
      placeholder: "Choose a category",
      type: "select",
      required: true,
      enabled: true,
      helpText: "No deposit or withdraw routes are connected.",
      options: "Account\nPage access\nGeneral question",
      validationHint: "Category is required in the mock.",
    },
    {
      id: "support-attachment",
      label: "Attachment link",
      placeholder: "https://example.com/file",
      type: "file URL",
      required: false,
      enabled: true,
      helpText: "Paste a URL only; no upload is performed.",
      options: "",
      validationHint: "File URL helper only.",
    },
  ],
  "lead-form": [
    {
      id: "lead-name",
      label: "Lead name",
      placeholder: "Name",
      type: "text",
      required: true,
      enabled: true,
      helpText: "Used in the fake submission preview.",
      options: "",
      validationHint: "Lead name should be present.",
    },
    {
      id: "lead-email",
      label: "Lead email",
      placeholder: "lead@example.com",
      type: "email",
      required: true,
      enabled: true,
      helpText: "No email service is contacted.",
      options: "",
      validationHint: "Email hint only.",
    },
    {
      id: "lead-interest",
      label: "Interest level",
      placeholder: "Select interest",
      type: "checkbox",
      required: false,
      enabled: true,
      helpText: "Checkbox options are local text.",
      options: "Pricing\nDemo\nSupport",
      validationHint: "Optional choices.",
    },
  ],
  "custom-form": [
    {
      id: "custom-empty-label",
      label: "",
      placeholder: "Untitled field",
      type: "text",
      required: true,
      enabled: true,
      helpText: "Intentional empty label to show validation hint.",
      options: "",
      validationHint: "empty field label",
    },
    {
      id: "custom-notes",
      label: "Notes",
      placeholder: "Custom notes",
      type: "textarea",
      required: false,
      enabled: true,
      helpText: "Scratch textarea for the prototype.",
      options: "",
      validationHint: "Optional notes.",
    },
  ],
};

const initialMockSubmissionRoutingByForm: Record<string, MockSubmissionRouting> = {
  "contact-form": {
    destination: "Mock inbox",
    mockInbox: true,
    emailNotification: false,
    googleSheets: false,
    webhook: false,
  },
  "booking-form": {
    destination: "Email notification mock",
    mockInbox: true,
    emailNotification: true,
    googleSheets: false,
    webhook: false,
  },
  "support-form": {
    destination: "Mock inbox",
    mockInbox: true,
    emailNotification: false,
    googleSheets: false,
    webhook: false,
  },
  "lead-form": {
    destination: "Google Sheets mock",
    mockInbox: true,
    emailNotification: false,
    googleSheets: true,
    webhook: false,
  },
  "custom-form": {
    destination: "Webhook mock",
    mockInbox: false,
    emailNotification: false,
    googleSheets: false,
    webhook: true,
  },
};

const mockAnalyticsByRange: Record<AnalyticsTimeRange, MockAnalyticsRangeData> = {
  Today: {
    metrics: [
      { label: "Total views", value: "1,284", detail: "Mock page views", trend: "+8%" },
      { label: "Link clicks", value: "312", detail: "Local click sample", trend: "+4%" },
      { label: "Click-through rate", value: "24.3%", detail: "Clicks / views", trend: "+1.2%" },
      { label: "Form submissions", value: "38", detail: "Fake submissions", trend: "+6" },
      { label: "Conversion rate", value: "3.0%", detail: "Completed action", trend: "+0.4%" },
      { label: "Top performing link", value: "VIP Menu", detail: "Highest CTR today", trend: "hot" },
      { label: "Top traffic source", value: "Instagram", detail: "Largest source", trend: "+11%" },
      { label: "Device split", value: "72% mobile", detail: "Mobile-heavy traffic", trend: "stable" },
    ],
    topLinks: [
      {
        id: "book-consultation",
        title: "Book a Consultation",
        clicks: 92,
        views: 365,
        ctr: "25.2%",
        conversions: 15,
        trend: "+6%",
        insight: "Consultation clicks are strongest after profile visits today.",
      },
      {
        id: "vip-menu",
        title: "VIP Menu",
        clicks: 104,
        views: 318,
        ctr: "32.7%",
        conversions: 12,
        trend: "+14%",
        insight: "VIP Menu has the highest CTR today.",
      },
      {
        id: "support-request",
        title: "Support Request",
        clicks: 48,
        views: 224,
        ctr: "21.4%",
        conversions: 7,
        trend: "+2%",
        insight: "Support Request gets most traffic from mobile.",
      },
      {
        id: "promo-banner",
        title: "Promo Banner",
        clicks: 21,
        views: 180,
        ctr: "11.7%",
        conversions: 2,
        trend: "-5%",
        insight: "Promo Banner dropped this range.",
      },
      {
        id: "announcement-panel",
        title: "Announcement Panel",
        clicks: 47,
        views: 197,
        ctr: "23.9%",
        conversions: 2,
        trend: "+3%",
        insight: "Announcement Panel holds steady as a secondary action.",
      },
    ],
    forms: [
      {
        id: "contact-form",
        title: "Contact Form",
        views: 156,
        starts: 62,
        submissions: 24,
        completionRate: "38.7%",
        dropOffHint: "Message field causes most exits",
        destination: "Mock inbox",
      },
      {
        id: "booking-form",
        title: "Booking Form",
        views: 121,
        starts: 58,
        submissions: 31,
        completionRate: "53.4%",
        dropOffHint: "Date selection is the soft drop-off",
        destination: "Email notification mock",
      },
      {
        id: "support-form",
        title: "Support Form",
        views: 94,
        starts: 34,
        submissions: 12,
        completionRate: "35.3%",
        dropOffHint: "Attachment URL is often skipped",
        destination: "Mock inbox",
      },
      {
        id: "lead-form",
        title: "Lead Form",
        views: 83,
        starts: 29,
        submissions: 17,
        completionRate: "58.6%",
        dropOffHint: "Low drop-off after email",
        destination: "Google Sheets mock",
      },
      {
        id: "custom-form",
        title: "Custom Form",
        views: 44,
        starts: 11,
        submissions: 5,
        completionRate: "45.5%",
        dropOffHint: "Untitled field needs cleanup",
        destination: "Webhook mock",
      },
    ],
    trafficSources: [
      { label: "Direct", value: 18, detail: "231 views" },
      { label: "Instagram", value: 34, detail: "437 views" },
      { label: "Facebook", value: 13, detail: "167 views" },
      { label: "TikTok", value: 16, detail: "205 views" },
      { label: "X", value: 4, detail: "51 views" },
      { label: "Search", value: 9, detail: "116 views" },
      { label: "QR Code", value: 6, detail: "77 views" },
    ],
    deviceSplit: [
      { label: "Mobile", value: 72, detail: "924 views" },
      { label: "Desktop", value: 21, detail: "270 views" },
      { label: "Tablet", value: 7, detail: "90 views" },
    ],
    regionSplit: [
      { label: "Thailand", value: 64, detail: "822 views" },
      { label: "Singapore", value: 12, detail: "154 views" },
      { label: "United States", value: 9, detail: "116 views" },
      { label: "Other", value: 15, detail: "192 views" },
    ],
    funnel: [
      { label: "Page view", value: 1284, percent: "100%" },
      { label: "Link click", value: 312, percent: "24%" },
      { label: "Form start", value: 194, percent: "15%" },
      { label: "Form submit", value: 38, percent: "3%" },
      { label: "Completed action", value: 24, percent: "2%" },
    ],
    miniChartLabels: ["09:00", "12:00", "15:00", "18:00"],
    rangeInsight: "Today is mobile-heavy, with VIP Menu leading short-session clicks.",
    insights: [
      "VIP Menu has the highest CTR today.",
      "Support Request gets most traffic from mobile.",
      "Booking Form has a higher completion rate than Contact Form.",
      "Promo Banner dropped this range.",
    ],
  },
  "7 days": {
    metrics: [
      { label: "Total views", value: "8,642", detail: "Mock weekly views", trend: "+12%" },
      { label: "Link clicks", value: "2,184", detail: "Local click sample", trend: "+9%" },
      { label: "Click-through rate", value: "25.3%", detail: "Clicks / views", trend: "+2.0%" },
      { label: "Form submissions", value: "246", detail: "Fake submissions", trend: "+31" },
      { label: "Conversion rate", value: "2.8%", detail: "Completed action", trend: "+0.3%" },
      { label: "Top performing link", value: "VIP Menu", detail: "Best weekly CTR", trend: "hot" },
      { label: "Top traffic source", value: "Instagram", detail: "Weekly leader", trend: "+18%" },
      { label: "Device split", value: "69% mobile", detail: "Mobile leads", trend: "stable" },
    ],
    topLinks: [
      {
        id: "book-consultation",
        title: "Book a Consultation",
        clicks: 648,
        views: 2310,
        ctr: "28.1%",
        conversions: 96,
        trend: "+10%",
        insight: "Book a Consultation converts strongly after repeat visits.",
      },
      {
        id: "vip-menu",
        title: "VIP Menu",
        clicks: 712,
        views: 2056,
        ctr: "34.6%",
        conversions: 82,
        trend: "+19%",
        insight: "VIP Menu has the highest CTR this week.",
      },
      {
        id: "support-request",
        title: "Support Request",
        clicks: 326,
        views: 1624,
        ctr: "20.1%",
        conversions: 41,
        trend: "+5%",
        insight: "Support Request gets most traffic from mobile.",
      },
      {
        id: "promo-banner",
        title: "Promo Banner",
        clicks: 184,
        views: 1338,
        ctr: "13.8%",
        conversions: 13,
        trend: "-8%",
        insight: "Promo Banner dropped this range.",
      },
      {
        id: "announcement-panel",
        title: "Announcement Panel",
        clicks: 314,
        views: 1314,
        ctr: "23.9%",
        conversions: 14,
        trend: "+7%",
        insight: "Announcement Panel supports return visitors.",
      },
    ],
    forms: [
      {
        id: "contact-form",
        title: "Contact Form",
        views: 978,
        starts: 402,
        submissions: 138,
        completionRate: "34.3%",
        dropOffHint: "Message field adds friction",
        destination: "Mock inbox",
      },
      {
        id: "booking-form",
        title: "Booking Form",
        views: 812,
        starts: 388,
        submissions: 212,
        completionRate: "54.6%",
        dropOffHint: "Date step performs well",
        destination: "Email notification mock",
      },
      {
        id: "support-form",
        title: "Support Form",
        views: 624,
        starts: 241,
        submissions: 84,
        completionRate: "34.9%",
        dropOffHint: "Attachment URL is optional but distracting",
        destination: "Mock inbox",
      },
      {
        id: "lead-form",
        title: "Lead Form",
        views: 536,
        starts: 232,
        submissions: 137,
        completionRate: "59.1%",
        dropOffHint: "Interest options help completion",
        destination: "Google Sheets mock",
      },
      {
        id: "custom-form",
        title: "Custom Form",
        views: 214,
        starts: 66,
        submissions: 27,
        completionRate: "40.9%",
        dropOffHint: "Empty label depresses completion",
        destination: "Webhook mock",
      },
    ],
    trafficSources: [
      { label: "Direct", value: 20, detail: "1,728 views" },
      { label: "Instagram", value: 36, detail: "3,111 views" },
      { label: "Facebook", value: 12, detail: "1,037 views" },
      { label: "TikTok", value: 14, detail: "1,210 views" },
      { label: "X", value: 3, detail: "259 views" },
      { label: "Search", value: 10, detail: "864 views" },
      { label: "QR Code", value: 5, detail: "432 views" },
    ],
    deviceSplit: [
      { label: "Mobile", value: 69, detail: "5,963 views" },
      { label: "Desktop", value: 24, detail: "2,074 views" },
      { label: "Tablet", value: 7, detail: "605 views" },
    ],
    regionSplit: [
      { label: "Thailand", value: 61, detail: "5,272 views" },
      { label: "Singapore", value: 14, detail: "1,210 views" },
      { label: "United States", value: 10, detail: "864 views" },
      { label: "Other", value: 15, detail: "1,296 views" },
    ],
    funnel: [
      { label: "Page view", value: 8642, percent: "100%" },
      { label: "Link click", value: 2184, percent: "25%" },
      { label: "Form start", value: 1329, percent: "15%" },
      { label: "Form submit", value: 246, percent: "3%" },
      { label: "Completed action", value: 168, percent: "2%" },
    ],
    miniChartLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    rangeInsight: "This week favors VIP Menu and Booking Form completion.",
    insights: [
      "VIP Menu has the highest CTR this week.",
      "Support Request gets most traffic from mobile.",
      "Booking Form has a higher completion rate than Contact Form.",
      "Promo Banner dropped this range.",
      "Instagram accounts for more than one-third of weekly traffic.",
    ],
  },
  "30 days": {
    metrics: [
      { label: "Total views", value: "31,880", detail: "Mock monthly views", trend: "+7%" },
      { label: "Link clicks", value: "7,842", detail: "Local click sample", trend: "+5%" },
      { label: "Click-through rate", value: "24.6%", detail: "Clicks / views", trend: "+0.6%" },
      { label: "Form submissions", value: "812", detail: "Fake submissions", trend: "+68" },
      { label: "Conversion rate", value: "2.5%", detail: "Completed action", trend: "-0.1%" },
      { label: "Top performing link", value: "Book a Consultation", detail: "Most conversions", trend: "+11%" },
      { label: "Top traffic source", value: "Direct", detail: "Monthly leader", trend: "+9%" },
      { label: "Device split", value: "66% mobile", detail: "Mobile leads", trend: "stable" },
    ],
    topLinks: [
      {
        id: "book-consultation",
        title: "Book a Consultation",
        clicks: 2546,
        views: 9028,
        ctr: "28.2%",
        conversions: 388,
        trend: "+11%",
        insight: "Book a Consultation drives the most completed actions this month.",
      },
      {
        id: "vip-menu",
        title: "VIP Menu",
        clicks: 2384,
        views: 7422,
        ctr: "32.1%",
        conversions: 241,
        trend: "+8%",
        insight: "VIP Menu remains the CTR leader across 30 days.",
      },
      {
        id: "support-request",
        title: "Support Request",
        clicks: 1248,
        views: 5890,
        ctr: "21.2%",
        conversions: 104,
        trend: "+4%",
        insight: "Support Request is consistent, especially on mobile.",
      },
      {
        id: "promo-banner",
        title: "Promo Banner",
        clicks: 642,
        views: 4920,
        ctr: "13.0%",
        conversions: 35,
        trend: "-12%",
        insight: "Promo Banner dropped this range.",
      },
      {
        id: "announcement-panel",
        title: "Announcement Panel",
        clicks: 1022,
        views: 4620,
        ctr: "22.1%",
        conversions: 44,
        trend: "+2%",
        insight: "Announcement Panel keeps a steady baseline.",
      },
    ],
    forms: [
      {
        id: "contact-form",
        title: "Contact Form",
        views: 3440,
        starts: 1320,
        submissions: 426,
        completionRate: "32.3%",
        dropOffHint: "Long message prompt causes exits",
        destination: "Mock inbox",
      },
      {
        id: "booking-form",
        title: "Booking Form",
        views: 2980,
        starts: 1412,
        submissions: 722,
        completionRate: "51.1%",
        dropOffHint: "Phone field performs better than email",
        destination: "Email notification mock",
      },
      {
        id: "support-form",
        title: "Support Form",
        views: 2104,
        starts: 818,
        submissions: 266,
        completionRate: "32.5%",
        dropOffHint: "Attachment link step is the largest drop",
        destination: "Mock inbox",
      },
      {
        id: "lead-form",
        title: "Lead Form",
        views: 1980,
        starts: 888,
        submissions: 515,
        completionRate: "58.0%",
        dropOffHint: "Lead Form completes cleanly",
        destination: "Google Sheets mock",
      },
      {
        id: "custom-form",
        title: "Custom Form",
        views: 722,
        starts: 204,
        submissions: 83,
        completionRate: "40.7%",
        dropOffHint: "Custom field labels need review",
        destination: "Webhook mock",
      },
    ],
    trafficSources: [
      { label: "Direct", value: 29, detail: "9,245 views" },
      { label: "Instagram", value: 28, detail: "8,926 views" },
      { label: "Facebook", value: 12, detail: "3,826 views" },
      { label: "TikTok", value: 11, detail: "3,507 views" },
      { label: "X", value: 4, detail: "1,275 views" },
      { label: "Search", value: 10, detail: "3,188 views" },
      { label: "QR Code", value: 6, detail: "1,913 views" },
    ],
    deviceSplit: [
      { label: "Mobile", value: 66, detail: "21,041 views" },
      { label: "Desktop", value: 26, detail: "8,289 views" },
      { label: "Tablet", value: 8, detail: "2,550 views" },
    ],
    regionSplit: [
      { label: "Thailand", value: 58, detail: "18,490 views" },
      { label: "Singapore", value: 16, detail: "5,101 views" },
      { label: "United States", value: 12, detail: "3,826 views" },
      { label: "Other", value: 14, detail: "4,463 views" },
    ],
    funnel: [
      { label: "Page view", value: 31880, percent: "100%" },
      { label: "Link click", value: 7842, percent: "25%" },
      { label: "Form start", value: 4642, percent: "15%" },
      { label: "Form submit", value: 812, percent: "3%" },
      { label: "Completed action", value: 552, percent: "2%" },
    ],
    miniChartLabels: ["W1", "W2", "W3", "W4"],
    rangeInsight: "30-day conversions are led by consultation and lead form flows.",
    insights: [
      "Book a Consultation drives the most completed actions this month.",
      "VIP Menu remains the best CTR link.",
      "Lead Form has a higher completion rate than Contact Form.",
      "Promo Banner dropped this range.",
    ],
  },
  "90 days": {
    metrics: [
      { label: "Total views", value: "94,210", detail: "Mock quarterly views", trend: "+16%" },
      { label: "Link clicks", value: "22,480", detail: "Local click sample", trend: "+12%" },
      { label: "Click-through rate", value: "23.9%", detail: "Clicks / views", trend: "-0.3%" },
      { label: "Form submissions", value: "2,184", detail: "Fake submissions", trend: "+204" },
      { label: "Conversion rate", value: "2.3%", detail: "Completed action", trend: "+0.2%" },
      { label: "Top performing link", value: "Book a Consultation", detail: "Quarter winner", trend: "+15%" },
      { label: "Top traffic source", value: "Direct", detail: "Durable source", trend: "+21%" },
      { label: "Device split", value: "64% mobile", detail: "Mobile leads", trend: "stable" },
    ],
    topLinks: [
      {
        id: "book-consultation",
        title: "Book a Consultation",
        clicks: 7488,
        views: 28120,
        ctr: "26.6%",
        conversions: 1164,
        trend: "+15%",
        insight: "Book a Consultation is the strongest long-range converter.",
      },
      {
        id: "vip-menu",
        title: "VIP Menu",
        clicks: 6884,
        views: 22690,
        ctr: "30.3%",
        conversions: 708,
        trend: "+10%",
        insight: "VIP Menu sustains the best long-range CTR.",
      },
      {
        id: "support-request",
        title: "Support Request",
        clicks: 3482,
        views: 17120,
        ctr: "20.3%",
        conversions: 284,
        trend: "+3%",
        insight: "Support Request gets most traffic from mobile.",
      },
      {
        id: "promo-banner",
        title: "Promo Banner",
        clicks: 1788,
        views: 12840,
        ctr: "13.9%",
        conversions: 96,
        trend: "-6%",
        insight: "Promo Banner dropped this range.",
      },
      {
        id: "announcement-panel",
        title: "Announcement Panel",
        clicks: 2838,
        views: 13440,
        ctr: "21.1%",
        conversions: 108,
        trend: "+5%",
        insight: "Announcement Panel performs best with direct traffic.",
      },
    ],
    forms: [
      {
        id: "contact-form",
        title: "Contact Form",
        views: 9920,
        starts: 3710,
        submissions: 1188,
        completionRate: "32.0%",
        dropOffHint: "Long text remains the main drop-off",
        destination: "Mock inbox",
      },
      {
        id: "booking-form",
        title: "Booking Form",
        views: 8720,
        starts: 4012,
        submissions: 2030,
        completionRate: "50.6%",
        dropOffHint: "Booking Form remains efficient",
        destination: "Email notification mock",
      },
      {
        id: "support-form",
        title: "Support Form",
        views: 6220,
        starts: 2310,
        submissions: 724,
        completionRate: "31.3%",
        dropOffHint: "Attachment link creates friction",
        destination: "Mock inbox",
      },
      {
        id: "lead-form",
        title: "Lead Form",
        views: 5640,
        starts: 2444,
        submissions: 1392,
        completionRate: "57.0%",
        dropOffHint: "Lead Form remains the cleanest flow",
        destination: "Google Sheets mock",
      },
      {
        id: "custom-form",
        title: "Custom Form",
        views: 2110,
        starts: 588,
        submissions: 214,
        completionRate: "36.4%",
        dropOffHint: "Custom Form needs field cleanup",
        destination: "Webhook mock",
      },
    ],
    trafficSources: [
      { label: "Direct", value: 32, detail: "30,147 views" },
      { label: "Instagram", value: 27, detail: "25,437 views" },
      { label: "Facebook", value: 11, detail: "10,363 views" },
      { label: "TikTok", value: 10, detail: "9,421 views" },
      { label: "X", value: 4, detail: "3,768 views" },
      { label: "Search", value: 11, detail: "10,363 views" },
      { label: "QR Code", value: 5, detail: "4,711 views" },
    ],
    deviceSplit: [
      { label: "Mobile", value: 64, detail: "60,294 views" },
      { label: "Desktop", value: 28, detail: "26,379 views" },
      { label: "Tablet", value: 8, detail: "7,537 views" },
    ],
    regionSplit: [
      { label: "Thailand", value: 57, detail: "53,700 views" },
      { label: "Singapore", value: 17, detail: "16,016 views" },
      { label: "United States", value: 13, detail: "12,247 views" },
      { label: "Other", value: 13, detail: "12,247 views" },
    ],
    funnel: [
      { label: "Page view", value: 94210, percent: "100%" },
      { label: "Link click", value: 22480, percent: "24%" },
      { label: "Form start", value: 13064, percent: "14%" },
      { label: "Form submit", value: 2184, percent: "2%" },
      { label: "Completed action", value: 1492, percent: "2%" },
    ],
    miniChartLabels: ["M1", "M2", "M3"],
    rangeInsight: "90-day mock data points to durable direct traffic and consultation conversions.",
    insights: [
      "Book a Consultation is the strongest long-range converter.",
      "VIP Menu sustains the best CTR over 90 days.",
      "Support Request gets most traffic from mobile.",
      "Booking Form has a higher completion rate than Contact Form.",
      "Promo Banner dropped this range.",
    ],
  },
};

const buttonStyles: Array<{
  id: ButtonStyle;
  label: string;
  detail: string;
}> = [
  { id: "icon-left", label: "Icon left", detail: "Circular media with CTA text" },
  { id: "image-full", label: "Image full", detail: "Image-led button with overlay" },
  { id: "text-only", label: "Text only", detail: "Minimal typography button" },
  { id: "card-left-image", label: "Card left image", detail: "Compact card with media rail" },
  { id: "text-panel", label: "Text panel", detail: "Paragraph-first content panel" },
];

const defaultDesignSettings: DesignSettings = {
  theme: "Studio Light",
  buttonStyle: "icon-left",
  radius: "14px",
  textAlignment: "left",
  imageSourceMode: "URL field",
  border: "Soft border",
  shadow: "Low shadow",
  spacing: "Comfortable",
  density: "Balanced",
  imageUrl: "https://images.example/mock-icon.png",
  backgroundImageUrl: "https://images.example/mock-cover.jpg",
  aspectRatio: "3:1",
  overlayOpacity: 42,
  textOverlay: true,
  fontWeight: "Semibold",
  title: "Priority support",
  description: "Fast access to the current help flow and account actions.",
  body: "Use this panel for longer menu copy.\nLine breaks stay visible in the preview.",
};

const safeLabels = [
  "local mock state only",
  "local mock analytics only",
  "no submission",
  "no tracking",
  "no database read",
  "no Google Sheets",
  "no Supabase",
  "no save",
  "no publish",
  "no schema update",
  "no route loading",
  "no API calls",
];

const alignOptions: TextAlign[] = ["left", "center", "right"];
const lockTypeOptions: LockType[] = ["none", "code", "age", "sensitive"];
const pageStatusOptions: PageStatus[] = ["Draft", "Published", "Scheduled"];
const pageVisibilityOptions: PageVisibility[] = ["Public", "Hidden", "Password protected"];
const pageLanguageOptions: PageLanguage[] = ["Thai", "English"];
const analyticsTimeRangeOptions: AnalyticsTimeRange[] = ["Today", "7 days", "30 days", "90 days"];
const formFieldTypeOptions: FormFieldType[] = [
  "text",
  "textarea",
  "email",
  "phone",
  "select",
  "radio",
  "checkbox",
  "date",
  "file URL",
];
const submissionDestinationOptions: SubmissionDestination[] = [
  "Mock inbox",
  "Email notification mock",
  "Google Sheets mock",
  "Webhook mock",
];
const mockToday = "2026-05-20";
const productionOrigin = "https://support.bn9.one";

const getStatusLabel = (value: string) => {
  if (value === "active") return "active";
  if (value === "enabled") return "enabled";
  return value;
};

const getStyleLabel = (style: ButtonStyle) =>
  buttonStyles.find((item) => item.id === style)?.label ?? style;

const getLinkStatusLabel = (link: MockLinkItem) => (link.enabled ? "enabled" : "disabled");

const getLinkActionLabel = (link: MockLinkItem) => link.url.trim() || link.actionLabel;

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const getPercentWidth = (value: number, max = 100) => `${Math.max(4, Math.min(100, (value / max) * 100))}%`;

const isSlugValid = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());

const normalizeRouteSegment = (value: string, fallback: string) => {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, "");
  return trimmed || fallback;
};

const getMockRoutePreview = (settings: PageSettings) => {
  const handle = normalizeRouteSegment(settings.publicHandle, "bn9");
  const slug = normalizeRouteSegment(settings.slug, "untitled");

  return `/${handle}/${slug}`;
};

const getCanonicalPreview = (settings: PageSettings) =>
  `${productionOrigin}${getMockRoutePreview(settings)}`;

const getSearchPreviewTitle = (settings: PageSettings) =>
  settings.seoTitle.trim() || settings.pageTitle.trim() || "Untitled mock page";

const getSearchPreviewDescription = (settings: PageSettings) =>
  settings.seoDescription.trim() || "SEO description preview is empty in this mock state.";

const getSocialPreviewTitle = (settings: PageSettings) =>
  settings.socialTitle.trim() || settings.pageTitle.trim() || "Untitled social preview";

const getSocialPreviewDescription = (settings: PageSettings) =>
  settings.socialDescription.trim() || settings.seoDescription.trim() || "Social description is empty.";

const getPageValidationHints = (settings: PageSettings) => {
  const hints: string[] = [];

  if (!settings.pageTitle.trim()) {
    hints.push("empty title");
  }

  if (!isSlugValid(settings.slug)) {
    hints.push("invalid slug sample");
  }

  if (settings.visibility === "Hidden") {
    hints.push("hidden page");
  }

  if (settings.status === "Scheduled") {
    hints.push("scheduled page");
  }

  if (settings.visibility === "Password protected") {
    hints.push("locked page");
  }

  if (settings.noindex) {
    hints.push("noindex enabled");
  }

  return hints;
};

const getPageValidationItems = (settings: PageSettings, links: MockLinkItem[]) => {
  const enabledLinks = links.filter((link) => link.enabled).length;

  return [
    {
      label: "Page title exists",
      ready: Boolean(settings.pageTitle.trim()),
      detail: settings.pageTitle.trim() ? "Title is present" : "empty title",
    },
    {
      label: "Slug looks valid",
      ready: isSlugValid(settings.slug),
      detail: isSlugValid(settings.slug)
        ? getMockRoutePreview(settings)
        : "invalid slug sample: use lowercase words with hyphens",
    },
    {
      label: "At least one enabled link",
      ready: enabledLinks > 0,
      detail: `${enabledLinks} enabled mock links`,
    },
    {
      label: "SEO description exists",
      ready: Boolean(settings.seoDescription.trim()),
      detail: settings.seoDescription.trim() ? "Search preview has body copy" : "description empty",
    },
    {
      label: "Social image optional",
      ready: true,
      detail: settings.socialImageUrl.trim() ? "Image URL set" : "optional empty state",
    },
  ];
};

const getFormStatusLabel = (form: MockFormTemplate) => (form.enabled ? "enabled" : "disabled");

const requiresOptions = (type: FormFieldType) =>
  type === "select" || type === "radio" || type === "checkbox";

const getFormValidationHints = (
  form: MockFormTemplate,
  fields: MockFormField[],
  routing: MockSubmissionRouting
) => {
  const hints: string[] = [];
  const enabledFields = fields.filter((field) => field.enabled);

  if (enabledFields.some((field) => !field.label.trim())) {
    hints.push("empty field label");
  }

  if (!enabledFields.length) {
    hints.push("no enabled fields");
  }

  if (!routing.destination) {
    hints.push("missing destination");
  }

  if (!form.enabled) {
    hints.push("disabled form");
  }

  return hints;
};

const getFormValidationItems = (
  form: MockFormTemplate,
  fields: MockFormField[],
  routing: MockSubmissionRouting
) => {
  const enabledFields = fields.filter((field) => field.enabled);
  const requiredFields = fields.filter((field) => field.required);
  const requiredFieldsHaveLabels = requiredFields.every((field) => field.label.trim());

  return [
    {
      label: "Form title exists",
      ready: Boolean(form.title.trim()),
      detail: form.title.trim() ? form.title : "form title missing",
    },
    {
      label: "At least one enabled field",
      ready: enabledFields.length > 0,
      detail: `${enabledFields.length} enabled mock fields`,
    },
    {
      label: "Required fields have labels",
      ready: requiredFieldsHaveLabels,
      detail: requiredFieldsHaveLabels ? `${requiredFields.length} required fields named` : "empty field label",
    },
    {
      label: "Destination selected",
      ready: Boolean(routing.destination),
      detail: routing.destination || "missing destination",
    },
    {
      label: "Privacy note exists",
      ready: Boolean(form.privacyNote.trim()),
      detail: form.privacyNote.trim() ? "Privacy note present" : "privacy note missing",
    },
  ];
};

const getMockSubmissionStatus = (form: MockFormTemplate) =>
  form.enabled ? "received mock" : "paused mock";

const getValidationHints = (link: MockLinkItem) => {
  const hints: string[] = [];
  const trimmedUrl = link.url.trim();

  if (!trimmedUrl) {
    hints.push("empty URL");
  } else if (!/^https?:\/\/[^\s]+$/i.test(trimmedUrl)) {
    hints.push("invalid URL sample");
  }

  if (!link.enabled) {
    hints.push("disabled link");
  }

  if (link.scheduleHideDate && link.scheduleHideDate <= mockToday) {
    hints.push("scheduled hidden");
  }

  if (link.lockType !== "none") {
    hints.push("locked link");
  }

  return hints;
};

const getAlignClass = (alignment: TextAlign) => {
  if (alignment === "center") return "text-center";
  if (alignment === "right") return "text-right";
  return "text-left";
};

const getJustifyClass = (alignment: TextAlign) => {
  if (alignment === "center") return "justify-center";
  if (alignment === "right") return "justify-end";
  return "justify-start";
};

function StatusBadge({ value }: { value: string }) {
  if (value === "active" || value === "enabled") {
    return <Badge>{getStatusLabel(value)}</Badge>;
  }

  if (value === "draft") {
    return <Badge variant="outline">draft</Badge>;
  }

  return <Badge variant="secondary">{value}</Badge>;
}

function PageStatusBadge({ status }: { status: PageStatus }) {
  if (status === "Published") {
    return <Badge>{status}</Badge>;
  }

  if (status === "Scheduled") {
    return <Badge variant="secondary">{status}</Badge>;
  }

  return <Badge variant="outline">{status}</Badge>;
}

function SafetyLabelRow() {
  return (
    <div className="flex flex-wrap gap-2">
      {safeLabels.map((label) => (
        <Badge key={label} variant="outline">
          {label}
        </Badge>
      ))}
    </div>
  );
}

function MockTopBar({
  selectedPage,
  pageSettings,
  selectedLink,
  deviceMode,
  selectedStyle,
  hasUnsavedChanges,
}: {
  selectedPage: MockPage;
  pageSettings: PageSettings;
  selectedLink: MockLinkItem;
  deviceMode: DeviceMode;
  selectedStyle: ButtonStyle;
  hasUnsavedChanges: boolean;
}) {
  const DeviceIcon = deviceMode === "phone" ? Smartphone : Monitor;

  return (
    <header className="border-b bg-background px-4 py-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current mock page route
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold leading-tight">{getMockRoutePreview(pageSettings)}</h3>
            <Badge variant="outline">no real route loading</Badge>
            <PageStatusBadge status={pageSettings.status} />
            {hasUnsavedChanges ? <Badge variant="secondary">Unsaved mock changes</Badge> : null}
            <Badge variant="secondary">{getStyleLabel(selectedStyle)}</Badge>
            <Badge variant="outline">{selectedLink.title}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Selected static lab route: {selectedPage.route}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Mock save status: idle</Badge>
          <Badge variant="outline">
            <DeviceIcon data-icon="inline-start" />
            {deviceMode === "phone" ? "Phone mode" : "Desktop mode"}
          </Badge>
          <Badge variant="outline">
            <ShieldCheck data-icon="inline-start" />
            Safe mock mode
          </Badge>
        </div>
      </div>
    </header>
  );
}

function MockSidebar() {
  return (
    <aside className="border-b bg-background p-4 lg:border-b-0 lg:border-r">
      <div className="rounded-lg border bg-muted/40 px-3 py-3">
        <p className="text-sm font-semibold">Likyoyo Studio</p>
        <p className="mt-1 text-xs text-muted-foreground">Backoffice concept</p>
      </div>
      <nav className="mt-4 grid gap-2" aria-label="Mock admin navigation">
        {adminNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                item.active ? "bg-foreground text-background" : "bg-muted/50 text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </div>
          );
        })}
      </nav>
      <div className="mt-5 rounded-lg border p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Guardrails
        </p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Visual-only lab shell with local mock state. No save, publish, schema, route, or
          store updates.
        </p>
      </div>
    </aside>
  );
}

function MockPagesArea({
  selectedPage,
  pageSettingsByRoute,
  dirtyRoutes,
  onSelectPage,
}: {
  selectedPage: MockPage;
  pageSettingsByRoute: Record<string, PageSettings>;
  dirtyRoutes: Record<string, boolean>;
  onSelectPage: (page: MockPage) => void;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Pages
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock page map</h3>
        </div>
        <Badge variant="secondary">static routes</Badge>
      </div>
      <div className="mt-4 grid gap-3">
        {mockPages.map((page) => {
          const selected = selectedPage.route === page.route;
          const pageSettings = pageSettingsByRoute[page.route];

          return (
            <button
              key={page.route}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectPage(page)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{page.route}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      selected ? "text-background/75" : "text-muted-foreground"
                    )}
                  >
                    {page.title}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  {dirtyRoutes[page.route] ? (
                    <Badge variant={selected ? "secondary" : "outline"}>unsaved</Badge>
                  ) : null}
                  {pageSettings ? (
                    <PageStatusBadge status={pageSettings.status} />
                  ) : (
                    <StatusBadge value={page.status} />
                  )}
                </div>
              </div>
              <p
                className={cn(
                  "mt-2 text-xs leading-5",
                  selected ? "text-background/75" : "text-muted-foreground"
                )}
              >
                {page.detail}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MockBlockManager({
  selectedBlock,
  onSelectBlock,
}: {
  selectedBlock: MockBlock;
  onSelectBlock: (block: MockBlock) => void;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Block Manager
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock block stack</h3>
        </div>
        <Badge variant="outline">no schema changes</Badge>
      </div>
      <div className="mt-4 grid gap-3">
        {mockBlocks.map((block) => {
          const selected = selectedBlock.id === block.id;

          return (
            <button
              key={block.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectBlock(block)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{block.label}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs leading-5",
                      selected ? "text-background/75" : "text-muted-foreground"
                    )}
                  >
                    {block.detail}
                  </p>
                </div>
                <StatusBadge value={block.state} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MockValidationHints({ hints }: { hints: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {hints.length ? (
        hints.map((hint) => (
          <Badge key={hint} variant="secondary">
            <TriangleAlert data-icon="inline-start" />
            {hint}
          </Badge>
        ))
      ) : (
        <Badge variant="outline">no visual validation hints</Badge>
      )}
    </div>
  );
}

function MockStatsGrid({ link }: { link: MockLinkItem }) {
  const stats = [
    { label: "Total clicks", value: formatNumber(link.totalClicks) },
    { label: "7 day clicks", value: formatNumber(link.sevenDayClicks) },
    { label: "CTR", value: link.ctr },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          <p className="mt-1 text-lg font-semibold leading-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function MockLinkManager({
  links,
  selectedLink,
  onSelectLink,
  onMoveLink,
}: {
  links: MockLinkItem[];
  selectedLink: MockLinkItem;
  onSelectLink: (linkId: string) => void;
  onMoveLink: (linkId: string, direction: -1 | 1) => void;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Link Manager
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock link stack</h3>
        </div>
        <Badge variant="outline">local reorder only</Badge>
      </div>

      <div className="mt-4 grid gap-3">
        {links.map((link, index) => {
          const selected = selectedLink.id === link.id;
          const first = index === 0;
          const last = index === links.length - 1;

          return (
            <div
              key={link.id}
              className={cn(
                "flex min-w-0 gap-2 rounded-lg border p-2 transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectLink(link.id)}
                className="min-w-0 flex-1 rounded-md p-1 text-left"
              >
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">{link.title}</p>
                      {link.prioritized ? (
                        <Badge variant={selected ? "secondary" : "outline"}>
                          <Star data-icon="inline-start" />
                          prioritized
                        </Badge>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        "mt-1 truncate text-xs",
                        selected ? "text-background/75" : "text-muted-foreground"
                      )}
                    >
                      {getLinkActionLabel(link)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <StatusBadge value={getLinkStatusLabel(link)} />
                    <Badge variant={selected ? "secondary" : "outline"}>
                      {getStyleLabel(link.buttonStyle)}
                    </Badge>
                    <Badge variant={selected ? "secondary" : "outline"}>
                      <MousePointerClick data-icon="inline-start" />
                      {formatNumber(link.totalClicks)}
                    </Badge>
                  </div>
                </div>
              </button>

              <div className="grid shrink-0 grid-cols-2 gap-1 sm:grid-cols-1">
                <button
                  type="button"
                  onClick={() => onMoveLink(link.id, -1)}
                  disabled={first}
                  title="Move up"
                  className="grid size-8 place-items-center rounded-md border bg-background/80 text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveLink(link.id, 1)}
                  disabled={last}
                  title="Move down"
                  className="grid size-8 place-items-center rounded-md border bg-background/80 text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowDown className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={cn(
                "min-h-8 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AlignmentChoice({
  value,
  onChange,
}: {
  value: TextAlign;
  onChange: (value: TextAlign) => void;
}) {
  const icons = {
    left: AlignLeft,
    center: AlignCenter,
    right: AlignRight,
  };

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">Text alignment</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {alignOptions.map((option) => {
          const Icon = icons[option];
          const selected = value === option;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={cn(
                "flex h-9 items-center justify-center rounded-lg border transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
              title={option}
            >
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MockInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full min-w-0 rounded-lg border bg-muted/30 px-3 text-sm outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}

function MockTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-2 w-full min-w-0 resize-none rounded-lg border bg-muted/30 px-3 py-2 text-sm leading-6 outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}

function MockToggle({
  label,
  checked = false,
  onToggle,
}: {
  label: string;
  checked?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3 text-left"
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={cn(
          "flex h-6 w-11 items-center rounded-full p-1",
          checked ? "justify-end bg-foreground" : "justify-start bg-muted"
        )}
      >
        <span className="size-4 rounded-full bg-background shadow-sm" />
      </span>
    </button>
  );
}

function MockPageSettingsPanel({
  settings,
  validationHints,
  hasUnsavedChanges,
  onChange,
}: {
  settings: PageSettings;
  validationHints: string[];
  hasUnsavedChanges: boolean;
  onChange: UpdatePageSetting;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Page Settings
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock route and page controls</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Local component state only. These controls do not load routes, write schema, or save
            production page data.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <PageStatusBadge status={settings.status} />
          {hasUnsavedChanges ? <Badge variant="secondary">Unsaved mock changes</Badge> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MockInput
              label="Page title"
              value={settings.pageTitle}
              onChange={(value) => onChange("pageTitle", value)}
            />
            <MockInput
              label="Public handle"
              value={settings.publicHandle}
              onChange={(value) => onChange("publicHandle", value)}
            />
            <MockInput
              label="Page slug"
              value={settings.slug}
              onChange={(value) => onChange("slug", value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ChoiceGroup
              label="Page status"
              options={pageStatusOptions}
              value={settings.status}
              onChange={(value) => onChange("status", value as PageStatus)}
            />
            <ChoiceGroup
              label="Visibility"
              options={pageVisibilityOptions}
              value={settings.visibility}
              onChange={(value) => onChange("visibility", value as PageVisibility)}
            />
            <ChoiceGroup
              label="Language"
              options={pageLanguageOptions}
              value={settings.language}
              onChange={(value) => onChange("language", value as PageLanguage)}
            />
            <ChoiceGroup
              label="Timezone"
              options={["Asia/Bangkok"]}
              value={settings.timezone}
              onChange={(value) => onChange("timezone", value as "Asia/Bangkok")}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <StaticField label="Full mock route preview" value={getMockRoutePreview(settings)} />
          <StaticField label="Canonical URL preview" value={getCanonicalPreview(settings)} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Page validation hints
            </p>
            <div className="mt-2">
              <MockValidationHints hints={validationHints} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockSeoSocialPanel({
  settings,
  onChange,
}: {
  settings: PageSettings;
  onChange: UpdatePageSetting;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            SEO / Social Share
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock metadata fields</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            These fields update preview cards only. No metadata export, route update, or API call
            is created.
          </p>
        </div>
        <Badge variant="outline">no real SEO publishing</Badge>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="grid gap-4">
          <MockInput
            label="SEO title"
            value={settings.seoTitle}
            onChange={(value) => onChange("seoTitle", value)}
          />
          <MockTextarea
            label="SEO description"
            value={settings.seoDescription}
            onChange={(value) => onChange("seoDescription", value)}
          />
          <MockToggle
            label="Noindex toggle mock"
            checked={settings.noindex}
            onToggle={() => onChange("noindex", !settings.noindex)}
          />
        </div>

        <div className="grid gap-4">
          <MockInput
            label="Social preview title"
            value={settings.socialTitle}
            onChange={(value) => onChange("socialTitle", value)}
          />
          <MockTextarea
            label="Social preview description"
            value={settings.socialDescription}
            onChange={(value) => onChange("socialDescription", value)}
          />
          <MockInput
            label="Social image URL"
            value={settings.socialImageUrl}
            onChange={(value) => onChange("socialImageUrl", value)}
          />
        </div>
      </div>
    </section>
  );
}

function MockSharePreviewCards({
  settings,
  selectedLink,
}: {
  settings: PageSettings;
  selectedLink: MockLinkItem;
}) {
  const routePreview = getMockRoutePreview(settings);
  const canonicalUrl = getCanonicalPreview(settings);

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Share Preview Cards
          </p>
          <h3 className="mt-1 text-base font-semibold">Search, social, and mobile mocks</h3>
        </div>
        <Badge variant="outline">preview cards only</Badge>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <article className="min-w-0 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Globe2 className="size-4" />
            Browser/search preview
          </div>
          <p className="mt-4 break-words text-sm font-semibold leading-5 text-blue-700">
            {getSearchPreviewTitle(settings)}
          </p>
          <p className="mt-1 break-all text-xs leading-5 text-green-700">{canonicalUrl}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {getSearchPreviewDescription(settings)}
          </p>
          {settings.noindex ? (
            <Badge variant="secondary" className="mt-3">
              <ShieldOff data-icon="inline-start" />
              noindex mock
            </Badge>
          ) : null}
        </article>

        <article className="min-w-0 overflow-hidden rounded-xl border bg-muted/30">
          <div className="grid aspect-[1.9/1] place-items-center bg-foreground text-background">
            {settings.socialImageUrl.trim() ? (
              <div className="max-w-full px-4 text-center">
                <ImageIcon className="mx-auto size-7" />
                <p className="mt-2 line-clamp-2 break-all text-xs">{settings.socialImageUrl}</p>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto size-7" />
                <p className="mt-2 text-xs">optional image empty</p>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <Share2 className="size-4" />
              Social share preview
            </div>
            <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5">
              {getSocialPreviewTitle(settings)}
            </p>
            <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">
              {getSocialPreviewDescription(settings)}
            </p>
            <p className="mt-2 break-all text-xs text-muted-foreground">{routePreview}</p>
          </div>
        </article>

        <article className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Smartphone className="size-4" />
            Mobile link preview
          </div>
          <div className="mx-auto mt-4 w-full max-w-[220px] rounded-3xl border bg-background p-2 shadow-sm">
            <div className="rounded-2xl bg-muted/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold">{settings.publicHandle}</span>
                <PageStatusBadge status={settings.status} />
              </div>
              <div className="mt-3 rounded-xl border bg-background p-3 text-center">
                <p className="line-clamp-2 text-sm font-semibold leading-5">
                  {settings.pageTitle || "Untitled mock page"}
                </p>
                <p className="mt-1 break-all text-xs text-muted-foreground">{routePreview}</p>
              </div>
              <div className="mt-3 rounded-xl bg-foreground px-3 py-2 text-background">
                <p className="truncate text-xs font-semibold">{selectedLink.title}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-background/75">
                  {selectedLink.description}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function MockPublishFlow({
  settings,
  hasUnsavedChanges,
  publishFlowNote,
  onSaveDraft,
  onPreview,
  onPublish,
  onSchedule,
}: {
  settings: PageSettings;
  hasUnsavedChanges: boolean;
  publishFlowNote: string;
  onSaveDraft: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onSchedule: () => void;
}) {
  const actions = [
    {
      label: "Save draft mock",
      detail: "Clears local dirty badge only",
      icon: Save,
      onClick: onSaveDraft,
    },
    {
      label: "Preview page mock",
      detail: "Updates this visual note only",
      icon: Eye,
      onClick: onPreview,
    },
    {
      label: "Publish mock",
      detail: "Sets local status badge only",
      icon: Share2,
      onClick: onPublish,
    },
    {
      label: "Schedule publish mock",
      detail: "Sets local scheduled badge only",
      icon: Clock3,
      onClick: onSchedule,
    },
  ];

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Publish Flow
          </p>
          <h3 className="mt-1 text-base font-semibold">Safe visual controls</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            No save, no publish, no route loading, no schema update, and no API calls.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PageStatusBadge status={settings.status} />
          {hasUnsavedChanges ? <Badge variant="secondary">Unsaved mock changes</Badge> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="min-w-0 rounded-lg border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/60"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="size-4" />
                {action.label}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{action.detail}</p>
              <Badge variant="outline" className="mt-3">
                mock only
              </Badge>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg border bg-muted/30 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Local action log
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{publishFlowNote}</p>
      </div>
    </section>
  );
}

function MockPageValidationChecklist({
  settings,
  links,
  validationHints,
}: {
  settings: PageSettings;
  links: MockLinkItem[];
  validationHints: string[];
}) {
  const validationItems = getPageValidationItems(settings, links);
  const sampleHints = [
    "invalid slug sample",
    "empty title",
    "hidden page",
    "scheduled page",
    "locked page",
  ];

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Publish Checklist
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock validation only</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Checklist states are hints for the prototype and do not block any local mock action.
          </p>
        </div>
        <Badge variant="outline">no real validation blocking</Badge>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {validationItems.map((item) => (
          <div key={item.label} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start gap-2">
              {item.ready ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              ) : (
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5">{item.label}</p>
                <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.6fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Active visual hints
          </p>
          <div className="mt-2">
            <MockValidationHints hints={validationHints} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Hint examples
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sampleHints.map((hint) => (
              <Badge key={hint} variant="outline">
                <TriangleAlert data-icon="inline-start" />
                {hint}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MockAnalyticsDashboard({
  range,
  data,
  selectedTopLink,
  onRangeChange,
}: {
  range: AnalyticsTimeRange;
  data: MockAnalyticsRangeData;
  selectedTopLink: MockTopLinkAnalytics;
  onRangeChange: (range: AnalyticsTimeRange) => void;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Analytics Dashboard
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock performance overview</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Local mock analytics only. No event tracking, database read, API call, Supabase, or
            Google Sheets connection is used.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{range}</Badge>
          <Badge variant="outline">local mock analytics only</Badge>
          <Badge variant="outline">no tracking</Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-xl font-semibold leading-tight">{metric.value}</p>
                <Badge variant="outline">{metric.trend}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Range selector
          </p>
          <div className="mt-3">
            <ChoiceGroup
              label="Time range"
              options={analyticsTimeRangeOptions}
              value={range}
              onChange={(value) => onRangeChange(value as AnalyticsTimeRange)}
            />
          </div>
          <div className="mt-4 rounded-lg border bg-background p-3">
            <p className="text-xs font-medium text-muted-foreground">Mini chart labels</p>
            <div className="mt-3 flex items-end gap-2">
              {data.miniChartLabels.map((label, index) => (
                <div key={label} className="grid flex-1 gap-1 text-center">
                  <div
                    className="mx-auto w-full rounded-t bg-foreground"
                    style={{ height: `${28 + ((index + 1) % 4) * 12}px` }}
                  />
                  <span className="truncate text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-lg border bg-background p-3">
            <p className="text-xs font-medium text-muted-foreground">Selected top link</p>
            <p className="mt-1 text-sm font-semibold">{selectedTopLink.title}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{data.rangeInsight}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockTopLinksAnalytics({
  links,
  selectedTopLink,
  onSelectLink,
}: {
  links: MockTopLinkAnalytics[];
  selectedTopLink: MockTopLinkAnalytics;
  onSelectLink: (linkId: string) => void;
}) {
  const maxClicks = Math.max(...links.map((link) => link.clicks), 1);

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Top Links
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock link performance</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Selecting a row updates only local analytics detail and preview highlight state.
          </p>
        </div>
        <Badge variant="outline">no event tracking</Badge>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-3">
          {links.map((link) => {
            const selected = selectedTopLink.id === link.id;

            return (
              <button
                key={link.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectLink(link.id)}
                className={cn(
                  "min-w-0 rounded-lg border p-3 text-left transition-colors",
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "bg-muted/30 hover:bg-muted/60"
                )}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{link.title}</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/60">
                      <div
                        className={cn("h-full rounded-full", selected ? "bg-background" : "bg-foreground")}
                        style={{ width: getPercentWidth(link.clicks, maxClicks) }}
                      />
                    </div>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-2 text-xs md:grid-cols-5">
                    <Badge variant={selected ? "secondary" : "outline"}>{formatNumber(link.clicks)} clicks</Badge>
                    <Badge variant={selected ? "secondary" : "outline"}>{formatNumber(link.views)} views</Badge>
                    <Badge variant={selected ? "secondary" : "outline"}>{link.ctr} CTR</Badge>
                    <Badge variant={selected ? "secondary" : "outline"}>{link.conversions} conv.</Badge>
                    <Badge variant={selected ? "secondary" : "outline"}>{link.trend}</Badge>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Analytics detail
          </p>
          <h4 className="mt-2 text-base font-semibold">{selectedTopLink.title}</h4>
          <div className="mt-3 grid gap-2">
            <StaticField label="Clicks" value={formatNumber(selectedTopLink.clicks)} />
            <StaticField label="CTR" value={selectedTopLink.ctr} />
            <StaticField label="Conversions" value={formatNumber(selectedTopLink.conversions)} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedTopLink.insight}</p>
        </div>
      </div>
    </section>
  );
}

function MockFormAnalyticsPanel({ forms }: { forms: MockFormAnalytics[] }) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Form Analytics
          </p>
          <h3 className="mt-1 text-base font-semibold">Visual-only form performance</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Form metrics are mock values and do not read real submissions.
          </p>
        </div>
        <Badge variant="outline">no database read</Badge>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-5">
        {forms.map((form) => (
          <article key={form.id} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-semibold">{form.title}</p>
              <Badge variant="outline">{form.destination}</Badge>
            </div>
            <div className="mt-3 grid gap-2 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{formatNumber(form.views)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Starts</span>
                <span className="font-medium">{formatNumber(form.starts)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Submissions</span>
                <span className="font-medium">{formatNumber(form.submissions)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{form.completionRate}</span>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {form.dropOffHint}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MockSplitBars({
  title,
  items,
}: {
  title: string;
  items: MockSplitItem[];
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">{item.value}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-foreground" style={{ width: `${item.value}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockTrafficDeviceRegionPanel({ data }: { data: MockAnalyticsRangeData }) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Traffic / Device / Region
          </p>
          <h3 className="mt-1 text-base font-semibold">CSS-only split views</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            These bars are visual mock data, not external analytics or tracking.
          </p>
        </div>
        <Badge variant="outline">no tracking</Badge>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <MockSplitBars title="Traffic sources" items={data.trafficSources} />
        <MockSplitBars title="Device split" items={data.deviceSplit} />
        <MockSplitBars title="Region split" items={data.regionSplit} />
      </div>
    </section>
  );
}

function MockConversionFunnel({ steps }: { steps: MockFunnelStep[] }) {
  const maxValue = Math.max(...steps.map((step) => step.value), 1);

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Conversion Funnel
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock funnel progression</h3>
        </div>
        <Badge variant="outline">local percentages only</Badge>
      </div>

      <div className="mt-4 grid gap-3">
        {steps.map((step) => (
          <div key={step.label} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">{step.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(step.value)} mock events
                </p>
              </div>
              <Badge variant="outline">{step.percent}</Badge>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: getPercentWidth(step.value, maxValue) }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MockInsightsPanel({
  insights,
  selectedTopLink,
  range,
}: {
  insights: string[];
  selectedTopLink: MockTopLinkAnalytics;
  range: AnalyticsTimeRange;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Insights
          </p>
          <h3 className="mt-1 text-base font-semibold">Generated-looking mock notes</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Static local copy only. No AI, API, analytics service, or database call runs here.
          </p>
        </div>
        <Badge variant="secondary">{range}</Badge>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {insights.map((insight) => (
          <article key={insight} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start gap-2">
              <BarChart3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm leading-6">{insight}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-lg border bg-muted/30 p-3">
        <p className="text-xs font-medium text-muted-foreground">Selected link insight</p>
        <p className="mt-1 text-sm leading-6">{selectedTopLink.insight}</p>
      </div>
    </section>
  );
}

function MockFormBuilderArea({
  forms,
  fieldsByForm,
  selectedForm,
  selectedFields,
  routing,
  onSelectForm,
}: {
  forms: MockFormTemplate[];
  fieldsByForm: Record<string, MockFormField[]>;
  selectedForm: MockFormTemplate;
  selectedFields: MockFormField[];
  routing: MockSubmissionRouting;
  onSelectForm: (formId: string) => void;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Form Builder
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock form templates</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Visual form-building state only. No support form, Google Sheets, webhook, or API
            wiring is connected.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{selectedForm.title}</Badge>
          <Badge variant="outline">{routing.destination || "missing destination"}</Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-5">
        {forms.map((form) => {
          const selected = selectedForm.id === form.id;
          const fieldCount = fieldsByForm[form.id]?.length ?? 0;

          return (
            <button
              key={form.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectForm(form.id)}
              className={cn(
                "min-w-0 rounded-lg border p-3 text-left transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-semibold">{form.title}</p>
                <StatusBadge value={getFormStatusLabel(form)} />
              </div>
              <p
                className={cn(
                  "mt-2 line-clamp-3 text-xs leading-5",
                  selected ? "text-background/75" : "text-muted-foreground"
                )}
              >
                {form.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={selected ? "secondary" : "outline"}>{fieldCount} fields</Badge>
                <Badge variant={selected ? "secondary" : "outline"}>{form.destinationLabel}</Badge>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Active form card
              </p>
              <h4 className="mt-1 truncate text-lg font-semibold">{selectedForm.title}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={getFormStatusLabel(selectedForm)} />
              <Badge variant="outline">{selectedForm.destinationLabel}</Badge>
            </div>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {selectedForm.description}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {selectedFields.slice(0, 4).map((field) => (
              <div key={field.id} className="min-w-0 rounded-lg border bg-background px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{field.label || "Untitled field"}</p>
                  <Badge variant="outline">{field.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Submission destination
          </p>
          <p className="mt-2 text-sm font-semibold">{routing.destination || "Missing destination"}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Destination labels are visual-only. No submission is sent and no external service is
            contacted.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">no submission</Badge>
            <Badge variant="outline">no Google Sheets</Badge>
            <Badge variant="outline">no API calls</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockFieldBuilder({
  fields,
  selectedField,
  onSelectField,
  onMoveField,
}: {
  fields: MockFormField[];
  selectedField: MockFormField;
  onSelectField: (fieldId: string) => void;
  onMoveField: (fieldId: string, direction: -1 | 1) => void;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Field Builder
          </p>
          <h3 className="mt-1 text-base font-semibold">Selected form fields</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Reorder and select fields locally. No real form schema is generated.
          </p>
        </div>
        <Badge variant="outline">{fields.length} local fields</Badge>
      </div>

      <div className="mt-4 grid gap-3">
        {fields.map((field, index) => {
          const selected = selectedField.id === field.id;
          const first = index === 0;
          const last = index === fields.length - 1;

          return (
            <div
              key={field.id}
              className={cn(
                "flex min-w-0 gap-2 rounded-lg border p-2 transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectField(field.id)}
                className="min-w-0 flex-1 rounded-md p-1 text-left"
              >
                <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {field.label || "Untitled field"}
                    </p>
                    <p
                      className={cn(
                        "mt-1 truncate text-xs",
                        selected ? "text-background/75" : "text-muted-foreground"
                      )}
                    >
                      {field.placeholder || "No placeholder"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Badge variant={selected ? "secondary" : "outline"}>{field.type}</Badge>
                    {field.required ? (
                      <Badge variant={selected ? "secondary" : "outline"}>required</Badge>
                    ) : null}
                    <StatusBadge value={field.enabled ? "enabled" : "disabled"} />
                  </div>
                </div>
              </button>

              <div className="grid shrink-0 grid-cols-2 gap-1 sm:grid-cols-1">
                <button
                  type="button"
                  onClick={() => onMoveField(field.id, -1)}
                  disabled={first}
                  title="Move field up"
                  className="grid size-8 place-items-center rounded-md border bg-background/80 text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveField(field.id, 1)}
                  disabled={last}
                  title="Move field down"
                  className="grid size-8 place-items-center rounded-md border bg-background/80 text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowDown className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MockFieldSettingsPanel({
  field,
  onFieldChange,
}: {
  field: MockFormField;
  onFieldChange: UpdateFormField;
}) {
  return (
    <div className="grid gap-4">
      <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Field Settings
        </p>
        <p className="mt-1 text-sm font-semibold">{field.label || "Untitled field"}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Local visual controls only. No real form engine or schema update is created.
        </p>
      </div>

      <MockInput
        label="Label"
        value={field.label}
        onChange={(value) => onFieldChange("label", value)}
      />
      <MockInput
        label="Placeholder"
        value={field.placeholder}
        onChange={(value) => onFieldChange("placeholder", value)}
      />
      <ChoiceGroup
        label="Type"
        options={formFieldTypeOptions}
        value={field.type}
        onChange={(value) => onFieldChange("type", value as FormFieldType)}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <MockToggle
          label="Required"
          checked={field.required}
          onToggle={() => onFieldChange("required", !field.required)}
        />
        <MockToggle
          label="Enabled"
          checked={field.enabled}
          onToggle={() => onFieldChange("enabled", !field.enabled)}
        />
      </div>
      <MockTextarea
        label="Help text"
        value={field.helpText}
        onChange={(value) => onFieldChange("helpText", value)}
      />
      {requiresOptions(field.type) ? (
        <MockTextarea
          label="Options textarea"
          value={field.options}
          onChange={(value) => onFieldChange("options", value)}
        />
      ) : null}
      <MockInput
        label="Validation hint"
        value={field.validationHint}
        onChange={(value) => onFieldChange("validationHint", value)}
      />
      {field.type === "file URL" ? (
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">File URL helper</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                This mock accepts a URL label only. No upload, storage, support file route, or API
                call is connected.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MockSubmissionRoutingPanel({
  routing,
  onRoutingChange,
}: {
  routing: MockSubmissionRouting;
  onRoutingChange: UpdateSubmissionRouting;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Submission Routing
          </p>
          <h3 className="mt-1 text-base font-semibold">Visual-only destinations</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Routing controls are local labels. They do not call Google Sheets, webhooks, APIs, or
            Supabase.
          </p>
        </div>
        <Badge variant="outline">no submission</Badge>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.7fr)]">
        <ChoiceGroup
          label="Selected destination"
          options={submissionDestinationOptions}
          value={routing.destination}
          onChange={(value) => onRoutingChange("destination", value as SubmissionDestination)}
        />

        <div className="grid gap-3">
          <MockToggle
            label="Mock inbox"
            checked={routing.mockInbox}
            onToggle={() => onRoutingChange("mockInbox", !routing.mockInbox)}
          />
          <MockToggle
            label="Email notification mock"
            checked={routing.emailNotification}
            onToggle={() => onRoutingChange("emailNotification", !routing.emailNotification)}
          />
          <MockToggle
            label="Google Sheets mock"
            checked={routing.googleSheets}
            onToggle={() => onRoutingChange("googleSheets", !routing.googleSheets)}
          />
          <MockToggle
            label="Webhook mock"
            checked={routing.webhook}
            onToggle={() => onRoutingChange("webhook", !routing.webhook)}
          />
        </div>
      </div>
    </section>
  );
}

function MockSubmissionPreview({
  selectedForm,
  selectedField,
  routing,
}: {
  selectedForm: MockFormTemplate;
  selectedField: MockFormField;
  routing: MockSubmissionRouting;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Submission Preview
          </p>
          <h3 className="mt-1 text-base font-semibold">Latest fake submission</h3>
        </div>
        <Badge variant="outline">No real submission sent</Badge>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-muted/30">
        <div className="grid gap-3 p-4 md:grid-cols-5">
          <StaticField label="Latest time" value="2026-05-20 14:35 ICT" />
          <StaticField label="Submitted name" value="Narin Mock" />
          <StaticField label="Submitted email" value="narin@example.test" />
          <StaticField label="Selected form" value={selectedForm.title} />
          <StaticField label="Selected field" value={selectedField.label || "Untitled field"} />
        </div>
        <div className="border-t bg-background p-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{getMockSubmissionStatus(selectedForm)}</Badge>
            <Badge variant="outline">{routing.destination || "missing destination"}</Badge>
            <Badge variant="outline">No real submission sent</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockFormValidationChecklist({
  selectedForm,
  fields,
  routing,
  validationHints,
}: {
  selectedForm: MockFormTemplate;
  fields: MockFormField[];
  routing: MockSubmissionRouting;
  validationHints: string[];
}) {
  const validationItems = getFormValidationItems(selectedForm, fields, routing);
  const sampleHints = [
    "empty field label",
    "no enabled fields",
    "missing destination",
    "disabled form",
  ];

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Form Checklist
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock validation only</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Hints are visual-only and do not block selection, routing, or field reorder actions.
          </p>
        </div>
        <Badge variant="outline">no real validation blocking</Badge>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {validationItems.map((item) => (
          <div key={item.label} className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start gap-2">
              {item.ready ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              ) : (
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5">{item.label}</p>
                <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.6fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Active form hints
          </p>
          <div className="mt-2">
            <MockValidationHints hints={validationHints} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Hint examples
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sampleHints.map((hint) => (
              <Badge key={hint} variant="outline">
                <TriangleAlert data-icon="inline-start" />
                {hint}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PerLinkSettingsPanel({
  link,
  settings,
  validationHints,
  onLinkChange,
  onSettingChange,
  onTogglePrioritized,
}: {
  link: MockLinkItem;
  settings: DesignSettings;
  validationHints: string[];
  onLinkChange: UpdateSelectedLink;
  onSettingChange: UpdateDesignSetting;
  onTogglePrioritized: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Visual validation
        </p>
        <div className="mt-2">
          <MockValidationHints hints={validationHints} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MockInput
          label="Title"
          value={link.title}
          onChange={(value) => onLinkChange("title", value)}
        />
        <MockInput
          label="URL"
          value={link.url}
          onChange={(value) => onLinkChange("url", value)}
        />
      </div>

      <MockTextarea
        label="Description"
        value={link.description}
        onChange={(value) => onLinkChange("description", value)}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MockToggle
          label="Open in new tab"
          checked={link.openInNewTab}
          onToggle={() => onLinkChange("openInNewTab", !link.openInNewTab)}
        />
        <MockToggle
          label="Enabled"
          checked={link.enabled}
          onToggle={() => onLinkChange("enabled", !link.enabled)}
        />
        <MockToggle
          label="Featured / Prioritized"
          checked={link.prioritized}
          onToggle={onTogglePrioritized}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChoiceGroup
          label="Button style"
          options={buttonStyles.map((style) => style.id)}
          value={link.buttonStyle}
          onChange={(value) => onLinkChange("buttonStyle", value as ButtonStyle)}
        />
        <AlignmentChoice
          value={link.textAlignment}
          onChange={(value) => onLinkChange("textAlignment", value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MockInput
          label="Image URL"
          value={link.imageUrl}
          onChange={(value) => onLinkChange("imageUrl", value)}
        />
        <MockInput
          label="Background Image URL"
          value={link.backgroundImageUrl}
          onChange={(value) => onLinkChange("backgroundImageUrl", value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MockInput
          label="Schedule publish date"
          value={link.schedulePublishDate}
          onChange={(value) => onLinkChange("schedulePublishDate", value)}
        />
        <MockInput
          label="Schedule hide date"
          value={link.scheduleHideDate}
          onChange={(value) => onLinkChange("scheduleHideDate", value)}
        />
      </div>

      <ChoiceGroup
        label="Lock type"
        options={lockTypeOptions}
        value={link.lockType}
        onChange={(value) => onLinkChange("lockType", value as LockType)}
      />

      {link.buttonStyle === "text-panel" ? (
        <MockTextarea
          label="Text panel body"
          value={link.body}
          onChange={(value) => onLinkChange("body", value)}
        />
      ) : null}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Style-specific mock fields
        </p>
        <div className="mt-3">
          <StyleSpecificFields settings={settings} onChange={onSettingChange} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Mock click stats
        </p>
        <div className="mt-3">
          <MockStatsGrid link={link} />
        </div>
      </div>
    </div>
  );
}

function ButtonStyleSelector({
  value,
  onChange,
}: {
  value: ButtonStyle;
  onChange: (value: ButtonStyle) => void;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Button/Menu Style
          </p>
          <h3 className="mt-1 text-base font-semibold">Mock selector</h3>
        </div>
        <Badge variant="secondary">{getStyleLabel(value)}</Badge>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {buttonStyles.map((style) => {
          const selected = value === style.id;

          return (
            <button
              key={style.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(style.id)}
              className={cn(
                "min-w-0 rounded-lg border p-3 text-left transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "bg-muted/30 hover:bg-muted/60"
              )}
            >
              <p className="truncate text-sm font-semibold">{style.id}</p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5",
                  selected ? "text-background/75" : "text-muted-foreground"
                )}
              >
                {style.detail}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DesignPanel({
  settings,
  onChange,
}: {
  settings: DesignSettings;
  onChange: UpdateDesignSetting;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Design Panel
          </p>
          <h3 className="mt-1 text-base font-semibold">Future editor controls</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Visual controls backed by component state only.
          </p>
        </div>
        <Badge variant="outline">no schema update</Badge>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ChoiceGroup
          label="Theme"
          options={["Studio Light", "Midnight", "Editorial"]}
          value={settings.theme}
          onChange={(value) => onChange("theme", value)}
        />
        <ChoiceGroup
          label="Button style"
          options={buttonStyles.map((style) => style.id)}
          value={settings.buttonStyle}
          onChange={(value) => onChange("buttonStyle", value as ButtonStyle)}
        />
        <ChoiceGroup
          label="Button radius"
          options={["8px", "14px", "24px"]}
          value={settings.radius}
          onChange={(value) => onChange("radius", value)}
        />
        <AlignmentChoice
          value={settings.textAlignment}
          onChange={(value) => onChange("textAlignment", value)}
        />
        <ChoiceGroup
          label="Image source mode"
          options={["URL field", "Library", "Generated"]}
          value={settings.imageSourceMode}
          onChange={(value) => onChange("imageSourceMode", value)}
        />
        <ChoiceGroup
          label="Border"
          options={["None", "Soft border", "Strong border"]}
          value={settings.border}
          onChange={(value) => onChange("border", value)}
        />
        <ChoiceGroup
          label="Shadow"
          options={["None", "Low shadow", "Lifted"]}
          value={settings.shadow}
          onChange={(value) => onChange("shadow", value)}
        />
        <ChoiceGroup
          label="Spacing"
          options={["Compact", "Comfortable", "Spacious"]}
          value={settings.spacing}
          onChange={(value) => onChange("spacing", value)}
        />
        <ChoiceGroup
          label="Preview density"
          options={["Dense", "Balanced", "Airy"]}
          value={settings.density}
          onChange={(value) => onChange("density", value)}
        />
      </div>
    </section>
  );
}

function StyleSpecificFields({
  settings,
  onChange,
}: {
  settings: DesignSettings;
  onChange: UpdateDesignSetting;
}) {
  if (settings.buttonStyle === "icon-left") {
    return (
      <div className="grid gap-4">
        <MockInput
          label="Image URL field mock"
          value={settings.imageUrl}
          onChange={(value) => onChange("imageUrl", value)}
        />
        <AlignmentChoice
          value={settings.textAlignment}
          onChange={(value) => onChange("textAlignment", value)}
        />
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">Circular icon preview</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full border bg-background">
              <ImageIcon className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{settings.imageUrl}</p>
          </div>
        </div>
      </div>
    );
  }

  if (settings.buttonStyle === "image-full") {
    return (
      <div className="grid gap-4">
        <MockInput
          label="Background Image URL field mock"
          value={settings.backgroundImageUrl}
          onChange={(value) => onChange("backgroundImageUrl", value)}
        />
        <ChoiceGroup
          label="Aspect selector"
          options={["3:1", "2:1"]}
          value={settings.aspectRatio}
          onChange={(value) => onChange("aspectRatio", value as "3:1" | "2:1")}
        />
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">
            Overlay opacity mock: {settings.overlayOpacity}%
          </span>
          <input
            type="range"
            min={0}
            max={80}
            value={settings.overlayOpacity}
            onChange={(event) => onChange("overlayOpacity", Number(event.target.value))}
            className="mt-3 w-full accent-foreground"
          />
        </label>
        <MockToggle
          label="Text overlay"
          checked={settings.textOverlay}
          onToggle={() => onChange("textOverlay", !settings.textOverlay)}
        />
      </div>
    );
  }

  if (settings.buttonStyle === "text-only") {
    return (
      <div className="grid gap-4">
        <AlignmentChoice
          value={settings.textAlignment}
          onChange={(value) => onChange("textAlignment", value)}
        />
        <ChoiceGroup
          label="Font weight mock"
          options={["Regular", "Semibold", "Bold"]}
          value={settings.fontWeight}
          onChange={(value) => onChange("fontWeight", value)}
        />
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">Minimal preview</p>
          <p
            className={cn(
              "mt-3 text-sm",
              getAlignClass(settings.textAlignment),
              settings.fontWeight === "Bold" && "font-bold",
              settings.fontWeight === "Semibold" && "font-semibold"
            )}
          >
            {settings.title}
          </p>
        </div>
      </div>
    );
  }

  if (settings.buttonStyle === "card-left-image") {
    return (
      <div className="grid gap-4">
        <MockInput
          label="Image URL field mock"
          value={settings.imageUrl}
          onChange={(value) => onChange("imageUrl", value)}
        />
        <MockInput
          label="Title"
          value={settings.title}
          onChange={(value) => onChange("title", value)}
        />
        <MockInput
          label="Description"
          value={settings.description}
          onChange={(value) => onChange("description", value)}
        />
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">Left image card preview</p>
          <StylePreview settings={settings} compact />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <MockInput
        label="Title"
        value={settings.title}
        onChange={(value) => onChange("title", value)}
      />
      <MockTextarea
        label="Body textarea mock"
        value={settings.body}
        onChange={(value) => onChange("body", value)}
      />
      <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Line-break preservation note
        </p>
        <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">{settings.body}</p>
      </div>
    </div>
  );
}

function StylePreview({
  settings,
  compact = false,
}: {
  settings: DesignSettings;
  compact?: boolean;
}) {
  const radiusStyle = { borderRadius: settings.radius };
  const densityClass =
    settings.density === "Dense" ? "p-2" : settings.density === "Airy" ? "p-5" : "p-3";
  const borderClass =
    settings.border === "None"
      ? "border-transparent"
      : settings.border === "Strong border"
        ? "border-foreground/40"
        : "border-border";
  const shadowClass =
    settings.shadow === "None"
      ? "shadow-none"
      : settings.shadow === "Lifted"
        ? "shadow-lg"
        : "shadow-sm";
  const titleClass = cn(
    "font-semibold leading-tight",
    compact ? "text-xs" : "text-sm",
    settings.fontWeight === "Bold" && "font-bold",
    settings.fontWeight === "Regular" && "font-normal"
  );

  if (settings.buttonStyle === "image-full") {
    return (
      <div
        className={cn(
          "relative mt-3 overflow-hidden border bg-foreground text-background",
          shadowClass,
          borderClass,
          settings.aspectRatio === "3:1" ? "aspect-[3/1]" : "aspect-[2/1]"
        )}
        style={radiusStyle}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#111827,#64748b_55%,#f8fafc)]" />
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: settings.overlayOpacity / 100 }}
        />
        {settings.textOverlay ? (
          <div className={cn("absolute inset-0 flex items-end", getJustifyClass(settings.textAlignment))}>
            <div className={cn("max-w-full", densityClass, getAlignClass(settings.textAlignment))}>
              <p className={titleClass}>{settings.title}</p>
              {!compact ? (
                <p className="mt-1 text-xs leading-5 text-background/75">{settings.description}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (settings.buttonStyle === "text-only") {
    return (
      <div
        className={cn(
          "mt-3 border bg-background",
          densityClass,
          borderClass,
          shadowClass,
          getAlignClass(settings.textAlignment)
        )}
        style={radiusStyle}
      >
        <p className={titleClass}>{settings.title}</p>
      </div>
    );
  }

  if (settings.buttonStyle === "card-left-image") {
    return (
      <div
        className={cn(
          "mt-3 grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3 border bg-background",
          densityClass,
          borderClass,
          shadowClass
        )}
        style={radiusStyle}
      >
        <div className="grid min-h-16 place-items-center rounded-lg bg-muted">
          <ImageIcon className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 self-center">
          <p className={cn(titleClass, "truncate")}>{settings.title}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {settings.description}
          </p>
        </div>
      </div>
    );
  }

  if (settings.buttonStyle === "text-panel") {
    return (
      <div
        className={cn(
          "mt-3 border bg-background",
          densityClass,
          borderClass,
          shadowClass,
          getAlignClass(settings.textAlignment)
        )}
        style={radiusStyle}
      >
        <p className={titleClass}>{settings.title}</p>
        <p className="mt-2 text-xs leading-5 whitespace-pre-wrap text-muted-foreground">
          {settings.body}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-3 flex min-w-0 items-center gap-3 border bg-background",
        densityClass,
        borderClass,
        shadowClass,
        settings.textAlignment === "right" && "flex-row-reverse text-right",
        settings.textAlignment === "center" && "justify-center text-center"
      )}
      style={radiusStyle}
    >
      <div className="grid size-11 shrink-0 place-items-center rounded-full border bg-muted">
        <ImageIcon className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className={cn(titleClass, "truncate")}>{settings.title}</p>
        {!compact ? (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {settings.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StaticField({
  label,
  value,
  tall = false,
}: {
  label: string;
  value: string;
  tall?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div
        className={cn(
          "mt-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm break-words",
          tall ? "min-h-20 leading-6" : ""
        )}
      >
        {value}
      </div>
    </div>
  );
}

function MockEditorArea({
  selectedPage,
  selectedBlock,
  selectedLink,
  selectedForm,
  selectedFormFields,
  routing,
  settings,
  validationHints,
}: {
  selectedPage: MockPage;
  selectedBlock: MockBlock;
  selectedLink: MockLinkItem;
  selectedForm: MockFormTemplate;
  selectedFormFields: MockFormField[];
  routing: MockSubmissionRouting;
  settings: DesignSettings;
  validationHints: string[];
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Editor
          </p>
          <h3 className="mt-1 text-base font-semibold">Selected link workspace</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedLink.title} is selected inside {selectedBlock.label} on {selectedPage.route}.
            {selectedForm.title} is the active mock form block. Controls below are local mock UI only.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">no form state save</Badge>
          <Badge variant="outline">no submission</Badge>
          <Badge variant="secondary">{settings.buttonStyle}</Badge>
          {selectedLink.prioritized ? (
            <Badge>
              <Star data-icon="inline-start" />
              prioritized
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border bg-muted/30">
        <div className="grid gap-4 p-4 md:grid-cols-[160px_minmax(0,1fr)]">
          <div className="rounded-xl border bg-background p-3">
            <div className="mx-auto size-20 rounded-full bg-muted" />
            <div className="mt-4 h-2 rounded bg-muted" />
            <div className="mt-2 h-2 w-2/3 rounded bg-muted" />
            <StylePreview settings={settings} compact />
          </div>
          <div className="grid content-center gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{selectedLink.title}</Badge>
              <Badge variant="outline">active style: {settings.buttonStyle}</Badge>
              <StatusBadge value={getLinkStatusLabel(selectedLink)} />
            </div>
            <h4 className="text-2xl font-semibold leading-tight">{selectedPage.headline}</h4>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {selectedLink.description}
            </p>
            <MockValidationHints hints={validationHints} />
            <div className="max-w-xl">
              <StylePreview settings={settings} />
            </div>
            <div className="max-w-xl rounded-xl border bg-background p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{selectedForm.title}</Badge>
                <Badge variant="outline">{routing.destination || "missing destination"}</Badge>
                <Badge variant="outline">no real submit</Badge>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {selectedFormFields.slice(0, 3).map((field) => (
                  <div key={field.id} className="rounded-lg border bg-muted/30 px-3 py-2">
                    <p className="truncate text-xs font-semibold">
                      {field.label || "Untitled field"}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {field.placeholder || field.type}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Active link card
              </p>
              <h4 className="mt-1 truncate text-lg font-semibold">{selectedLink.title}</h4>
            </div>
            <Badge variant="outline">{getStyleLabel(selectedLink.buttonStyle)}</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {selectedLink.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="max-w-full truncate">
              <ExternalLink data-icon="inline-start" />
              {getLinkActionLabel(selectedLink)}
            </Badge>
            {selectedLink.lockType !== "none" ? (
              <Badge variant="secondary">
                <LockKeyhole data-icon="inline-start" />
                {selectedLink.lockType}
              </Badge>
            ) : null}
            {selectedLink.scheduleHideDate ? (
              <Badge variant="outline">
                <CalendarClock data-icon="inline-start" />
                hide {selectedLink.scheduleHideDate}
              </Badge>
            ) : null}
          </div>
          <StylePreview settings={settings} />
        </div>

        <MockStatsGrid link={selectedLink} />
      </div>

      <div className="mt-4 rounded-xl border bg-muted/30 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Active form block
            </p>
            <h4 className="mt-1 truncate text-lg font-semibold">{selectedForm.title}</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={getFormStatusLabel(selectedForm)} />
            <Badge variant="outline">{routing.destination || "missing destination"}</Badge>
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {selectedForm.description}
        </p>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {selectedFormFields.slice(0, 6).map((field) => (
            <div key={field.id} className="rounded-lg border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-medium">
                  {field.label || "Untitled field"}
                </p>
                <Badge variant="outline">{field.type}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                {field.helpText || field.placeholder || "Local mock field"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <StaticField label="Selected route" value={selectedPage.route} />
        <StaticField label="Selected block" value={selectedBlock.label} />
        <StaticField label="Selected link" value={selectedLink.title} />
        <StaticField label="Selected form" value={selectedForm.title} />
        <StaticField label="Mock destination" value={routing.destination || "missing destination"} />
        <StaticField label="Selected style" value={selectedLink.buttonStyle} />
        <StaticField label="Mock URL/action" value={getLinkActionLabel(selectedLink)} />
        <StaticField label="Mock state boundary" value="Local component state only" />
        <StaticField label="Planning note" value={selectedPage.previewNote} tall />
        <StaticField label="Link behavior" value={selectedLink.body} tall />
      </div>
    </section>
  );
}

function MockPropertyInspector({
  selectedBlock,
  selectedLink,
  selectedForm,
  selectedField,
  settings,
  onChange,
  onLinkChange,
  onFieldChange,
  onTogglePrioritized,
  validationHints,
  formValidationHints,
}: {
  selectedBlock: MockBlock;
  selectedLink: MockLinkItem;
  selectedForm: MockFormTemplate;
  selectedField: MockFormField;
  settings: DesignSettings;
  onChange: UpdateDesignSetting;
  onLinkChange: UpdateSelectedLink;
  onFieldChange: UpdateFormField;
  onTogglePrioritized: () => void;
  validationHints: string[];
  formValidationHints: string[];
}) {
  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Property Inspector
          </p>
          <h3 className="mt-1 text-base font-semibold">
            {selectedForm.title} / {selectedField.label || "Untitled field"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Link context: {selectedLink.title} / {getStyleLabel(settings.buttonStyle)}
          </p>
        </div>
        <PanelRight className="size-4 text-muted-foreground" />
      </div>

      <div className="mt-3">
        <SafetyLabelRow />
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Form validation hints
          </p>
          <div className="mt-2">
            <MockValidationHints hints={formValidationHints} />
          </div>
        </div>

        <MockFieldSettingsPanel field={selectedField} onFieldChange={onFieldChange} />

        <PerLinkSettingsPanel
          link={selectedLink}
          settings={settings}
          validationHints={validationHints}
          onLinkChange={onLinkChange}
          onSettingChange={onChange}
          onTogglePrioritized={onTogglePrioritized}
        />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Relevant block controls
          </p>
          <div className="mt-3 grid gap-2">
            {selectedBlock.controls.map((control) => (
              <div key={control} className="rounded-lg border bg-muted/30 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{control}</p>
                  <span className="text-xs text-muted-foreground">mock</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <MockToggle label="Visibility" checked={selectedBlock.state === "enabled"} />
        <MockToggle label="Show on phone" checked />
        <MockToggle label="Show on desktop" checked />
        <MockToggle label="Hide in production" />
      </div>
    </section>
  );
}

function DeviceModeToggle({
  deviceMode,
  onSelectMode,
}: {
  deviceMode: DeviceMode;
  onSelectMode: (mode: DeviceMode) => void;
}) {
  const modes: Array<{ mode: DeviceMode; label: string; icon: typeof Smartphone }> = [
    { mode: "phone", label: "Phone", icon: Smartphone },
    { mode: "desktop", label: "Desktop", icon: Monitor },
  ];

  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-1">
      {modes.map((item) => {
        const Icon = item.icon;
        const selected = deviceMode === item.mode;

        return (
          <button
            key={item.mode}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelectMode(item.mode)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors",
              selected ? "bg-foreground text-background shadow-sm" : "text-foreground hover:bg-background"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function MockDevicePreview({
  selectedPage,
  selectedLink,
  selectedAnalyticsLink,
  selectedForm,
  selectedFormFields,
  routing,
  links,
  settings,
  deviceMode,
  onSelectMode,
}: {
  selectedPage: MockPage;
  selectedLink: MockLinkItem;
  selectedAnalyticsLink: MockTopLinkAnalytics;
  selectedForm: MockFormTemplate;
  selectedFormFields: MockFormField[];
  routing: MockSubmissionRouting;
  links: MockLinkItem[];
  settings: DesignSettings;
  deviceMode: DeviceMode;
  onSelectMode: (mode: DeviceMode) => void;
}) {
  const isPhone = deviceMode === "phone";
  const highlightedLinkId = selectedAnalyticsLink.id || selectedLink.id;

  return (
    <section className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Device Preview
          </p>
          <h3 className="mt-1 text-base font-semibold">Visual only</h3>
        </div>
        <DeviceModeToggle deviceMode={deviceMode} onSelectMode={onSelectMode} />
      </div>

      <div className="mt-4 rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {isPhone ? <Smartphone className="size-4" /> : <Monitor className="size-4" />}
            {isPhone ? "Phone mock preview" : "Desktop compact preview"}
          </div>
          <Eye className="size-4 text-muted-foreground" />
        </div>

        {isPhone ? (
          <div className="mx-auto mt-4 w-full max-w-[190px] rounded-3xl border bg-background p-2 shadow-sm">
            <div className="rounded-2xl bg-muted/40 p-3">
              <div className="h-16 rounded-xl bg-muted" />
              <p className="mt-3 truncate text-center text-xs font-semibold">{selectedPage.title}</p>
              <div className="mt-3">
                <StylePreview settings={settings} compact />
              </div>
              <div className="mt-3 grid gap-1.5">
                {links.slice(0, 3).map((link) => (
                  <div
                    key={link.id}
                    className={cn(
                      "h-5 rounded",
                      link.id === highlightedLinkId ? "bg-foreground" : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 truncate text-center text-[10px] text-muted-foreground">
                Analytics: {selectedAnalyticsLink.title}
              </p>
              <div className="mt-3 rounded-xl border bg-background p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] font-semibold">{selectedForm.title}</p>
                  <Badge variant="outline">form</Badge>
                </div>
                <div className="mt-2 grid gap-1.5">
                  {selectedFormFields.slice(0, 3).map((field) => (
                    <div key={field.id} className="rounded border bg-muted/30 px-2 py-1">
                      <p className="truncate text-[10px] text-muted-foreground">
                        {field.label || "Untitled field"}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 rounded bg-foreground px-2 py-1 text-center text-[10px] font-semibold text-background">
                  Submit mock
                </div>
                <p className="mt-1 text-center text-[10px] text-muted-foreground">no real submit</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border bg-background p-3 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
              <div className="h-32 rounded bg-muted" />
              <div className="grid min-w-0 gap-2">
                <div className="rounded bg-muted/50 p-2">
                  <p className="truncate text-xs font-semibold">{selectedPage.headline}</p>
                </div>
                <StylePreview settings={settings} compact />
                <div className="grid grid-cols-2 gap-2">
                  {links.slice(0, 4).map((link) => (
                    <div
                      key={link.id}
                      className={cn(
                        "rounded p-2",
                        link.id === highlightedLinkId ? "bg-foreground text-background" : "bg-muted/70"
                      )}
                    >
                      <p className="truncate text-[11px] font-medium">{link.title}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border bg-muted/30 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold">{selectedForm.title}</p>
                    <Badge variant="outline">{routing.destination || "missing destination"}</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {selectedFormFields.slice(0, 4).map((field) => (
                      <div key={field.id} className="rounded bg-background px-2 py-1">
                        <p className="truncate text-[11px] text-muted-foreground">
                          {field.label || "Untitled field"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold">Analytics highlight</p>
                      <Badge variant="outline">{selectedAnalyticsLink.ctr}</Badge>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {selectedAnalyticsLink.title}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function AdminUiV2LabPreview() {
  const [selectedPageRoute, setSelectedPageRoute] = useState(mockPages[0].route);
  const [selectedBlockId, setSelectedBlockId] = useState(mockBlocks[0].id);
  const [selectedLinkId, setSelectedLinkId] = useState(initialMockLinks[0].id);
  const [mockLinks, setMockLinks] = useState<MockLinkItem[]>(initialMockLinks);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [designSettings, setDesignSettings] = useState<DesignSettings>(defaultDesignSettings);
  const [selectedFormId, setSelectedFormId] = useState(mockFormTemplates[0].id);
  const [selectedFieldId, setSelectedFieldId] = useState(
    initialMockFormFieldsByForm[mockFormTemplates[0].id][0].id
  );
  const [mockFormFieldsByForm, setMockFormFieldsByForm] =
    useState<Record<string, MockFormField[]>>(initialMockFormFieldsByForm);
  const [mockSubmissionRoutingByForm, setMockSubmissionRoutingByForm] =
    useState<Record<string, MockSubmissionRouting>>(initialMockSubmissionRoutingByForm);
  const [selectedAnalyticsRange, setSelectedAnalyticsRange] =
    useState<AnalyticsTimeRange>("7 days");
  const [selectedAnalyticsLinkId, setSelectedAnalyticsLinkId] =
    useState(initialMockLinks[0].id);
  const [pageSettingsByRoute, setPageSettingsByRoute] =
    useState<Record<string, PageSettings>>(initialPageSettingsByRoute);
  const [dirtyRoutes, setDirtyRoutes] = useState<Record<string, boolean>>({});
  const [publishFlowNote, setPublishFlowNote] = useState(
    "No publish flow action has run. Buttons below only update local mock state."
  );

  const selectedPage = useMemo(
    () => mockPages.find((page) => page.route === selectedPageRoute) ?? mockPages[0],
    [selectedPageRoute]
  );
  const selectedPageSettings = pageSettingsByRoute[selectedPageRoute] ?? initialPageSettingsByRoute["/bn9/main"];
  const selectedBlock = useMemo(
    () => mockBlocks.find((block) => block.id === selectedBlockId) ?? mockBlocks[0],
    [selectedBlockId]
  );
  const selectedLink = useMemo(
    () => mockLinks.find((link) => link.id === selectedLinkId) ?? mockLinks[0],
    [mockLinks, selectedLinkId]
  );
  const selectedForm = useMemo(
    () => mockFormTemplates.find((form) => form.id === selectedFormId) ?? mockFormTemplates[0],
    [selectedFormId]
  );
  const selectedFormFields = useMemo(
    () => mockFormFieldsByForm[selectedForm.id] ?? [],
    [mockFormFieldsByForm, selectedForm.id]
  );
  const selectedField = useMemo(
    () =>
      selectedFormFields.find((field) => field.id === selectedFieldId) ??
      selectedFormFields[0] ??
      initialMockFormFieldsByForm[mockFormTemplates[0].id][0],
    [selectedFieldId, selectedFormFields]
  );
  const selectedSubmissionRouting =
    mockSubmissionRoutingByForm[selectedForm.id] ??
    initialMockSubmissionRoutingByForm[mockFormTemplates[0].id];
  const selectedAnalyticsData = mockAnalyticsByRange[selectedAnalyticsRange];
  const selectedTopLinkAnalytics = useMemo(
    () =>
      selectedAnalyticsData.topLinks.find((link) => link.id === selectedAnalyticsLinkId) ??
      selectedAnalyticsData.topLinks[0],
    [selectedAnalyticsData, selectedAnalyticsLinkId]
  );
  const selectedLinkSettings = useMemo<DesignSettings>(
    () => ({
      ...designSettings,
      buttonStyle: selectedLink.buttonStyle,
      textAlignment: selectedLink.textAlignment,
      imageUrl: selectedLink.imageUrl,
      backgroundImageUrl: selectedLink.backgroundImageUrl,
      title: selectedLink.title,
      description: selectedLink.description,
      body: selectedLink.body,
    }),
    [designSettings, selectedLink]
  );
  const validationHints = useMemo(() => getValidationHints(selectedLink), [selectedLink]);
  const pageValidationHints = useMemo(
    () => getPageValidationHints(selectedPageSettings),
    [selectedPageSettings]
  );
  const formValidationHints = useMemo(
    () => getFormValidationHints(selectedForm, selectedFormFields, selectedSubmissionRouting),
    [selectedForm, selectedFormFields, selectedSubmissionRouting]
  );
  const hasUnsavedPageChanges = Boolean(dirtyRoutes[selectedPageRoute]);

  const updateSelectedLink: UpdateSelectedLink = (key, value) => {
    setMockLinks((current) =>
      current.map((link) => (link.id === selectedLink.id ? { ...link, [key]: value } : link))
    );
  };

  const selectMockForm = (formId: string) => {
    const nextFields = mockFormFieldsByForm[formId] ?? [];
    setSelectedFormId(formId);
    setSelectedFieldId(nextFields[0]?.id ?? "");
  };

  const updateSelectedFormField: UpdateFormField = (key, value) => {
    setMockFormFieldsByForm((current) => ({
      ...current,
      [selectedForm.id]: (current[selectedForm.id] ?? []).map((field) =>
        field.id === selectedField.id ? { ...field, [key]: value } : field
      ),
    }));
  };

  const updateSelectedSubmissionRouting: UpdateSubmissionRouting = (key, value) => {
    setMockSubmissionRoutingByForm((current) => ({
      ...current,
      [selectedForm.id]: {
        ...selectedSubmissionRouting,
        [key]: value,
      },
    }));
  };

  const updatePageSetting: UpdatePageSetting = (key, value) => {
    setPageSettingsByRoute((current) => ({
      ...current,
      [selectedPageRoute]: {
        ...selectedPageSettings,
        [key]: value,
      },
    }));
    setDirtyRoutes((current) => ({ ...current, [selectedPageRoute]: true }));
    setPublishFlowNote("Local page setting changed. Nothing has been saved or published.");
  };

  const updateDesignSetting: UpdateDesignSetting = (key, value) => {
    if (key === "buttonStyle") {
      updateSelectedLink("buttonStyle", value as ButtonStyle);
      return;
    }

    if (key === "textAlignment") {
      updateSelectedLink("textAlignment", value as TextAlign);
      return;
    }

    if (key === "imageUrl") {
      updateSelectedLink("imageUrl", value as string);
      return;
    }

    if (key === "backgroundImageUrl") {
      updateSelectedLink("backgroundImageUrl", value as string);
      return;
    }

    if (key === "title") {
      updateSelectedLink("title", value as string);
      return;
    }

    if (key === "description") {
      updateSelectedLink("description", value as string);
      return;
    }

    if (key === "body") {
      updateSelectedLink("body", value as string);
      return;
    }

    setDesignSettings((current) => ({ ...current, [key]: value }));
  };

  const moveLink = (linkId: string, direction: -1 | 1) => {
    setMockLinks((current) => {
      const currentIndex = current.findIndex((link) => link.id === linkId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [movedLink] = next.splice(currentIndex, 1);
      next.splice(nextIndex, 0, movedLink);
      return next;
    });
  };

  const moveFormField = (fieldId: string, direction: -1 | 1) => {
    setMockFormFieldsByForm((current) => {
      const fields = current[selectedForm.id] ?? [];
      const currentIndex = fields.findIndex((field) => field.id === fieldId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= fields.length) {
        return current;
      }

      const nextFields = [...fields];
      const [movedField] = nextFields.splice(currentIndex, 1);
      nextFields.splice(nextIndex, 0, movedField);

      return {
        ...current,
        [selectedForm.id]: nextFields,
      };
    });
  };

  const togglePrioritizedLink = () => {
    setMockLinks((current) =>
      current.map((link) => ({
        ...link,
        prioritized: link.id === selectedLink.id ? !selectedLink.prioritized : false,
      }))
    );
  };

  const clearSelectedPageDirtyState = () => {
    setDirtyRoutes((current) => ({ ...current, [selectedPageRoute]: false }));
    setPublishFlowNote("Save draft mock cleared the local unsaved badge only.");
  };

  const previewSelectedPageMock = () => {
    setPublishFlowNote(
      `Preview page mock points at ${getMockRoutePreview(selectedPageSettings)} without loading a route.`
    );
  };

  const publishSelectedPageMock = () => {
    setPageSettingsByRoute((current) => ({
      ...current,
      [selectedPageRoute]: {
        ...selectedPageSettings,
        status: "Published",
      },
    }));
    setDirtyRoutes((current) => ({ ...current, [selectedPageRoute]: true }));
    setPublishFlowNote("Publish mock changed only the local status badge to Published.");
  };

  const scheduleSelectedPageMock = () => {
    setPageSettingsByRoute((current) => ({
      ...current,
      [selectedPageRoute]: {
        ...selectedPageSettings,
        status: "Scheduled",
      },
    }));
    setDirtyRoutes((current) => ({ ...current, [selectedPageRoute]: true }));
    setPublishFlowNote("Schedule publish mock changed only the local status badge to Scheduled.");
  };

  return (
    <section className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Admin UI V2
          </p>
          <h2 className="mt-2 text-lg font-semibold">Clickable mock backoffice/editor</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Local-state prototype for a future admin workspace. It does not import real
            editor components, save data, publish pages, call APIs, or update production stores.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">mock only</Badge>
          <Badge variant="outline">active style: {selectedLinkSettings.buttonStyle}</Badge>
          <Badge variant="outline">selected link: {selectedLink.title}</Badge>
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-muted/30 p-3">
        <SafetyLabelRow />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border bg-muted/30">
        <MockTopBar
          selectedPage={selectedPage}
          pageSettings={selectedPageSettings}
          selectedLink={selectedLink}
          deviceMode={deviceMode}
          selectedStyle={selectedLinkSettings.buttonStyle}
          hasUnsavedChanges={hasUnsavedPageChanges}
        />

        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <MockSidebar />

          <div className="grid min-w-0 gap-4 p-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
            <main className="grid min-w-0 content-start gap-4">
              <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <MockPagesArea
                  selectedPage={selectedPage}
                  pageSettingsByRoute={pageSettingsByRoute}
                  dirtyRoutes={dirtyRoutes}
                  onSelectPage={(page) => setSelectedPageRoute(page.route)}
                />
                <MockLinkManager
                  links={mockLinks}
                  selectedLink={selectedLink}
                  onSelectLink={setSelectedLinkId}
                  onMoveLink={moveLink}
                />
              </div>
              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <MockBlockManager
                  selectedBlock={selectedBlock}
                  onSelectBlock={(block) => setSelectedBlockId(block.id)}
                />
                <ButtonStyleSelector
                  value={selectedLinkSettings.buttonStyle}
                  onChange={(value) => updateDesignSetting("buttonStyle", value)}
                />
              </div>
              <MockPageSettingsPanel
                settings={selectedPageSettings}
                validationHints={pageValidationHints}
                hasUnsavedChanges={hasUnsavedPageChanges}
                onChange={updatePageSetting}
              />
              <MockSeoSocialPanel settings={selectedPageSettings} onChange={updatePageSetting} />
              <MockSharePreviewCards
                settings={selectedPageSettings}
                selectedLink={selectedLink}
              />
              <MockPublishFlow
                settings={selectedPageSettings}
                hasUnsavedChanges={hasUnsavedPageChanges}
                publishFlowNote={publishFlowNote}
                onSaveDraft={clearSelectedPageDirtyState}
                onPreview={previewSelectedPageMock}
                onPublish={publishSelectedPageMock}
                onSchedule={scheduleSelectedPageMock}
              />
              <MockPageValidationChecklist
                settings={selectedPageSettings}
                links={mockLinks}
                validationHints={pageValidationHints}
              />
              <MockFormBuilderArea
                forms={mockFormTemplates}
                fieldsByForm={mockFormFieldsByForm}
                selectedForm={selectedForm}
                selectedFields={selectedFormFields}
                routing={selectedSubmissionRouting}
                onSelectForm={selectMockForm}
              />
              <MockFieldBuilder
                fields={selectedFormFields}
                selectedField={selectedField}
                onSelectField={setSelectedFieldId}
                onMoveField={moveFormField}
              />
              <MockSubmissionRoutingPanel
                routing={selectedSubmissionRouting}
                onRoutingChange={updateSelectedSubmissionRouting}
              />
              <MockSubmissionPreview
                selectedForm={selectedForm}
                selectedField={selectedField}
                routing={selectedSubmissionRouting}
              />
              <MockFormValidationChecklist
                selectedForm={selectedForm}
                fields={selectedFormFields}
                routing={selectedSubmissionRouting}
                validationHints={formValidationHints}
              />
              <MockAnalyticsDashboard
                range={selectedAnalyticsRange}
                data={selectedAnalyticsData}
                selectedTopLink={selectedTopLinkAnalytics}
                onRangeChange={setSelectedAnalyticsRange}
              />
              <MockTopLinksAnalytics
                links={selectedAnalyticsData.topLinks}
                selectedTopLink={selectedTopLinkAnalytics}
                onSelectLink={setSelectedAnalyticsLinkId}
              />
              <MockFormAnalyticsPanel forms={selectedAnalyticsData.forms} />
              <MockTrafficDeviceRegionPanel data={selectedAnalyticsData} />
              <MockConversionFunnel steps={selectedAnalyticsData.funnel} />
              <MockInsightsPanel
                insights={selectedAnalyticsData.insights}
                selectedTopLink={selectedTopLinkAnalytics}
                range={selectedAnalyticsRange}
              />
              <DesignPanel settings={selectedLinkSettings} onChange={updateDesignSetting} />
              <MockEditorArea
                selectedPage={selectedPage}
                selectedBlock={selectedBlock}
                selectedLink={selectedLink}
                selectedForm={selectedForm}
                selectedFormFields={selectedFormFields}
                routing={selectedSubmissionRouting}
                settings={selectedLinkSettings}
                validationHints={validationHints}
              />
            </main>

            <aside className="grid min-w-0 content-start gap-4 xl:grid-cols-2 2xl:grid-cols-1">
              <MockPropertyInspector
                selectedBlock={selectedBlock}
                selectedLink={selectedLink}
                selectedForm={selectedForm}
                selectedField={selectedField}
                settings={selectedLinkSettings}
                onChange={updateDesignSetting}
                onLinkChange={updateSelectedLink}
                onFieldChange={updateSelectedFormField}
                onTogglePrioritized={togglePrioritizedLink}
                validationHints={validationHints}
                formValidationHints={formValidationHints}
              />
              <MockDevicePreview
                selectedPage={selectedPage}
                selectedLink={selectedLink}
                selectedAnalyticsLink={selectedTopLinkAnalytics}
                selectedForm={selectedForm}
                selectedFormFields={selectedFormFields}
                routing={selectedSubmissionRouting}
                links={mockLinks}
                settings={selectedLinkSettings}
                deviceMode={deviceMode}
                onSelectMode={setDeviceMode}
              />
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
