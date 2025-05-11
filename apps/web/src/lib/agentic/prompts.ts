export const GENERATE_QUERIES_PROMPT = `
Given a chat history, list the appropriate search queries to find answers. 

There are two apis to use: keyword search and semantic search. You should return a maximum of 10 queries.

A good keyword search query contains one (or max two) words that are key to finding the result.
`;
