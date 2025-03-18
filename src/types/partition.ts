export type PartitionResult = {
  status: 200;
  metadata: {
    filename: string;
    filetype: string;
    sizeInBytes: number;
  };
  total_characters: number;
  total_chunks: number;
  chunks: {
    id_: string;
    embedding: null;
    metadata: {
      link_texts?: string[];
      link_urls?: string[];
      languages?: string[];
      filename: string;
      filetype: string;
      sequence_number: number;
    };
    excluded_embed_metadata_keys: string[];
    excluded_llm_metadata_keys: string[];
    relationships: Record<
      string,
      {
        node_id: string;
        node_type: string;
        metadata: {
          link_texts?: string[];
          link_urls?: string[];
          languages?: string[];
          filename?: string;
          filetype?: string;
        };
        hash: string;
        class_name: string;
      }
    >;
    metadata_template: string;
    metadata_separator: string;
    text: string;
    mimetype: string;
    start_char_idx: number | null;
    end_char_idx: number | null;
    metadata_seperator: string;
    text_template: string;
    class_name: string;
  }[];
};
