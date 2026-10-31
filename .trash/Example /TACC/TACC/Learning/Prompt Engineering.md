Date: 2025-08-08

The prompt is sent as input to the model, it receive and processes it through a series off layers.
Each layer is basically atention mechanisms, and each  one focuses on different aspects of the prompt text.

Is needed to add examples, or define the format we want to obtain a more accurate ansewer, and its redirect the model's atention to relevant patterns and learn them during trainning.

"Think step by step"

+ A well-engineered prompt can transform a model's output, without any additional training.
+ No need to change in the infraestructure
+ Immmediate responses

+ More Trial and error
+ Limmited to existing knowledge

### Resources

+ https://aistudio.google.com
#### Output Lenght

Control the output length can limits the ability of prediction the LLM has, so it could not give an accurate result if it's too limited.

#### Sampling Controls

LLMs do not predicts tokens, they predict probabilities for what the next token could be. That  token must be in the LLLM's vocabulary to get that probability.

###### Temperature, Top-K and Top-P

Controls the randomness in Sampling Controls, the variation the token have to say something less probable.

More variation with higher Temperature, less variation with lower Temperature.

+ **Top-K:** Sampling selects the top K most likely tokens from the  model's predicted distribution. It gives more creative to the model.
+ **Top-P:** Takes the top Tokens between a certain value P, value from 0 to 1.
---
