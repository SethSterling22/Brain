[[Prompting Techniques]]
[[Roadmap for Extracting Locations]]
### Zero-Shot:

1. Write a zero-shot summarization prompt using a sample interview:

**Prompt:**
```
Use the fragment of the next json format information as context and just answer what is between quotation marks (""):

{"title": "Jr", "text": "
Okay, Casey, do you mind? Okay, great. So, I through our center. So we are
trying to understand"}, {"speaker": "SPEAKER_00", "timestamp":
[28.0, 35.36], "text": " ways that we can help people who need to collect
data about hard problems like the community is"},
{"speaker": "SPEAKER_01", "timestamp": [35.36, 47.8], "text": " facing here.
How do we help bring that kind of information analysis to help you here and
how do we make tools that will improve your"},
{"speaker": "SPEAKER_00", "timestamp": [47.8, 54.2], "text": " ability to
communicate what's happening in your nunchuck and so can you tell me"},
{"speaker": "SPEAKER_00", "timestamp": [54.2, 65.0], "text": " your name and
what it is my name is James brilliant I have worked with some fishing line up
here, Navy CTV."}, {"speaker": "SPEAKER_04", "timestamp":
[65.0, 66.0], "text": " Okay."}, {"speaker": "SPEAKER_00", "timestamp":
[66.0, 70.0], "text": " And I'm kind of in between jobs right now."},
{"speaker": "SPEAKER_04", "timestamp": [70.0, 71.0], "text": " Okay."},
{"speaker": "SPEAKER_04", "timestamp": [71.0, 76.0], "text": " Doing
subsistence activities here since the spring."},
{"speaker": "SPEAKER_01", "timestamp": [76.0, 80.0], "text": " Oh, cool. What
are subsistence activities exactly? I don't know."},
{"speaker": "SPEAKER_00", "timestamp": [80.0, 90.0], "text": " Bird hunting,
you know, gathering food, fishing, hunting, just surviving I guess."},
{"speaker": "SPEAKER_01", "timestamp": [90.0, 95.0], "text": " That's
wonderful that you can survive and do that, yeah."},
{"speaker": "SPEAKER_00", "timestamp": [95.0, 101.0], "text": " I grew up in
Colorado and we were on a ranch but we could never have subsisted, I don't
think, by ourselves."}, {"speaker": "SPEAKER_01", "timestamp":
[101.0, 105.9], "text": " I mean, I grew up in Anchorage and we couldn't.
Well,"}, {"speaker": "SPEAKER_02", "timestamp": [109.24, 113.56], "text": "
so how do you see things changing and what do you think are the most
important changes"}, {"speaker": "SPEAKER_02", "timestamp":
[113.56, 117.4], "text": " that you've noticed and observed while living
here? Well, I was"}, {"speaker": "SPEAKER_01", "timestamp":
[117.4, 121.48], "text": " born at Fish Camp July 20, 1970."},
{"speaker": "SPEAKER_00", "timestamp": [122.4, 131.0], "text": " So, 54. And
I grew up here in Sirum's house down here."},
{"speaker": "SPEAKER_04", "timestamp": [131.0, 132.0], "text": " Yeah."},
{"speaker": "SPEAKER_00", "timestamp": [132.0, 137.0], "text": " In 1970, the
weather patterns were way different."},
{"speaker": "SPEAKER_04", "timestamp": [137.0, 138.0], "text": " Yeah."},
{"speaker": "SPEAKER_00", "timestamp": [138.0, 153.0], "text": " And we're
having shorter winters, meaning we have earlier thaw and later
freeze-ups."}, {"speaker": "SPEAKER_04", "timestamp":

"Give me the names of the people that are talking in the interview"
```

**Output:**
```
"SPEAKER_00", "SPEAKER_01", "SPEAKER_02", "SPEAKER_04", "Jr", "James", "Casey"
```

**Notes:** It gives me the names, or at least what it understood as subjects in the interview, not specifically names of people. Also the format of the answer was not specified.



### Few-Shot:


1. Create a few-shot prompt with 1–2 examples. Format:

**Prompt:**
```
Provide me a brief summary about any topic related with Climate, weather, etc and put it in the next format:

Speaker: [Name of the person who's talking]
Summary: [Example: "today is too cold to go outside"]
Time: [At what time was it said]
```

