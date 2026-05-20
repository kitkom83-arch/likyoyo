"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";

import { MockAnalyticsDashboard, MockConversionFunnel, MockFormAnalyticsPanel, MockInsightsPanel, MockTopLinksAnalytics, MockTrafficDeviceRegionPanel } from "./admin-ui-v2/mock-analytics";
import {
  defaultDesignSettings,
  initialMockFormFieldsByForm,
  initialMockLinks,
  initialMockSubmissionRoutingByForm,
  initialPageSettingsByRoute,
  mockAnalyticsByRange,
  mockBlocks,
  mockFormTemplates,
  mockPages,
} from "./admin-ui-v2/mock-data";
import { MockFieldBuilder, MockFormBuilderArea, MockFormValidationChecklist, MockSubmissionPreview, MockSubmissionRoutingPanel } from "./admin-ui-v2/mock-forms";
import { ButtonStyleSelector, DesignPanel } from "./admin-ui-v2/mock-links";
import { MockDevicePreview, MockEditorArea, MockPropertyInspector } from "./admin-ui-v2/mock-preview";
import { MockPageSettingsPanel, MockPageValidationChecklist, MockPublishFlow, MockSeoSocialPanel, MockSharePreviewCards } from "./admin-ui-v2/mock-page-settings";
import { MockBlockManager, MockLinkManager, MockPagesArea, MockSidebar, MockTopBar, SafetyLabelRow } from "./admin-ui-v2/mock-shared";
import type {
  AnalyticsTimeRange,
  ButtonStyle,
  DesignSettings,
  DeviceMode,
  MockFormField,
  MockLinkItem,
  MockSubmissionRouting,
  PageSettings,
  TextAlign,
  UpdateDesignSetting,
  UpdateFormField,
  UpdatePageSetting,
  UpdateSelectedLink,
  UpdateSubmissionRouting,
} from "./admin-ui-v2/types";
import {
  getFormValidationHints,
  getMockRoutePreview,
  getPageValidationHints,
  getValidationHints,
} from "./admin-ui-v2/mock-utils";

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
