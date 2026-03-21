import React, { forwardRef } from "react";

export type JobCardItem = {
  item: string;
  description: string;
  location?: string;
  quantity: number | string;
};

export type JobCardPrintProps = {
  company?: {
    name: string;
    address1?: string;
    address2?: string;
    phone?: string;
    mobile?: string;
    email?: string;
  };
  customer?: {
    name: string;
    address1?: string;
    address2?: string;
    phone?: string;
    mobile?: string;
    email?: string;
  };
  jobCard?: {
    title?: string;
    postDate?: string;
    jobCardNo?: string;
    newOdometer?: string;
    barcodeValue?: string;
  };
  vehicle?: {
    registration?: string;
    make?: string;
    model?: string;
    modelSeries?: string;
    modelCode?: string;
    colour?: string;
    prodDate?: string;
    nextService?: string;
    regoDue?: string;
    engineNo?: string;
    engineCode?: string;
    vin?: string;
    buildDate?: string;
    chassisNo?: string;
    litres?: string;
    trans?: string;
    air?: string;
    cyl?: string;
    body?: string;
    odo?: string;
    hours?: string;
    summary?: string;
    vehicleType?: string;
    transportName?: string;
  };
  alignment?: {
    beforeFrontCamber?: string;
    beforeFrontCaster?: string;
    beforeFrontToe?: string;
    beforeRearCamber?: string;
    beforeRearToe?: string;
    afterFrontCamber?: string;
    afterFrontCaster?: string;
    afterFrontToe?: string;
    afterRearCamber?: string;
    afterRearToe?: string;
  };
  staff?: {
    technicianName?: string;
    technicianId?: string;
  };
  jobDetails?: {
    serviceType?: string;
    workType?: string;
    problemReported?: string;
    workDone?: string;
    remarks?: string;
  };
  items?: JobCardItem[];
  notes?: string;
};

const FieldRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) => (
  <div className="jc-field-row">
    <span className="jc-label">{label}</span>
    <span className="jc-value">{value || "-"}</span>
  </div>
);

