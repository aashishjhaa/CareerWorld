import { GoogleGenAI, Type } from "@google/genai";
import type { Career, UnpackedObject, Persona, PersonaProblemSet, CareerReport, PersonalizationData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const careerSkeletonSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: {
                type: Type.STRING,
                description: "A unique, URL-friendly slug for the career (e.g., 'data-scientist')."
            },
            title: {
                type: Type.STRING,
                description: "The official name of the career."
            },
            emoji: {
                type: Type.STRING,
                description: "A single, relevant emoji that represents the career."
            },
        },
        required: ['id', 'title', 'emoji']
    }
};

const careerHydrationSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { 
      type: Type.STRING,
      description: "A concise, one-sentence summary of the career."
    },
    automationRisk: {
      type: Type.STRING,
      enum: ['Low', 'Medium', 'High'],
      description: "An assessment of the risk of automation."
    },
    demandGrowth: {
      type: Type.STRING,
      enum: ['Low', 'Medium', 'High'],
      description: "The projected growth in demand for this career."
    },
    isEmerging: {
      type: Type.BOOLEAN,
      description: "Indicates if it is a relatively new or emerging field."
    },
    whoThisIsFor: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "An array of 3-4 short strings describing personality traits for a good fit."
    },
    relatedCareers: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "An array of 2-3 strings listing related career titles."
    },
  },
  required: ['summary', 'automationRisk', 'demandGrowth', 'isEmerging', 'whoThisIsFor', 'relatedCareers'],
};


const unpackedObjectSchema = {
    type: Type.OBJECT,
    properties: {
        objectName: {
            type: Type.STRING,
            description: "The name of the object being analyzed."
        },
        lifecycle: {
            type: Type.ARRAY,
            description: "An array of lifecycle stages for the object.",
            items: {
                type: Type.OBJECT,
                properties: {
                    stageName: {
                        type: Type.STRING,
                        description: "The name of the lifecycle stage (e.g., 'Concept & Design')."
                    },
                    emoji: {
                        type: Type.STRING,
                        description: "A single emoji that represents this stage."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A one-sentence description of what happens in this stage."
                    },
                    careers: {
                        type: Type.ARRAY,
                        description: "A list of 3-5 key career titles involved in this stage.",
                        items: {
                            type: Type.STRING
                        }
                    }
                },
                required: ["stageName", "emoji", "description", "careers"]
            }
        }
    },
    required: ["objectName", "lifecycle"]
};

const personaProblemsSchema = {
    type: Type.OBJECT,
    properties: {
        personaTitle: {
            type: Type.STRING,
            description: "The title of the persona provided in the prompt."
        },
        problems: {
            type: Type.ARRAY,
            description: "An array of 4-5 distinct problems or challenges this persona faces.",
            items: {
                type: Type.OBJECT,
                properties: {
                    problemTitle: {
                        type: Type.STRING,
                        description: "A short, descriptive title for the problem."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A one-sentence description of the problem."
                    },
                    solvingCareers: {
                        type: Type.ARRAY,
                        description: "A list of 3-5 career titles that could help solve this specific problem.",
                        items: {
                            type: Type.STRING
                        }
                    }
                },
                required: ["problemTitle", "description", "solvingCareers"]
            }
        }
    },
    required: ["personaTitle", "problems"]
};

const personaSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A short, descriptive title for the persona (e.g., 'The Weekend DIY Enthusiast')."
        },
        tagline: {
            type: Type.STRING,
            description: "A one-sentence tagline summarizing the persona's core motivation or challenge."
        },
        description: {
            type: Type.STRING,
            description: "A brief one-sentence description of the persona."
        },
        imageQuery: {
            type: Type.STRING,
            description: "A 2-3 word search query suitable for finding a relevant, high-quality stock photo for this persona (e.g., 'person gardening', 'man fixing bicycle')."
        }
    },
    required: ["title", "tagline", "description", "imageQuery"]
};


