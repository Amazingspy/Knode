# !/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Knode Python AI Slide Structure Engine
Compatible with python-genai and google-genai SDKs.
"""

import os
import json
import sys
from google import genai
from google.genai import types

def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is required.", file=sys.stderr)
        sys.exit(1)
    return genai.Client(api_key=api_key)

def ingest_script_to_knode(script, title="Knode Outline", slide_count="Automatic", audience="Professional", lang="en"):
    """
    Ingests raw script transcripts, prompts Gemini 3.5 Flash, and returns 
    a highly structured JSON package conformant with the Knode slide-by-slide schema.
    """
    client = get_gemini_client()
    
    system_instruction = (
        "You are an expert slide deck architect and curriculum designer. "
        "Your task is to analyze a raw presentation outline or draft script, and transform it into a highly structured 'Knode Package'. "
        "Each slide must have a 'title', 2-5 clear 'bulletPoints', 'speakerNotes', and 'visualSuggestion'."
    )
    
    if lang == "ta":
        system_instruction += (
            "\nCRITICAL: Write the output title, learningObjectives, keyVocabulary terms, slide titles, "
            "bulletPoints and speakerNotes fully in professional, fluent Tamil language (தமிழ்)."
        )
        
    prompt = f"""
    Analyze and format the following script content according to the schema.
    
    Title preference: {title}
    Slide count preference: {slide_count}
    Audience preference: {audience}
    
    Content:
    ----
    {script}
    ----
    """
    
    # Define response schema matching the Javascript backend
    schema = {
        "type": "OBJECT",
        "properties": {
            "title": {"type": "STRING"},
            "learningObjectives": {
                "type": "ARRAY",
                "items": {"type": "STRING"}
            },
            "keyVocabulary": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "term": {"type": "STRING"},
                        "definition": {"type": "STRING"}
                    },
                    "required": ["term", "definition"]
                }
            },
            "slides": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "title": {"type": "STRING"},
                        "bulletPoints": {
                            "type": "ARRAY",
                            "items": {"type": "STRING"}
                        },
                        "speakerNotes": {"type": "STRING"},
                        "visualSuggestion": {"type": "STRING"},
                        "keyVocabulary": {
                            "type": "ARRAY",
                            "items": {"type": "STRING"}
                        }
                    },
                    "required": ["title", "bulletPoints", "speakerNotes", "visualSuggestion"]
                }
            }
        },
        "required": ["title", "learningObjectives", "keyVocabulary", "slides"]
    }
    
    try:
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=schema,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error formulating slides layout: {e}", file=sys.stderr)
        return None

if __name__ == "__main__":
    test_script = "Hello, today we will talk about cloud computing. It has SaaS, PaaS, and IaaS components."
    print("Testing Python AI slide pack structure compilation...")
    result = ingest_script_to_knode(test_script, title="Cloud Core", lang="ta")
    if result:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print("Failed to compile layout. Ensure GEMINI_API_KEY is configured.")