const JobCardPrint = forwardRef<HTMLDivElement, JobCardPrintProps>(
  (
    {
      company,
      customer,
      jobCard,
      vehicle,
      alignment,
      staff,
      jobDetails,
      items = [],
      notes,
    },
    ref
  ) => {
    return (
      <div ref={ref} className="jobcard-print-root">
        <div className="jobcard-print-page">
          <div className="jobcard-header">
            <div className="jobcard-header-left">
              <div className="jc-section-title">Customer:</div>
              <div className="jc-customer-name">{customer?.name || "-"}</div>
              <div>{customer?.address1 || ""}</div>
              <div>{customer?.address2 || ""}</div>
              <div>{customer?.phone || ""}</div>
              <div>{customer?.mobile || ""}</div>
              <div>{customer?.email || ""}</div>
            </div>

            <div className="jobcard-header-right">
              <div className="jc-main-title">
                {jobCard?.title || "Repair Order / Job Card"}
              </div>

              <div className="jc-top-meta">
                <div className="jc-meta-row">
                  <span>Post Date</span>
                  <span>{jobCard?.postDate || "-"}</span>
                </div>
                <div className="jc-meta-row">
                  <span>Job Card</span>
                  <span>{jobCard?.jobCardNo || "-"}</span>
                </div>
                <div className="jc-meta-row">
                  <span>New Odometer</span>
                  <span className="jc-line-value">
                    {jobCard?.newOdometer || ""}
                  </span>
                </div>
              </div>

              <div className="jc-barcode-box">
                <div className="jc-barcode-text">
                  {jobCard?.barcodeValue || jobCard?.jobCardNo || ""}
                </div>
              </div>
            </div>
          </div>

          <div className="jc-vehicle-box">
            <div className="jc-vehicle-grid">
              <div className="jc-col">
                <FieldRow label="Registration" value={vehicle?.registration} />
                <FieldRow label="Make" value={vehicle?.make} />
                <FieldRow label="Model" value={vehicle?.model} />
                <FieldRow label="Model Series" value={vehicle?.modelSeries} />
                <FieldRow label="Model Code" value={vehicle?.modelCode} />
                <FieldRow label="Colour" value={vehicle?.colour} />
                <FieldRow label="Prod Date" value={vehicle?.prodDate} />
              </div>

              <div className="jc-col">
                <FieldRow label="Next Service" value={vehicle?.nextService} />
                <FieldRow label="Rego Due" value={vehicle?.regoDue} />
                <FieldRow label="Engine #" value={vehicle?.engineNo} />
                <FieldRow label="Engine Code" value={vehicle?.engineCode} />
                <FieldRow label="VIN" value={vehicle?.vin} />
                <FieldRow label="Build Date" value={vehicle?.buildDate} />
                <FieldRow label="Chassis #" value={vehicle?.chassisNo} />
              </div>

              <div className="jc-col">
                <FieldRow label="Litres" value={vehicle?.litres} />
                <FieldRow label="Trans" value={vehicle?.trans} />
                <FieldRow label="Air" value={vehicle?.air} />
                <FieldRow label="Cyl" value={vehicle?.cyl} />
                <FieldRow label="Body" value={vehicle?.body} />
                <FieldRow label="Odo" value={vehicle?.odo} />
                <FieldRow label="Hours" value={vehicle?.hours} />
              </div>
            </div>

            <div className="jc-summary-line">{vehicle?.summary || ""}</div>
          </div>
          {/* Alignment Measurements */}
          {(alignment || staff || jobDetails) && (
            <div className="jc-details-section">
              <div className="jc-details-grid">
                <div className="jc-details-col">
                  <div className="jc-section-title">Job Details:</div>
                  <FieldRow label="Service Type" value={jobDetails?.serviceType} />
                  <FieldRow label="Work Type" value={jobDetails?.workType} />
                  <FieldRow label="Technician" value={staff?.technicianName} />
                  <div className="mt-2">
                    <div className="jc-label">Complaint:</div>
                    <div className="jc-text-box">{jobDetails?.problemReported || "-"}</div>
                  </div>
                </div>
                
                <div className="jc-details-col">
                  <div className="jc-section-title">Alignment (Before):</div>
                  <div className="jc-alignment-compact">
                    <FieldRow label="F. Camber" value={alignment?.beforeFrontCamber} />
                    <FieldRow label="F. Caster" value={alignment?.beforeFrontCaster} />
                    <FieldRow label="F. Toe" value={alignment?.beforeFrontToe} />
                    <FieldRow label="R. Camber" value={alignment?.beforeRearCamber} />
                    <FieldRow label="R. Toe" value={alignment?.beforeRearToe} />
                  </div>
                </div>

                <div className="jc-details-col">
                  <div className="jc-section-title">Alignment (After):</div>
                  <div className="jc-alignment-compact">
                    <FieldRow label="F. Camber" value={alignment?.afterFrontCamber} />
                    <FieldRow label="F. Caster" value={alignment?.afterFrontCaster} />
                    <FieldRow label="F. Toe" value={alignment?.afterFrontToe} />
                    <FieldRow label="R. Camber" value={alignment?.afterRearCamber} />
                    <FieldRow label="R. Toe" value={alignment?.afterRearToe} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="jc-section-subtitle">Service Items & Labour:</div>
          <table className="jc-items-table">
            <thead>
              <tr>
                <th style={{ width: "23%" }}>Item</th>
                <th style={{ width: "37%" }}>Description</th>
                <th style={{ width: "25%" }}>Location</th>
                <th style={{ width: "15%", textAlign: "right" }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((row, index) => (
                  <tr key={index}>
                    <td>{row.item}</td>
                    <td>{row.description}</td>
                    <td>{row.location || ""}</td>
                    <td style={{ textAlign: "right" }}>{row.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="jc-empty-row">
                    No items added
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="jc-notes-section">
            <div className="jc-notes-title">Job Card Notes</div>
            <div className="jc-notes-content">
              {notes
                ? notes.split("\n").map((line: string, idx: number) => <div key={idx}>{line}</div>)
                : "No notes"}
            </div>
          </div>

          <div className="jc-footer">
            <div>
              <strong>{company?.name || "KK Enterprises"}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

JobCardPrint.displayName = "JobCardPrint";

export default JobCardPrint;