export const discoverCareerSkeletons = async (interests: string): Promise<Career[]> => {
    try {
        const prompt = `
            Analyze the user's interests: "${interests}".
            Generate a list of 10 diverse and relevant career paths.
            For each career, provide ONLY a unique URL-friendly id, its title, and a single representative emoji.
            The entire output must be a single, valid JSON array. Do not add any other text.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: careerSkeletonSchema,
            },
        });

        const text = response.text;
        if (!text) return [];
        
        return JSON.parse(text);

    } catch (error) {
        console.error("Error calling Gemini API for skeletons:", error);
        throw new Error("Failed to fetch career skeletons from AI.");
    }
};

export const discoverMoreCareerSkeletons = async (interests: string, existingIds: string[]): Promise<Career[]> => {
    try {
        const prompt = `
            Analyze the user's interests: "${interests}".
            Generate a list of 4 additional, diverse, and relevant career paths.
            IMPORTANT: Do NOT include any careers from the following list of IDs, as the user has already seen them:
            - ${existingIds.join('\n- ')}
            
            If you cannot find 4 new distinct careers, generate as many as you can. If none, return an empty array.
            For each career, provide ONLY a unique URL-friendly id, its title, and a single representative emoji.
            The entire output must be a single, valid JSON array.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: careerSkeletonSchema,
            },
        });

        const text = response.text;
        if (!text) return [];

        return JSON.parse(text);

    } catch (error) {
        console.error("Error calling Gemini API for more skeletons:", error);
        throw new Error("Failed to fetch more career skeletons from AI.");
    }
};

export const hydrateCareerQuickLook = async (careerTitle: string): Promise<Partial<Career>> => {
    try {
        const prompt = `
            Generate the "Quick Look" details for the career: "${careerTitle}".
            Provide the summary, automation risk, demand growth, emerging status, target audience, and related careers.
            The entire output must be a single, valid JSON object.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: careerHydrationSchema,
            },
        });

        const text = response.text;
        if (!text) {
             throw new Error(`API returned an empty response for hydrating ${careerTitle}.`);
        }
        
        return JSON.parse(text);

    } catch (error) {
        console.error(`Error calling Gemini API for hydrating ${careerTitle}:`, error);
        throw new Error(`Failed to hydrate career ${careerTitle} from AI.`);
    }
};


export const unpackObjectCareers = async (objectName: string): Promise<UnpackedObject> => {
    try {
        const prompt = `
            Deconstruct the object "${objectName}" into its key lifecycle stages, from conception to end-of-life.
            The stages should be in chronological order. Include at least 5 distinct stages.
            Example stages: Concept & Design, Raw Material Sourcing, Manufacturing & Engineering, Logistics & Distribution, Marketing & Sales, Customer Support & Maintenance, Recycling & Disposal.

            For each stage, provide a name, a relevant emoji, a brief one-sentence description, and a list of 3-5 key careers involved in that stage.
            The output must be a single, valid JSON object conforming to the provided schema. Do not include any introductory text, explanations, or markdown formatting. The output must be only the JSON object.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: unpackedObjectSchema,
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("API returned an empty response.");
        }

        const parsedObject: UnpackedObject = JSON.parse(text);
        return parsedObject;

    } catch (error) {
        console.error("Error calling Gemini API for unpacking:", error);
        throw new Error("Failed to unpack object from AI.");
    }
};

