[[Prompting Techniques]]

The key is to guide the language model with clear and direct instructions, then refine the request to get more precise results.

#### Step 1: General Extraction

Start with a simple, direct prompt to see what information the model can extract on its own. This will give you a baseline and let you identify if the model needs more guidance.

**Example Prompt:**

```
You are an expert text analysis assistant.
Your task is to analyze the following JSON document which contains the text of an interview.
Extract all the **locations** mentioned in the text.
Locations can be geographical places (cities, countries), establishments (stores, street corners), streets, or any other specific place.
List the locations in a bulleted list.

[JSON Document here]
```

**Analysis:**

- **Role:** By giving it the role of an "expert text analysis assistant," you're setting the expectation that the model will act professionally and accurately.
    
- **Task:** The task is clear and specific: "extract all locations."
    
- **Definition:** By defining what constitutes a "location" (geographical places, establishments, streets, etc.), you're reducing ambiguity and ensuring the model doesn't just limit itself to cities or countries.
    
- **Output Format:** Asking for a list makes subsequent processing easier.
    

---

#### Step 2: Prompt Refinement

Once you see the initial output, you may need to refine the prompt to handle special cases or get a more useful format. This is where you can include the "context" you mentioned.

**Example Prompt (with refinement):**

```
You are an expert text analysis assistant.
Analyze the following JSON document containing the text of an interview.
Extract all **locations** mentioned. Locations can be geographical (cities, countries, neighborhoods), landmarks ("the park," the "bakery corner"), or specific establishments (a store name, a hospital).
For each location, also extract the **complete sentence** in which it is mentioned, to provide context.
Present the information in a structured JSON format, with an array called "found_locations." Each object in the array should have the following keys:
- "location_name": The name of the extracted location.
- "location_type": (Optional, if you can infer it) The type of place (e.g., "city," "street," "store").
- "context_sentence": The full sentence where the location is mentioned.

[JSON Document here]
```

**Analysis:**

- **More Context:** By asking for the "complete sentence," you're getting the context surrounding the location. This is very valuable for verifying accuracy and better understanding what the person is referring to.
    
- **Structured Format:** Requesting the output in a structured JSON format is a crucial step. This makes the information easy to parse and use in a program or script later.
    
- **Inference:** By asking for `location_type`, you're prompting the model to make a small inference, which can be very useful for automatically classifying the data.
    

---

### Types of Prompts You Can Provide

Here's a table summarizing the types of prompts and their objectives:

|Prompt Type|Objective|Example Prompt Fragment|
|---|---|---|
|**Role Prompt**|Establish the model's "persona" to get a more professional and focused response.|`You are an experienced data analyst.`|
|**Task Prompt**|Describe exactly what you want the model to do.|`Your task is to identify and list all locations.`|
|**Format Prompt**|Define what the structure of the response should be (list, table, JSON).|`Return the information in a JSON array...`|
|**Context Prompt**|Provide additional information to help the model handle ambiguity.|`Consider "the corner by the church" a location.`|
|**Few-shot Prompt**|Provide examples of desired input and output pairs so the model learns the pattern.|`Example 1: Text: "...I went to the store on the corner." Output: {"location_name": "the store on the corner"}.`|


### When to Provide Context?

Context is useful when the interview text is highly ambiguous. For example, if the interviewee mentions "Maria's house," the model might not consider it a location without context. If you provide a context prompt like, `consider "Maria's house" a valid landmark`, the model will know what to do.

For your case, the most effective approach is to start with the **General Extraction Prompt** and then, if the results aren't what you expect (e.g., the model ignores "landmarks" or "non-geographical places"), refine the prompt with more **definitions** and a **structured format** to get a clean, processable output.