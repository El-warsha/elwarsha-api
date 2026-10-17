# ADR 0008 — Technologies tag list for cohort applications

## Decision

Store and transmit candidate technologies as an array of strings (`string[]`) instead of a single text block.

## Why

In the application form UI, candidates enter technologies as interactive tags (pressing Enter adds each technology).

Storing them as a structured list of strings has clear advantages:

- Gives a better UI experience with tag chips and keyboard support.
- Makes it easy to filter, search, and group candidates by specific tech stacks during the review phase.
- Avoids fragile delimiter parsing (commas, newlines, spaces) across the frontend and backend.
