import { expect, test } from "vitest";
import { makeChunk } from "../src/lib/chunk";

const chunkJson = {
  id_: "c0da893693d846d8727932f07df91db6",
  embedding: null,
  metadata: {
    languages: ["eng"],
    filename: "usul.md",
    filetype: "text/markdown",
    sequence_number: 0,
  },
  excluded_embed_metadata_keys: [],
  excluded_llm_metadata_keys: [],
  relationships: {
    "1": {
      node_id: "usul.md",
      node_type: "4",
      metadata: {
        languages: ["eng"],
        filename: "usul.md",
        filetype: "text/markdown",
      },
      hash: "356fd4ec4e5f28828231cd924e8241b5f1b0f82070cbfe251d80c8f75fa6decb",
      class_name: "RelatedNodeInfo",
    },
  },
  metadata_template: "{key}: {value}",
  metadata_separator: "\n",
  text: "Hello world\n\nThis is a test: - one - two",
  mimetype: "text/plain",
  start_char_idx: null,
  end_char_idx: null,
  metadata_seperator: "\n",
  text_template: "{metadata_str}\n\n{content}",
  class_name: "TextNode",
};

test("node parser", () => {
  const node = makeChunk({
    documentId: "aa",
    chunk: chunkJson,
    embedding: [1, 2, 3],
  });

  expect(node).toBeTruthy();
});
