import type { FlowData } from "./types";

export const flowData: FlowData = {
            "scenarios": {
              "gb_to_ni": {
                "label": "Great Britain → Northern Ireland",
                "start": "sector_gate"
              },
              "ni_to_gb": {
                "label": "Northern Ireland → Great Britain",
                "start": "ni_to_gb_result"
              },
              "eu_to_ni": {
                "label": "EU → Northern Ireland",
                "start": "eu_free_movement_result"
              },
              "row_to_ni": {
                "label": "Rest of World → Northern Ireland",
                "start": "row_redirect_result"
              }
            },
            "nodes": {
              "movement_type": {
                "id": "movement_type",
                "tier": "movement",
                "question": "Let's start at the beginning and the end.",
                "type": "single_choice",
                "help": "Think about the physical journey the goods are making — not paperwork or customers yet.",
                "complexity": 0,
                "expectation": {
                  "typical_steps": "4–7 questions",
                  "common_triggers": [
                    "food or animal products",
                    "selling into the EU",
                    "lack of evidence that goods stay in the UK"
                  ]
                },
                "options": [
                  {
                    "label": "From Great Britain to Northern Ireland",
                    "value": "gb_to_ni",
                    "sets": { "scenario": "gb_to_ni" },
                    "next": "sector_gate"
                  },
                  {
                    "label": "From Northern Ireland to Great Britain",
                    "value": "ni_to_gb",
                    "sets": { "scenario": "ni_to_gb"  },
                    "next": "ni_to_gb_flow"
                  },
                  {
                    "label": "From Northern Ireland to the EU",
                    "value": "ni_to_eu",
                    "sets": { "scenario": "ni_to_eu" },
                    "next": "ni_export_check"
                  },
                  {
                    "label": "From the EU into Northern Ireland",
                    "value": "eu_to_ni",
                    "sets": { "scenario": "eu_to_ni" },
                    "next": "eu_free_movement"
                  },
                  {
                    "label": "From outside the UK or EU into Northern Ireland",
                    "value": "row_to_ni",
                    "sets": { "scenario": "row_to_ni" },
                    "next": "redirect_row"
                  },
                  {
                    "label": "I'm not sure / it's complicated",
                    "value": "unsure",
                    "adds_complexity": 2,
                    //"next": "movement_helper"
                  }
                ]
              },
              "sector_gate": {
                "id": "sector_gate",
                "tier": "sector",
                "question": "Do any of the following apply to these goods?",
                "type": "multi_choice",
                "help": "Some goods trigger additional rules regardless of whether they are 'at risk' or not.",
                "complexity": 1,
                "options": [
                  { "label": "Food, plants, animals, or animal feed (SPS)", "value": "sps", "adds_complexity": 4 },
                  { "label": "Alcohol, tobacco, fuel (excise goods)", "value": "excise", "adds_complexity": 3 },
                  { "label": "Medicines, chemicals, controlled goods", "value": "controlled", "adds_complexity": 5 },
                  { "label": "None of the above / not sure", "value": "none" }
                ],
                "next": "ukims_auth"
              },
              // "origin_check": {
              //   "id": "origin_check",
              //   "question": "Where are your goods coming from?",
              //   "type": "single_choice",
              //   "help": "This determines which customs rules apply to your shipment.",
              //   "complexity": 0,
              //   "options": [
              //     {
              //       "label": "Great Britain (England, Scotland, Wales)",
              //       "value": "gb",
              //       "next": "destination_check"
              //     },
              //     {
              //       "label": "Northern Ireland",
              //       "value": "ni",
              //       "next": "ni_destination_check"
              //     },
              //     {
              //       "label": "European Union",
              //       "value": "eu",
              //       "next": "destination_check"
              //     },
              //     {
              //       "label": "Rest of World (e.g., Australia, USA, China)",
              //       "value": "row",
              //       "next": "destination_check"
              //     }
              //   ]
              // },
              // "destination_check": {
              //   "id": "destination_check",
              //   "question": "Where are the goods going?",
              //   "type": "single_choice",
              //   "help": "The destination determines which regulatory framework applies.",
              //   "complexity": 0,
              //   "options": [
              //     {
              //       "label": "Northern Ireland",
              //       "value": "ni",
              //       "next": "determine_flow"
              //     },
              //     {
              //       "label": "Great Britain (England, Scotland, Wales)",
              //       "value": "gb",
              //       "next": "ni_to_gb_check"
              //     },
              //     {
              //       "label": "Ireland (Republic of Ireland)",
              //       "value": "ie",
              //       "next": "ni_export_check"
              //     },
              //     {
              //       "label": "Other EU country",
              //       "value": "eu",
              //       "next": "ni_export_check"
              //     },
              //     {
              //       "label": "Rest of World",
              //       "value": "row",
              //       "next": "standard_export"
              //     }
              //   ]
              // },
              "ni_destination_check": {
                "id": "ni_destination_check",
                "question": "Where are the goods going?",
                "type": "single_choice",
                "help": "Goods leaving Northern Ireland have different requirements depending on destination.",
                "complexity": 0,
                "options": [
                  {
                    "label": "Staying in Northern Ireland",
                    "value": "ni",
                    "next": "no_customs_needed"
                  },
                  {
                    "label": "Great Britain (England, Scotland, Wales)",
                    "value": "gb",
                    "next": "ni_to_gb_flow"
                  },
                  {
                    "label": "Ireland (Republic of Ireland)",
                    "value": "ie",
                    "next": "ni_export_check"
                  },
                  {
                    "label": "Other EU country",
                    "value": "eu",
                    "next": "ni_export_check"
                  },
                  {
                    "label": "Rest of World",
                    "value": "row",
                    "next": "standard_export"
                  }
                ]
              },
              // "determine_flow": {
              //   "id": "determine_flow",
              //   "type": "router",
              //   "complexity": 0
              // },
              "no_customs_needed": {
                "id": "no_customs_needed",
                "type": "result",
                "result_type": "simple",
                "complexity": 0,
                "title": "No Customs Procedures Required",
                "summary": "Goods staying within Northern Ireland don't require customs declarations",
                "explanation": "Since your goods are both originating and staying in Northern Ireland, no special Windsor Framework procedures apply. This is domestic movement within NI.",
                "actions": []
              },
              "ni_to_gb_check": {
                "id": "ni_to_gb_check",
                "type": "result",
                "result_type": "simple",
                "complexity": 0,
                "title": "NI to GB Movement",
                "summary": "Simplified procedures for NI to GB movements",
                "explanation": "Goods moving from NI to GB generally face minimal friction. Most movements don't require customs declarations unless specific goods are involved (e.g., excise goods, controlled items).",
                "actions": [
                  {
                    "priority": "immediate",
                    "title": "Check if your goods require special procedures",
                    "description": "Some goods like alcohol, tobacco, or controlled items have additional requirements",
                    "link": "https://www.gov.uk/guidance/moving-goods-from-northern-ireland-to-the-rest-of-the-uk"
                  }
                ]
              },
              "ni_to_gb_flow": {
                "id": "ni_to_gb_flow",
                "type": "result",
                "result_type": "simple",
                "complexity": 2,
                "title": "NI to GB Movement",
                "summary": "Generally straightforward with minimal requirements",
                "explanation": "Goods moving from NI to GB face minimal procedures under the Windsor Framework. For most goods, no customs declarations are needed.",
                "actions": [
                  {
                    "priority": "immediate",
                    "title": "Check for exceptions",
                    "description": "Excise goods (alcohol, tobacco) and some controlled items need additional procedures",
                    "link": "https://www.gov.uk/guidance/moving-goods-from-northern-ireland-to-the-rest-of-the-uk"
                  }
                ]
              },
              "ni_export_check": {
                "id": "ni_export_check",
                "type": "result",
                "result_type": "simple",
                "complexity": 3,
                "title": "Exporting from NI to Ireland/EU",
                "summary": "No customs declarations needed for NI to IE/EU movements",
                "explanation": "Under the Windsor Framework, goods moving from Northern Ireland to Ireland or other EU countries can move freely without customs declarations at the border. However, VAT and excise rules still apply.",
                "requirements": [
                  {
                    "category": "VAT Requirements",
                    "items": [
                      "Register for VAT if not already registered",
                      "Charge appropriate VAT rate or zero-rate for business-to-business sales",
                      "File VAT returns"
                    ]
                  },
                  {
                    "category": "Documentation",
                    "items": [
                      "Commercial invoices required",
                      "For business sales: customer VAT number validation recommended",
                      "Keep records for 6 years"
                    ]
                  }
                ],
                "actions": [
                  {
                    "priority": "immediate",
                    "title": "Understand VAT requirements",
                    "description": "Check if you need to charge VAT and at what rate",
                    "link": "https://www.gov.uk/guidance/vat-exports-dispatches-and-supplying-goods-abroad"
                  }
                ]
              },
              "standard_export": {
                "id": "standard_export",
                "type": "result",
                "result_type": "moderate",
                "complexity": 5,
                "title": "Exporting to Rest of World",
                "summary": "Standard export procedures apply",
                "explanation": "Exports to countries outside the UK and EU require standard customs export procedures, regardless of where in the UK you're exporting from.",
                "requirements": [
                  {
                    "category": "Customs Procedures",
                    "items": [
                      "Export customs declaration required",
                      "Get EORI number if you don't have one",
                      "Classify goods with correct commodity code"
                    ]
                  },
                  {
                    "category": "Documentation",
                    "items": [
                      "Commercial invoice",
                      "Packing list",
                      "Certificate of origin (if required by destination country)",
                      "Any licenses or permits for controlled goods"
                    ]
                  }
                ],
                "actions": [
                  {
                    "priority": "immediate",
                    "title": "Register for export procedures",
                    "description": "Get EORI number and register for customs systems",
                    "link": "https://www.gov.uk/eori"
                  },
                  {
                    "priority": "before_first_shipment",
                    "title": "Consider using freight forwarder",
                    "description": "They can handle customs procedures and documentation",
                    "link": null
                  }
                ]
              },
              "eu_free_movement": {
                "id": "eu_free_movement",
                "type": "result",
                "result_type": "simple",
                "complexity": 0,
                "title": "No Windsor Framework Requirements",
                "summary": "Goods can move freely from the EU into Northern Ireland",
                "explanation": "Under the Windsor Framework, goods moving from the EU to Northern Ireland face minimal friction. No customs declarations or special procedures are required for EU→NI movements.",
                "actions": []
              },
              "redirect_row": {
                "id": "redirect_row",
                "type": "result",
                "result_type": "edge_case",
                "complexity": 10,
                "title": "Rest of World imports require different assessment",
                "summary": "Goods from outside the EU and GB have different rules",
                "explanation": "Importing from outside the EU and GB has different rules and always requires full customs declarations. This is a more complex scenario that would need its own flowchart.",
                "recommendations": [
                  {
                    "title": "Contact HMRC Trader Support Service (TSS)",
                    "description": "TSS can guide you through Rest of World import requirements",
                    "contact": "0800 161 5837",
                    "link": "https://www.tradersupportservice.co.uk"
                  }
                ],
                "why_complex": [
                  "All RoW goods require full customs declarations",
                  "Different tariff calculations apply",
                  "Additional documentation requirements"
                ]
              },
              "ukims_auth": {
                "id": "ukims_auth",
                "tier": "goods",
                "question": "Is your business authorized under the UK Internal Market Scheme (UKIMS)?",
                "type": "single_choice",
                "help": "UKIMS authorization allows you to declare goods as 'not at risk' of entering the EU market. Most small businesses are NOT authorized under UKIMS.",
                "complexity": 2,
                "learn_more": {
                  "title": "What is UKIMS?",
                  "content": "The UK Internal Market Scheme allows authorized businesses to move goods from GB to NI with simplified procedures. To get UKIMS authorization, you need to apply to HMRC and prove your goods will stay in the UK market. Most SMEs don't have this authorization."
                },
                "options": [
                  {
                    "label": "Yes, we have UKIMS authorization",
                    "value": "yes",
                    "next": "category1_check"
                  },
                  {
                    "label": "No, we don't have UKIMS",
                    "value": "no",
                    "next": "category1_check"
                  },
                  {
                    "label": "I'm not sure / What is UKIMS?",
                    "value": "unsure",
                    "next": "ukims_helper",
                    "adds_complexity": 1
                  }
                ]
              },
              "ukims_helper": {
                "id": "ukims_helper",
                "type": "helper",
                "question": "Let me help you figure out if you have UKIMS authorization",
                "explanation": "UKIMS authorization is something you would have specifically applied for with HMRC. If you haven't gone through a formal application process with HMRC for 'UK Internal Market Scheme', you don't have it.",
                "complexity": 3,
                "followup": {
                  "question": "Have you ever applied to HMRC for UK Internal Market Scheme authorization?",
                  "options": [
                    {
                      "label": "Yes, we applied and were approved",
                      "value": "yes_approved",
                      "sets": {"ukims_auth": "yes"},
                      "next": "category1_check"
                    },
                    {
                      "label": "No, we haven't applied",
                      "value": "no_applied",
                      "sets": {"ukims_auth": "no"},
                      "next": "category1_check"
                    }
                  ]
                }
              },
              "category1_check": {
                "id": "category1_check",
                "tier": "goods",
                "question": "Are the goods you're moving 'Category 1 goods'?",
                "type": "single_choice",
                "help": "Category 1 goods are items subject to EU trade restrictions, sanctions, or quotas. Most everyday business goods are NOT Category 1.",
                "complexity": 5,
                "learn_more": {
                  "title": "What are Category 1 goods?",
                  "content": "Category 1 goods include:\n• Items subject to EU sanctions (e.g., certain Russian goods)\n• Items with EU trade defence measures\n• Items subject to EU tariff quotas\n• Typically: steel, solar panels, certain chemicals\n\nMost small businesses do NOT deal with Category 1 goods. Common items like food, electronics, clothing, furniture are NOT Category 1."
                },
                "options": [
                  {
                    "label": "Yes, these are Category 1 goods",
                    "value": "yes",
                    "next": "at_risk_result",
                    "adds_complexity": 5
                  },
                  {
                    "label": "No, these are NOT Category 1 goods",
                    "value": "no",
                    "next": "turnover_check"
                  },
                  {
                    "label": "I'm not sure",
                    "value": "unsure",
                    "next": "category1_helper",
                    "adds_complexity": 2
                  }
                ]
              },
              "category1_helper": {
                "id": "category1_helper",
                "type": "helper",
                "question": "Let me help you determine if your goods are Category 1",
                "explanation": "Category 1 goods are rare. They're typically industrial products subject to EU sanctions or trade measures.",
                "complexity": 6,
                "followup": {
                  "question": "What type of product are you moving?",
                  "type": "text_input",
                  "placeholder": "e.g., craft beer, handmade furniture, electronic components",
                  "hint": "Just describe what you sell in simple terms",
                  "analysis": {
                    "likely_not_category1": [
                      "food", "drink", "furniture", "clothing", "electronics", 
                      "consumer goods", "retail", "craft", "handmade", "artisan",
                      "beer", "wine", "bread", "coffee", "tea", "household"
                    ],
                    "possibly_category1": [
                      "steel", "aluminum", "solar", "chemicals", "industrial",
                      "oil", "gas", "military", "dual-use"
                    ],
                    "default_next": "category1_verdict"
                  }
                }
              },
              "category1_verdict": {
                "id": "category1_verdict",
                "type": "verdict",
                "complexity": 6,
                "assessment": {
                  "if_not_category1": {
                    "message": "Based on your description, your goods are almost certainly NOT Category 1.",
                    "explanation": "Category 1 is reserved for industrial goods subject to EU trade restrictions. Regular business goods like yours don't fall into this category.",
                    "sets": {"category1_check": "no"},
                    "next": "turnover_check"
                  },
                  "if_possibly_category1": {
                    "message": "Your goods MIGHT be Category 1 - this needs professional verification",
                    "explanation": "Some industrial products are subject to EU trade measures. You should verify with a customs broker or HMRC.",
                    "adds_complexity": 8,
                    "next": "edge_case_professional_help"
                  }
                }
              },
              "turnover_check": {
                "id": "turnover_check",
                "question": "Was your business's turnover less than £2 million in the last financial year?",
                "type": "single_choice",
                "help": "This helps determine if certain simplified procedures are available to you.",
                "complexity": 3,
                "options": [
                  {
                    "label": "Yes, under £2 million",
                    "value": "under_2m",
                    "next": "goods_purpose"
                  },
                  {
                    "label": "No, £2 million or more",
                    "value": "over_2m",
                    "next": "goods_purpose",
                    "adds_complexity": 2
                  },
                  {
                    "label": "I'm not sure",
                    "value": "unsure",
                    "next": "goods_purpose",
                    "adds_complexity": 1
                  }
                ]
              },
              "goods_purpose": {
                "id": "goods_purpose",
                "question": "What best describes what you'll do with these goods?",
                "type": "single_choice",
                "help": "The intended use of goods determines whether they're 'at risk' of entering the EU market.",
                "complexity": 4,
                "options": [
                  {
                    "label": "We'll process these goods (including supplies and components) in NI before sale",
                    "value": "process_ni",
                    "next": "approved_purpose_check"
                  },
                  {
                    "label": "We'll only sell these goods in NI and GB",
                    "value": "sell_ni_gb",
                    "next": "evidence_check"
                  },
                  {
                    "label": "We'll only use these goods internally for day-to-day operations",
                    "value": "internal_use",
                    "next": "not_at_risk_result"
                  },
                  {
                    "label": "We might sell to customers in Ireland or EU",
                    "value": "might_sell_eu",
                    "next": "at_risk_result",
                    "adds_complexity": 5
                  }
                ]
              },
              "approved_purpose_check": {
                "id": "approved_purpose_check",
                "question": "Is the processing for an 'Approved Purpose'?",
                "type": "single_choice",
                "help": "Approved purposes include: food for UK consumers, construction in NI, health/care services in NI, non-profit activities, or animal feed used in NI.",
                "complexity": 7,
                "learn_more": {
                  "title": "What are Approved Purposes?",
                  "content": "Approved purposes for commercial processing:\n• Food for sale to end consumers in the UK\n• Construction (permanent part of structure in NI)\n• Health or care services in NI\n• Non-profit activities in NI\n• Animal feed for use on premises in NI\n\nYou can sell to one subsequent entity in these sectors."
                },
                "options": [
                  {
                    "label": "Yes, it's for an approved purpose",
                    "value": "yes",
                    "next": "evidence_check"
                  },
                  {
                    "label": "No, not for an approved purpose",
                    "value": "no",
                    "next": "at_risk_result",
                    "adds_complexity": 5
                  },
                  {
                    "label": "I'm not sure",
                    "value": "unsure",
                    "next": "approved_purpose_helper",
                    "adds_complexity": 3
                  }
                ]
              },
              "approved_purpose_helper": {
                "id": "approved_purpose_helper",
                "type": "helper",
                "question": "Let me help determine if your processing qualifies",
                "complexity": 8,
                "followup": {
                  "question": "Which sector best describes your business?",
                  "options": [
                    {
                      "label": "Food production (for UK consumers)",
                      "value": "food",
                      "sets": {"approved_purpose_check": "yes"},
                      "next": "evidence_check"
                    },
                    {
                      "label": "Construction / Building",
                      "value": "construction",
                      "sets": {"approved_purpose_check": "yes"},
                      "next": "evidence_check"
                    },
                    {
                      "label": "Healthcare or care services",
                      "value": "healthcare",
                      "sets": {"approved_purpose_check": "yes"},
                      "next": "evidence_check"
                    },
                    {
                      "label": "Other manufacturing or processing",
                      "value": "other",
                      "sets": {"approved_purpose_check": "no"},
                      "next": "at_risk_result",
                      "adds_complexity": 5
                    }
                  ]
                }
              },
              "evidence_check": {
                "id": "evidence_check",
                "tier": "evidence",
                "question": "When you buy these goods, will you have evidence to prove they'll remain in NI or GB?",
                "type": "single_choice",
                "help": "Evidence can include: sales records showing only UK customers, contracts limiting onward sales, or business documentation showing goods stay in UK.",
                "complexity": 6,
                "options": [
                  {
                    "label": "Yes, we can provide evidence",
                    "value": "yes",
                    "next": "not_at_risk_result"
                  },
                  {
                    "label": "No, we can't guarantee this",
                    "value": "no",
                    "next": "at_risk_result",
                    "adds_complexity": 5
                  },
                  {
                    "label": "I'm not sure what evidence is needed",
                    "value": "unsure",
                    "next": "evidence_helper",
                    "adds_complexity": 2
                  }
                ]
              },
              "evidence_helper": {
                "id": "evidence_helper",
                "type": "helper",
                "question": "Let me explain what evidence you need",
                "explanation": "Evidence that goods stay in UK can include:\n• Your business only operates in NI/GB (no EU customers)\n• Sales records showing UK-only destinations\n• Contracts or agreements limiting where goods go\n• Customer declarations that goods won't go to EU",
                "complexity": 7,
                "followup": {
                  "question": "Do you currently sell to customers in Ireland or the EU?",
                  "options": [
                    {
                      "label": "No, only UK customers",
                      "value": "uk_only",
                      "sets": {"evidence_check": "yes"},
                      "explanation": "If you only have UK customers, that's your evidence",
                      "next": "not_at_risk_result"
                    },
                    {
                      "label": "Yes, we have some EU customers",
                      "value": "has_eu",
                      "sets": {"evidence_check": "no"},
                      "explanation": "If goods might go to EU, they're considered 'at risk'",
                      "next": "at_risk_result",
                      "adds_complexity": 5
                    }
                  ]
                }
              },
              "not_at_risk_result": {
                "id": "not_at_risk_result",
                "tier": "result",
                "type": "result",
                "result_type": "not_at_risk",
                "complexity": 5,
                "title": "Your goods are NOT AT RISK",
                "summary": "You must submit a simplified customs declaration",
                "explanation": "Based on your scenario, your goods are classified as 'not at risk' of entering the EU market. This means simplified procedures and no EU customs duties.",
                "requirements": [
                  {
                    "category": "Customs Declaration",
                    "items": [
                      "Submit a simplified frontier declaration (not full customs declaration)",
                      "Can be done through HMRC systems or customs intermediary"
                    ]
                  },
                  {
                    "category": "Duties & Tariffs",
                    "items": [
                      "No EU customs duties payable",
                      "UK tariffs may apply depending on goods"
                    ]
                  },
                  {
                    "category": "Documentation",
                    "items": [
                      "Keep evidence that goods will remain in UK",
                      "Maintain records for 6 years",
                      "Commercial invoices with proper declarations"
                    ]
                  }
                ],
                "actions": [
                  {
                    "priority": "immediate",
                    "title": "Register for customs declarations",
                    "description": "If not already registered, sign up for HMRC customs system",
                    "link": "https://www.gov.uk/guidance/register-for-the-goods-vehicle-movement-service"
                  },
                  {
                    "priority": "immediate",
                    "title": "Prepare evidence documentation",
                    "description": "Gather or create documentation proving goods stay in UK",
                    "link": null
                  },
                  {
                    "priority": "ongoing",
                    "title": "Submit simplified declarations for each shipment",
                    "description": "Use HMRC systems or hire customs intermediary",
                    "link": null
                  }
                ]
              },
              "at_risk_result": {
                "id": "at_risk_result",
                "tier": "result",
                "type": "result",
                "result_type": "at_risk",
                "complexity": 9,
                "title": "Your goods are AT RISK",
                "summary": "You must submit a full customs declaration and may owe EU customs duties",
                "explanation": "Based on your scenario, your goods are classified as 'at risk' of entering the EU market. This triggers full customs procedures and potential EU tariffs.",
                "requirements": [
                  {
                    "category": "Customs Declaration",
                    "items": [
                      "Submit FULL customs declaration (not simplified)",
                      "Must be done via customs intermediary or CHIEF/CDS system"
                    ]
                  },
                  {
                    "category": "Duties & Tariffs",
                    "items": [
                      "Check if EU tariffs apply to your goods",
                      "May be able to offset via Customs Duty Waiver Scheme",
                      "May be able to reclaim via Customs Duty Reimbursement Scheme"
                    ]
                  },
                  {
                    "category": "Documentation",
                    "items": [
                      "Full commercial invoices required",
                      "Proof of origin may be needed",
                      "Safety and standards certificates",
                      "Keep all records for 6 years"
                    ]
                  }
                ],
                "actions": [
                  {
                    "priority": "immediate",
                    "title": "Check tariff rates for your goods",
                    "description": "Look up commodity codes and duty rates",
                    "link": "https://www.trade-tariff.service.gov.uk/ni"
                  },
                  {
                    "priority": "immediate",
                    "title": "Consider customs duty relief schemes",
                    "description": "Check if Waiver or Reimbursement schemes apply",
                    "link": "https://www.gov.uk/guidance/moving-goods-under-the-northern-ireland-protocol"
                  },
                  {
                    "priority": "before_first_shipment",
                    "title": "Engage a customs broker",
                    "description": "Full declarations are complex - professional help recommended",
                    "link": null
                  }
                ],
                "warnings": [
                  "At-risk goods face more complex procedures and potential costs",
                  "EU tariffs can be significant - check rates before committing to shipments",
                  "Consider if alternative supply chains (e.g., sourcing from NI/EU directly) might be simpler"
                ]
              },
              "edge_case_professional_help": {
                "id": "edge_case_professional_help",
                "type": "result",
                "result_type": "edge_case",
                "complexity": 15,
                "title": "Your scenario needs professional assessment",
                "summary": "This situation is too complex for automated guidance",
                "explanation": "Based on your answers, your scenario involves edge cases or specialized regulations that require expert review. This is not uncommon for certain industries or complex supply chains.",
                "recommendations": [
                  {
                    "title": "Contact HMRC Trader Support Service (TSS)",
                    "description": "Free government service for Windsor Framework guidance",
                    "contact": "0800 161 5837",
                    "link": "https://www.tradersupportservice.co.uk"
                  },
                  {
                    "title": "Hire a customs broker",
                    "description": "Professional customs brokers can navigate complex scenarios",
                    "link": "https://www.gov.uk/guidance/list-of-customs-agents-and-fast-parcel-operators"
                  },
                  {
                    "title": "Consult with trade solicitor",
                    "description": "For particularly complex legal/regulatory questions",
                    "link": null
                  }
                ],
                "why_complex": [
                  "Category 1 goods require specialized knowledge",
                  "Multiple regulatory frameworks may apply",
                  "High-value shipments have additional requirements",
                  "Certain industries have sector-specific rules"
                ]
              }
            },
            "tiers": {
              "movement": 0,
              "sector": 1,
              "goods": 2,
              "evidence": 3,
              "result": 4
            },
            "metadata": {
              "version": "1.0.0",
              "source": "HMRC Windsor Framework guidance flowcharts",
              "last_updated": "2024-12-12",
              "disclaimer": "This tool provides general guidance based on HMRC published flowcharts. It is not legal or professional advice. You should verify requirements with HMRC Trader Support Service or a customs professional before making business decisions."
            }
          };
