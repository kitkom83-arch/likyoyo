import { ArrowDown, ArrowUp, CheckCircle2, FileText, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { formFieldTypeOptions, submissionDestinationOptions } from "./mock-data";
import { StaticField } from "./mock-links";
import {
  ChoiceGroup,
  MockInput,
  MockTextarea,
  MockToggle,
  MockValidationHints,
  StatusBadge,
} from "./mock-shared";
import type {
  FormFieldType,
  MockFormField,
  MockFormTemplate,
  MockSubmissionRouting,
  SubmissionDestination,
  UpdateFormField,
  UpdateSubmissionRouting,
} from "./types";
import {
  getFormStatusLabel,
  getFormValidationItems,
  getMockSubmissionStatus,
  requiresOptions,
} from "./mock-utils";

export function MockFormBuilderArea({
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

export function MockFieldBuilder({
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

export function MockFieldSettingsPanel({
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

export function MockSubmissionRoutingPanel({
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

export function MockSubmissionPreview({
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

export function MockFormValidationChecklist({
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