**Output:**
```
Here are a few summaries based on the conversation:

Speaker: SPEAKER_00
Summary: The weather patterns have changed, with shorter winters and longer freeze-ups.
Time: 138.0-153.0 seconds

Speaker: SPEAKER_00
Summary: The ice is taking longer to freeze up, affecting its strength and structure.
Time: 168.0-195.46 seconds

Speaker: SPEAKER_04
Summary: The weather patterns have changed, with changes in the spring rains.
Time: 195.46-207.44 seconds

These summaries relate to the topic of climate and weather changes, as discussed by the speakers in the conversation.
```

**Notes:**
It followed the format 
___
### Interview 3

**Prompt:**

```
(Based on Interview 3)

You are an expert text analysis assistant.
Your task is to analyze the interview text.
Extract all the **locations** mentioned in the text.
Locations can be geographical places (cities, countries, mountains), establishments (stores, street corners, church), streets, or any other specific place.
Go step by step defragmenting listing in bullets the locations, also provide me the part of the text the location was extracted from like a little quote.

Give me that information in the next JSON format:
[
   {
   "location": (ENTER THE EXTRACTED LOCATION),
   "text": (THE PART OF THE TEXT IT WAS TAKEN FROM)
   }
]
```

**Output:**
```json
[
   {
     "location": "Colorado",
      "text": "I grew up in Colorado and we were on a ranch"
   },
   {
      "location": "Anchorage",
      "text": "I grew up in Anchorage"
   },
   {
      "location": "Fish Camp",
      "text": "I was born at Fish Camp July 20, 1970"
   },
   {
      "location": "Sirum's house",
      "text": "And I grew up here in Sirum's house down here"
   },
   {
      "location": "Nunachok",
      "text": "My Appa's house is that old house down on the corner. And it's got that teepee, A-frame style roof. They had to move that house from Nunachok from the old village site to here"
   },
   {
      "location": "Gatskiluk",
      "text": "The old village site is Nunachok which is about three and a half, two miles away from Gatskiluk"
   },
   {
      "location": "Nanbakpak",
      "text": "On the old river site towards Nunachok, Nanbakpak"
   },
   {
      "location": "Kasiluk",
      "text": "Our village dumps are right next to each other. And our dump is actually closer to Kasiluk"
   },
   {
      "location": "Kasselbrook",
      "text": "the power plants over in Kasselbrook"
   },
   {
      "location": "Seattle",
      "text": "one from here okay um but yeah aside from the city dump our sewer lagoons are right in the middle of the village yeah yeah and that causes concern for kids playing... one person had to be sealed up in seattle"
   },
   {
      "location": "Portage Glacier",
      "text": "I remember like Portage Glacier coming all the way to the road"
   },
   {
      "location": "the river",
      "text": "when you come up from the river it's first part of the village that you see"
   },
   {
      "location": "the South Side",
      "text": "our South Side in the summertime sinks faster than the north side of the house"
   },
   {
      "location": "the North Side",
      "text": "our South Side in the summertime sinks faster than the north side of the house"
   },
   {
      "location": "the clinic",
      "text": "aside from the school the clinic"
   },
   {
      "location": "the school",
      "text": "aside from the school the clinic"
   },
   {
      "location": "the old water treatment plant",
      "text": "where the old water treatment plant was"
   },
   {
      "location": "the store",
      "text": "the store will have to be protected because that's that's a necessity"
   },
   {
      "location": "the dump",
      "text": "Our village dumps are right next to each other"
   },
   {
      "location": "the sewer lagoons",
      "text": "our sewer lagoons are right in the middle of the village"
   },
   {
      "location": "the Moravian Church",
      "text": "Once the churches and the schools were built, they assimilated us... there's Moravian Church"
   },
   {
      "location": "the Russian Orthodox Church",
      "text": "there's Moravian Church the Russian Orthodox Church"
   },
   {
      "location": "the Pentecostal Church",
      "text": "and recently Pentecostal Church"
   }
]
```

__Notes:__ there're some problems with the names of the cities but it can be addressed to a transcription problem.
Those names could be provided and ask to be replaced based on similarity.

__Prompt:__ 1
```
You missed some locations. Some examples include:

- Fish camps
- Store
- Cementery
- Dump  
    Etc,

give me just the ones were not in the first output just if you find more locations
```

__Notes:__ Gave me the same past output

__Prompt:__ 2 Fix
```
those locations were in the last output too
```

__Output:__
```json
[
   {
      "location": "Navy CTV",
      "text": "I have worked with some fishing line up here, Navy CTV"
   }
]
```

### Refinement

