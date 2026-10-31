Date: 2025-08-08

#### Existing Model

With a specialized datasets we can adjust the existing model

Normally it requieres a supervised learning where input and output validation is provided 

Example: Technical support, we provide thousands of technical questions each one paired with its technical response.

The model adjusts its weights through ==back propagation== 


+ We can achieve a more Deep domain experiece
+ It's faster in the task it was trained

+ More trainning complexity 
+ More coputational cost
+ Requires more maintainance
+ ==Catastrophic forgetting==


Resources:
+ https://instructlab.ia

LLM that runs locally to create data.


```bash
ilab onfig init

# To start chat
ilab model chat 

# To validate data format
ilab taxonomy diff

# Generte examples based on the context and information provided
ilab data generate --num-instructions 3

# To train the model
ilab model train --num-epochs 10

ilab model serve --model-path {file.gguf}

```





