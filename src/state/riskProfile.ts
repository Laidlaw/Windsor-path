export type RiskScores = {
  audit: number;
  documentary: number;
  temporal: number;
  judgment: number;
  overall: number;
  tone: "low" | "moderate" | "high";
  notes: string[];
};

const clamp = (val: number) => Math.max(0, Math.min(100, val));

export function calculateRiskProfile(answers: Record<string, unknown>): RiskScores {
  const scores = {
    audit: 15,
    documentary: 15,
    temporal: 10,
    judgment: 15,
  };
  const notes: string[] = [];

  const bump = (key: keyof typeof scores, amount: number, note?: string) => {
    scores[key] = clamp(scores[key] + amount);
    if (note) notes.push(note);
  };

  const movement = answers["movement_type"] as string | undefined;
  if (movement === "row_to_ni") {
    bump("audit", 10, "Third-country origin often triggers extra scrutiny");
    bump("documentary", 10);
  }
  if (movement === "ni_to_gb") {
    bump("audit", -5);
    bump("documentary", -5);
  }

  const sector = answers["sector_gate"] as string[] | undefined;
  if (Array.isArray(sector)) {
    if (sector.includes("sps")) {
      bump("documentary", 20, "SPS goods increase evidence burden");
      bump("audit", 10);
      bump("judgment", 5);
    }
    if (sector.includes("excise")) {
      bump("audit", 15, "Excise goods see higher enforcement");
      bump("documentary", 10);
      bump("temporal", 5);
    }
    if (sector.includes("controlled")) {
      bump("judgment", 20, "Controlled goods rely on correct classification");
      bump("documentary", 15);
    }
  }

  const ukims = answers["ukims_auth"] as string | undefined;
  if (ukims === "yes") {
    bump("audit", -5);
    bump("documentary", -5);
  } else if (ukims === "no") {
    bump("audit", 20, "No UKIMS increases checks");
    bump("documentary", 15);
    bump("judgment", 10);
  } else if (ukims === "unsure") {
    bump("audit", 10, "Unclear authorization status");
    bump("judgment", 10);
  }

  const turnover = answers["turnover_check"] as string | undefined;
  if (turnover === "over_2m") {
    bump("audit", 10, "Higher turnover can target audits");
    bump("documentary", 10);
  } else if (turnover === "unsure") {
    bump("judgment", 5);
  }

  const purpose = answers["goods_purpose"] as string | undefined;
  if (purpose === "process_ni") {
    bump("judgment", 20, "Processing claims require interpretation");
    bump("documentary", 10);
    bump("temporal", 10);
  }
  if (purpose === "sell_ni_gb") {
    bump("temporal", 25, "Relies on predicting customer behavior");
    bump("documentary", 15);
  }
  if (purpose === "might_sell_eu") {
    bump("temporal", 30, "Uncertain destination");
    bump("audit", 10);
    bump("judgment", 10);
  }

  const approved = answers["approved_purpose_check"] as string | undefined;
  if (approved === "no") {
    bump("judgment", 15, "Not approved purpose increases interpretation risk");
    bump("audit", 10);
    bump("temporal", 10);
    bump("documentary", 15);
  } else if (approved === "unsure") {
    bump("judgment", 10);
    bump("temporal", 10);
  }

  const evidence = answers["evidence_check"] as string | undefined;
  if (evidence === "yes") {
    bump("documentary", 5);
    bump("temporal", 10, "Need to monitor over time");
  } else if (evidence === "no") {
    bump("documentary", 25, "Evidence gap drives cost");
    bump("audit", 10);
    bump("temporal", 20);
  } else if (evidence === "unsure") {
    bump("documentary", 15);
    bump("temporal", 15);
  }

  const values = Object.values(scores);
  const overall = clamp(Math.max(...values));
  const tone = overall >= 70 ? "high" : overall >= 40 ? "moderate" : "low";

  return { ...scores, overall, tone, notes };
}