__Prompt:__
```
You also must considerar someone's property or house a valid place or location. Besides that you must include in the answer a new field called: "location_type" when you're going to describe what kind of location it is, for example:

[
  "Single-Family Homes",
  "Apartment Complexes",
  "Suburban Communities",
  "Retirement Communities",
  "Retail Spaces",
  "Office Buildings",
  "Financial Centers",
  "Hospitality Locations",
  "Factories",
  "Warehouses",
  "Industrial Parks",
  "Ports and Logistics Hubs",
  "Administrative Centers",
  "Healthcare Facilities",
  "Educational Institutions",
  "Emergency Services Locations",
  "Utility Infrastructure",
  "Farms",
  "Ranches",
  "Rural Service Centers",
  "Mining Towns",
  "Airports",
  "Train Stations",
  "Bus Terminals",
  "Seaports",
  "Highway Interchanges",
  "Parks and Natural Preserves",
  "Sports Arenas",
  "Museums and Art Galleries",
  "Religious Centers",
  "Tourist Attractions",
  "Urban Cores",
  "Town Centers",
  "Planned Communities"
]
```

__Output:__
```json
[
   {
      "location": "Colorado",
      "location_type": "State/Province",
      "text": "I grew up in Colorado and we were on a ranch"
   },
   {
      "location": "Anchorage",
      "location_type": "City",
      "text": "I grew up in Anchorage"
   },
   {
      "location": "Fish Camp",
      "location_type": "Specific Location",
      "text": "I was born at Fish Camp July 20, 1970"
   },
   {
      "location": "Sirum's house",
      "location_type": "Single-Family Home",
      "text": "And I grew up here in Sirum's house down here"
   },
   {
      "location": "My Appa's house",
      "location_type": "Single-Family Home",
      "text": "My Appa's house is that old house down on the corner"
   },
   {
      "location": "Nunachok",
      "location_type": "Village/Town",
      "text": "They had to move that house from Nunachok from the old village site to here"
   },
   {
      "location": "Gatskiluk",
      "location_type": "Village/Town",
      "text": "The old village site is Nunachok which is about three and a half, two miles away from Gatskiluk"
   },
   {
      "location": "Nanbakpak",
      "location_type": "Specific Location",
      "text": "On the old river site towards Nunachok, Nanbakpak"
   },
   {
      "location": "Kasiluk",
      "location_type": "Village/Town",
      "text": "Our village dumps are right next to each other. And our dump is actually closer to Kasiluk"
   },
   {
      "location": "Kasselbrook",
      "location_type": "Specific Location",
      "text": "the power plants over in Kasselbrook"
   },
   {
      "location": "Seattle",
      "location_type": "City",
      "text": "one person had to be sealed up in seattle"
   },
   {
      "location": "Portage Glacier",
      "location_type": "Natural Feature",
      "text": "I remember like Portage Glacier coming all the way to the road"
   },
   {
      "location": "the river",
      "location_type": "Natural Feature",
      "text": "when you come up from the river it's first part of the village that you see"
   },
   {
      "location": "the South Side",
      "location_type": "Directional Location",
      "text": "our South Side in the summertime sinks faster than the north side of the house"
   },
   {
      "location": "the North Side",
      "location_type": "Directional Location",
      "text": "our South Side in the summertime sinks faster than the north side of the house"
   },
   {
      "location": "the clinic",
      "location_type": "Healthcare Facility",
      "text": "aside from the school the clinic"
   },
   {
      "location": "the school",
      "location_type": "Educational Institution",
      "text": "aside from the school the clinic"
   },
   {
      "location": "the old water treatment plant",
      "location_type": "Utility Infrastructure",
      "text": "where the old water treatment plant was"
   },
   {
      "location": "the store",
      "location_type": "Retail Space",
      "text": "the store will have to be protected because that's that's a necessity"
   },
   {
      "location": "the dump",
      "location_type": "Waste Management Facility",
      "text": "Our village dumps are right next to each other"
   },
   {
      "location": "the sewer lagoons",
      "location_type": "Utility Infrastructure",
      "text": "our sewer lagoons are right in the middle of the village"
   },
   {
      "location": "the Moravian Church",
      "location_type": "Religious Center",
      "text": "Once the churches and the schools were built, they assimilated us... there's Moravian Church"
   },
   {
      "location": "the Russian Orthodox Church",
      "location_type": "Religious Center",
      "text": "there's Moravian Church the Russian Orthodox Church"
   },
   {
      "location": "the Pentecostal Church",
      "location_type": "Religious Center",
      "text": "and recently Pentecostal Church"
   },
   {
      "location": "fish camps",
      "location_type": "Specific Location",
      "text": "My grandpa and my dad's generation would go from camp to camp, and by seasons"
   },
   {
      "location": "camps",
      "location_type": "Specific Location",
      "text": "My grandpa and my dad's generation would go from camp to camp, and by seasons"
   },
   {
      "location": "Navy CTV",
      "location_type": "Specific Location",
      "text": "I have worked with some fishing line up here, Navy CTV"
   },
   {
      "location": "the village",
      "location_type": "Village/Town",
      "text": "our village is a floating island"
   },
   {
      "location": "the cemetery",
      "location_type": "Cemetery",
      "text": "the cemetery is eroding"
   }
]
```

