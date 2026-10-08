/** Owner-authorized previews retain model provenance and never claim a full listening review. */
export interface TimingApproval {
  reviewStatus: "approved" | "owner-preview";
  source: string;
  authoredBy: string;
  reviewedBy: string;
  reviewedAt: string;
  acceptedBy?: string;
  acceptedAt?: string;
}

function validDate(value: string | undefined) {
  return Boolean(
    value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value,
  );
}

export function validTimingApproval(value: TimingApproval) {
  if (!value.source?.trim() || !value.authoredBy?.trim()) return false;
  if (value.reviewStatus === "owner-preview")
    return Boolean(
      value.acceptedBy?.trim() &&
      value.acceptedBy.trim() !== value.authoredBy.trim() &&
      validDate(value.acceptedAt) &&
      !value.reviewedBy &&
      !value.reviewedAt,
    );
  return (
    value.reviewStatus === "approved" &&
    Boolean(
      value.reviewedBy?.trim() && value.reviewedBy.trim() !== value.authoredBy.trim() && validDate(value.reviewedAt),
    )
  );
}
