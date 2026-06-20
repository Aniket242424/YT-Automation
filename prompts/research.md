# Workflow B — Research prompt (Claude, web search ON)
# Produces the fact_pack that the script and fact-check nodes both rely on.

Research this topic for a factual Indian finance video: {{topic}} ({{angle}}).

Return JSON only:
{
  "facts": [ { "claim": "", "source_url": "", "source_date": "YYYY-MM-DD" } ],
  "key_numbers": [ { "label": "", "value": "", "source_url": "" } ],
  "caveats": [ "" ]
}

Rules:
- Only include facts you can attribute to a NAMED source with a date.
- Prefer sources from the last 30 days; never older than the 3-month price-lag rule
  for any live security price.
- Do not infer or estimate numbers — if you can't source it, leave it out.
- No buy/sell framing, no price predictions.