__Notes:__ It was more specific, followed the format, It created new `location_type` if the provided ones were not successfully fit in the description.

___

| Interview 3 locations (Excel):    | Interview 3 locations (Prompt) |
| --------------------------------- | ------------------------------ |
| Land sinking                      |                                |
| Dump Old / Dump health Hazard     | the dump                       |
| Wastewater System - health Hazard | the old water treatment plant  |
|                                   |                                |


---
### Interview 4

__Prompt:__
```
(based on Interview 4)

You are an expert text analysis assistant.
Your task is to analyze the interview text.
Extract all the **locations** mentioned in the text.
Locations can be geographical places (cities, countries, mountains), establishments (stores, street corners, church), streets, or any other specific place.
Go step by step defragmenting listing in bullets the locations, also provide me the part of the text the location was extracted from like a little quote.

Give me that information in the next JSON format:
[
   {
   "location": (ENTER THE EXTRACTED LOCATION),
   "text": (THE PART OF THE TEXT IT WAS TAKEN FROM)
   }
]
```

__Output:__
```json
[
   {
      "location": "Nunapachuk",
      "text": "My name is James Ferling Sr. and I'm 80 years old now and I've been here for all of my life except for 10 years of my work time was spent in Bethel. So when you think about how things have changed, what are the main, both problems and good things, like what are the good things that have happened but what are the negative things that happen here is improvement of water and sewer system for the village."
   },
   {
      "location": "Bethel",
      "text": "My name is James Ferling Sr. and I'm 80 years old now and I've been here for all of my life except for 10 years of my work time was spent in Bethel."
   },
   {
      "location": "Nafitsako",
      "text": "If you resettle to a new place, though, will it not do the same thing if you stay 12 months the year? Will it not just cycle and be a repeat over 20 or 50 years? I don't think so. If we keep up the roads and take care of our waste, waste would have had a better environment."
   },
   {
      "location": "Kasku",
      "text": "And our fish camps are down on the Kasku into session, that's the time we come back to the village."
   },
   {
      "location": "Alaska",
      "text": "So, to give you a little context, Alaska was in a state until 1959. It's not been very long."
   },
   {
      "location": "4th Avenue",
      "text": "Have you been to 4th Avenue already? I don't know. At the end of the village? I don't know if we have."
   },
   {
      "location": "Porthav",
      "text": "We call it Porthav. It's connected, then we can go that way. That's the end of the village right now. But that was the first settlement right there, that area."
   },
   {
      "location": "University of Texas",
      "text": "I'm done with my meeting, but I'm having another interview with people from water... University of Texas."
   }
]
```

__Notes:__ It gives mostly cities and direct locations


__Prompt:__ 
```
You missed some locations. Some examples include:
- Fish camps
- Store
- Cementery
- Dump
Etc,
```

__Output:__
```json
[ ... ]
[
   {
      "location": "Fish camps",
      "text": "And our fish camps are down on the Kasku into session, that's the time we come back to the village."
   },
   {
      "location": "Spring camp",
      "text": "In the old times we used to have spring camps and we go out probably like middle of day"
   },
   {
      "location": "Store",
      "text": "We were more traditionally in our living and now more about commercial store-bought stuff."
   },
   {
      "location": "Lagoon",
      "text": "You see those, uh... What are they? Dump... Lagoon? Lagoon... Like here? Likeump? Lagoon?"
   },
   {
      "location": "Dump",
      "text": "You see those, uh... What are they? Dump... Lagoon? Lagoon... Like here? Likeump? Lagoon?"
   },
   {
      "location": "Men's house",
      "text": "Oh, it was a big community steam house? Yeah. Saad mud house. Saad mud house. Men's house it was called."
   },
   {
      "location": "Women's house",
      "text": "Did the women have a women's house? Yeah. They were in their... In their homes. With their mothers."
   },
   {
      "location": "Shore",
      "text": "And even from on the shore there was willows going that way and after they're gone a land started to sink and now it's swamp all the vegetation is gone changed to water plants now."
   },
   {
      "location": "Bank",
      "text": "Is the land getting lower and less at the bank?"
   },
   {
      "location": "Yard",
      "text": "and land in our yards, some rest for at least five months."
   },
   {
      "location": "Boat yard",
      "text": "But those are no more. And even from on the shore there was willows going that way and after they're gone a land started to sink and now it's swamp all the vegetation is gone changed to water plants now."
   },
   {
      "location": "Church",
      "text": "So do you remember when the stationary village was established? And when the church, when was that? Was that 60s? Or when did this, when did this location become permanent?"
   }
]
```

