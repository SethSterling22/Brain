[[Prompt Engineering]]

##### General Prompting / Zero shot

Provide a description of the task, just  the description. "Write an story about oranges."

##### One or few-shot

Provides a example or multiple examples about the output we want. The idea is give multiple  examples so the model can have a desired pattern to follow.

Example:

```bash
I want a description of a Pizza in JSON format like this:

{
"size": "large",
"ingredients": [["cheese", "tomato"]],
"type": "normal"
}
```

##### System, contextual and role promting

+ __System Prompting:__ sets the context and purpose to the model, like what the model should be doing: Formatting, translating, classifying, etc.
+ **Contextual Prompting:** Provide a specific detail or background information relevant to the conversation or task.
+ **Role Prompting:** Assigns a specific character or identity for  the language model to adopt. This helps  the model generate responses that are consistent with the  assigned role and its associated knowledge and behavior.

##### Step-Back Prompting 

Ask the  model to first consider a general question related to  the specific task at hand, and then feeding the answer to that general question into a subsequent prompt for the specific task.

Example:
+ First, ask a question related to  the topic you want to ask .
+ Take the  Output and put  it back like input / context and then add your prompt based on the previous answer.

##### Chain of Thought (CoT)

Generate intermediate reasoning steps. Asking to defragment the process and answer __step by step__. 

##### Self-Consistency

Combines sampling and majority voting to generate diverse reasoning paths and select the most consistent answer. 
It says to the Model to generate N answers and then let the model to choose which one it thinks is better.

+ Hight cost
+ More time

##### Tree of Thoughts (ToT)

It combines Self-consistency and Chain of thought, so it allows LLMs to explore multiple different reasoning paths simultaneously, rather than just following a linear chain of thought.

It's good to complete complex tasks that requiere exploration.

##### ReAct (Reason and act)

Mimics how humans operate in the real world, as we reason verbally and can take actions to gain information. 
The LLM first reasons about the problem and generates a plan of action. It then performs the actions in the plan and observes the results.

Works similar to an Agent.

##### Automatic Prompt Engineering

Ask to the model to improve the basic Prompt given and make it give you back the Prompt with the strategy or modification desired.

Can ask to use code to do a job, like count words.


+ Design with simplicity
+ Be specific about the output desired 
+ Use instructions over constraint (Say what to do instead of what not to do)
+ Control the max token length (For production and to limit the cost)
+ Use variables in prompt {Variable}



[the dump](obsidian://open?vault=Obsidian%20Vault&file=TACC%2FTACC%2FLearning%2FPrompt%20Journal#hola)