export const getPersonaProblems = async (persona: Persona): Promise<PersonaProblemSet> => {
    try {
        const prompt = `
            Analyze the following persona and generate a set of 4-5 distinct problems or challenges they face, along with a list of careers that could help solve each problem.
            
            Persona Title: "${persona.title}"
            Persona Description: "${persona.tagline}"

            The output must be a single, valid JSON object conforming to the provided schema. Do not include any introductory text, explanations, or markdown formatting. The output must be only the JSON object.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: personaProblemsSchema,
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("API returned an empty response.");
        }

        const parsedProblems: PersonaProblemSet = JSON.parse(text);
        return parsedProblems;

    } catch (error) {
        console.error("Error calling Gemini API for persona problems:", error);
        throw new Error("Failed to get persona problems from AI.");
    }
};

export const generateCareerReport = async (careerTitle: string, personalizationData: PersonalizationData): Promise<CareerReport> => {
    try {
        const prompt = `
            Generate a comprehensive, data-rich, and personalized "Full Market Report" for the career of a "${careerTitle}".
            
            **User Personalization Data:**
            - Age: ${personalizationData.age || 'Not provided'}
            - Country: ${personalizationData.country}
            - Open to International Opportunities: ${personalizationData.isOpenToAbroad ? 'Yes' : 'No'}

            You must act as an expert career analyst. Use Google Search to find the latest, most reputable data (from the last 12-24 months), especially for market demand, salary, and educational institutions.
            Synthesize information to provide actionable insights. All data points must be backed by sources. Be both comprehensive and concise.
            The entire output must be a single, valid JSON object. Do not include any introductory text, explanations, or markdown formatting like \`\`\`json.

            **Detailed Instructions:**
            - **personalizedNotes**: Based on the user's age and country, write a short, encouraging, one-paragraph note. Mention the range of educational options available in the report, from top-tier universities to affordable public institutions and skill-first online courses. Example: "As a ${personalizationData.age}-year-old in ${personalizationData.country}, exploring a career as a ${careerTitle} is an exciting prospect. This report is tailored to help you understand the landscape and includes a range of educational options, from top-tier global universities to more accessible and affordable public institutions in ${personalizationData.country}, as well as skill-first online courses to help you get started right away."
            - **financialInsights**: All salary data must be localized to the user's country: ${personalizationData.country}.
            - **actionablePath**: Structure this section into three distinct tiers:
              - **Tier 1: Top-Tier & Aspirational Universities**: In 'topTierUniversities', list 5-10 top-ranked universities for this field. If the user is open to international options, this list should include global leaders. ALWAYS include estimated annual tuition.
              - **Tier 2: High-Quality & Accessible Public/State Universities**: In 'accessiblePublicUniversities', list 5-10 well-regarded, affordable public or state universities specifically in ${personalizationData.country} with strong programs. ALWAYS include estimated annual tuition.
              - **Tier 3: The "Skill-First" & Alternative Pathways**: 
                - **recognizedCertifications**: List 3-5 high-value, industry-recognized certifications. For each, provide the name, issuing body, estimated cost, and time to complete.
                - **topOnlineCourses**: List 3-5 top-rated online courses or bootcamps. For each, provide the name, platform, estimated cost, time to complete, and a verified URL.

            ${personalizationData.astrology ? `
            - **astrologicalInsight**: The user has provided their birth details:
              - Date of Birth: ${personalizationData.astrology.dateOfBirth}
              - Time of Birth: ${personalizationData.astrology.timeOfBirth}
              - Place of Birth: ${personalizationData.astrology.placeOfBirth}
              Adopt the persona of a highly experienced Vedic Astrologer with 30+ years of expertise. Provide a wise, insightful, and guiding analysis (2-3 paragraphs) of how this career aligns with their astrological chart. Conclude with a "compatibilityScore" out of 10 (e.g., 8.5, a float with one decimal place).
            ` : `
            - **astrologicalInsight**: The user did not provide birth details. Provide a fun, generalized, one-paragraph astrological insight related to the career field in general. Do NOT include a "compatibilityScore".
            `}

            Your entire response must be ONLY the JSON object that conforms to the following structure. Do not add comments.
            {
              "careerTitle": "string",
              "personalizedNotes": "string",
              "executiveSummary": {
                "careerDefinition": "string",
                "whyItMatters": "string",
                "keyVitals": {
                  "averageExperienceLevel": "Entry" | "Mid-level" | "Senior",
                  "workEnvironment": "string",
                  "typicalWorkHours": "string",
                  "requiredEducationLevel": "string"
                }
              },
              "marketDemand": {
                "careerGrowthAndDemand": {
                  "currentDemandAnalysis": "string",
                  "projected10YearGrowth": { "percentage": number, "description": "string" },
                  "jobPostingTrendsGraphData": [{ "year": number, "trend": number (a value between 0 and 100 representing percentage) }]
                },
                "aiDisruptionAndAutomationRisk": {
                  "analysis": "string",
                  "automationRiskScore": "Low" | "Medium" | "High",
                  "rationale": "string"
                }
              },
              "financialInsights": {
                "salaryData": {
                  "entryLevel": { "low": number, "high": number, "currency": "string" },
                  "midLevel": { "low": number, "high": number, "currency": "string" },
                  "seniorLevel": { "low": number, "high": number, "currency": "string" }
                },
                "compensationDetails": "string",
                "topPayingCompanies": ["string"],
                "geographicVariance": "string"
              },
              "dayInTheLife": {
                "typicalDay": "string",
                "hardSkills": ["string"],
                "softSkills": ["string"]
              },
              "isThisForYou": {
                "pros": ["string"],
                "cons": ["string"],
                "personalityProfile": "string"
              },
              "actionablePath": {
                "educationalPathways": {
                  "degreePaths": ["string"],
                  "topTierUniversities": [{ "name": "string", "estimatedAnnualTuition": "string", "rank": number, "url": "string" }],
                  "accessiblePublicUniversities": [{ "name": "string", "estimatedAnnualTuition": "string", "rank": number, "url": "string" }]
                },
                "skillFirstPathways": {
                  "recognizedCertifications": [{ "name": "string", "issuingBody": "string", "estimatedCost": "string", "timeToComplete": "string", "url": "string" }],
                  "topOnlineCourses": [{ "name": "string", "platform": "string", "estimatedCost": "string", "timeToComplete": "string", "url": "string" }]
                },
                "firstStepsForBeginner": ["string"]
              },
              "astrologicalInsight": {
                "insight": "string",
                "compatibilityScore": number
              },
              "sources": [{ "title": "string", "uri": "string" }]
            }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                thinkingConfig: { thinkingBudget: 0 },
            },
        });
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        
        let text = response.text;
        if (!text) {
            throw new Error("API returned an empty response for the report.");
        }

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("AI response did not contain a JSON object:", text);
            throw new Error("Could not find a valid JSON object in the AI response.");
        }
        const jsonString = jsonMatch[0];

        const parsedReport: CareerReport = JSON.parse(jsonString);

        if (groundingMetadata?.groundingChunks) {
            // FIX: Explicitly type `sources` to ensure correct type inference for subsequent operations. This resolves errors where properties on source objects could not be accessed.
            const sources: { title: string; uri: string; }[] = groundingMetadata.groundingChunks
                .map((chunk: any) => chunk.web)
                .filter((web: any) => web && web.uri && web.title)
                .map((web: any) => ({ title: web.title, uri: web.uri }));
            
            const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());
            parsedReport.sources = Array.from(new Map([...(parsedReport.sources || []), ...uniqueSources].map(s => [s.uri, s])).values());
        }

        return parsedReport;

    } catch (error) {
        console.error("Error calling Gemini API for career report:", error);
        throw new Error("Failed to generate career report from AI.");
    }
};


export const generatePersona = async (prompt: string): Promise<{ title: string; tagline: string; description: string; imageQuery: string; }> => {
    try {
        const fullPrompt = `
            Generate a unique and interesting user persona based on the following description.
            The persona should be a character profile that could be used to brainstorm products or services.
            The title should be creative and evocative.

            User Description: "${prompt}"

            The output must be a single, valid JSON object conforming to the provided schema. Do not include any introductory text, explanations, or markdown formatting.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: personaSchema,
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("API returned an empty response.");
        }

        const parsedPersona = JSON.parse(text);
        return parsedPersona;

    } catch (error) {
        console.error("Error calling Gemini API for persona generation:", error);
        throw new Error("Failed to generate a new persona from AI.");
    }
};