__Notes:__ Given examples, we obtain more locations

### Refinement

__Prompt:__
```
You also must considerar someone's property or house a valid place or location. Besides that you must include in the answer a new field called: "location_type" when you're going to describe what kind of location it is, for example:

[
  "Single-Family Homes",
  "Apartment Complexes",
  "Suburban Communities",
  "Retirement Communities",
  "Retail Spaces",
  "Office Buildings",
  "Financial Centers",
  "Hospitality Locations",
  "Factories",
  "Warehouses",
  "Industrial Parks",
  "Ports and Logistics Hubs",
  "Administrative Centers",
  "Healthcare Facilities",
  "Educational Institutions",
  "Emergency Services Locations",
  "Utility Infrastructure",
  "Farms",
  "Ranches",
  "Rural Service Centers",
  "Mining Towns",
  "Airports",
  "Train Stations",
  "Bus Terminals",
  "Seaports",
  "Highway Interchanges",
  "Parks and Natural Preserves",
  "Sports Arenas",
  "Museums and Art Galleries",
  "Religious Centers",
  "Tourist Attractions",
  "Urban Cores",
  "Town Centers",
  "Planned Communities"
]
```

__Output:__
```json
[
   {
      "location": "Fish camps",
      "location_type": "Camps",
      "text": "And our fish camps are down on the Kasku into session, that's the time we come back to the village."
   },
   {
      "location": "Spring camp",
      "location_type": "Camps",
      "text": "In the old times we used to have spring camps and we go out probably like middle of day"
   },
   {
      "location": "Store",
      "location_type": "Retail Spaces",
      "text": "We were more traditionally in our living and now more about commercial store-bought stuff."
   },
   {
      "location": "Lagoon",
      "location_type": "Waste Management Facilities",
      "text": "You see those, uh... What are they? Dump... Lagoon? Lagoon... Like here? Likeump? Lagoon?"
   },
   {
      "location": "Dump",
      "location_type": "Waste Management Facilities",
      "text": "You see those, uh... What are they? Dump... Lagoon? Lagoon... Like here? Likeump? Lagoon?"
   },
   {
      "location": "Men's house",
      "location_type": "Community Centers",
      "text": "Oh, it was a big community steam house? Yeah. Saad mud house. Saad mud house. Men's house it was called."
   },
   {
      "location": "Women's house",
      "location_type": "Residential Buildings",
      "text": "Did the women have a women's house? Yeah. They were in their... In their homes. With their mothers."
   },
   {
      "location": "Shore",
      "location_type": "Natural Features",
      "text": "And even from on the shore there was willows going that way and after they're gone a land started to sink and now it's swamp all the vegetation is gone changed to water plants now."
   },
   {
      "location": "Bank",
      "location_type": "Natural Features",
      "text": "Is the land getting lower and less at the bank?"
   },
   {
      "location": "Yard",
      "location_type": "Residential Areas",
      "text": "and land in our yards, some rest for at least five months."
   },
   {
      "location": "Boat yard",
      "location_type": "Industrial Areas",
      "text": "But those are no more. And even from on the shore there was willows going that way and after they're gone a land started to sink and now it's swamp all the vegetation is gone changed to water plants now."
   },
   {
      "location": "Church",
      "location_type": "Religious Centers",
      "text": "So do you remember when the stationary village was established? And when the church, when was that? Was that 60s? Or when did this, when did this location become permanent?"
   },
   {
      "location": "Homes",
      "location_type": "Residential Buildings",
      "text": "They were in their... In their homes. With their mothers."
   },
   {
      "location": "Village",
      "location_type": "Urban Cores",
      "text": "And our fish camps are down on the Kasku into session, that's the time we come back to the village."
   }
]

```


