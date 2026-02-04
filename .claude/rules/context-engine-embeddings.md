# Context Engine Embeddings Rules

> Embedding and search patterns for Context Engine: chunking, vector search, hybrid search.
> For high-level architecture, see: [context-engine.md](context-engine.md)
> For database patterns, see: [context-engine-database.md](context-engine-database.md)

## Core Principles

1. **Chunks should be semantically complete** — Each chunk must make sense in isolation
2. **Retrieval quality over quantity** — Better to return fewer, more relevant results
3. **Index for the query, not the document** — Structure chunks for how they'll be searched
4. **Track what you embed** — Always store model info with embeddings
5. **Hybrid beats single-mode** — Combine semantic and keyword search for best results

## Chunking Strategy

### Chunk Design Goals

| Goal               | Rationale                                                  |
| ------------------ | ---------------------------------------------------------- |
| **Self-contained** | AI can use chunk without needing full document             |
| **Focused**        | One concept per chunk for precise retrieval                |
| **Searchable**     | Contains terms users would query for                       |
| **Right-sized**    | Not too small (loses context) or large (dilutes relevance) |

### Chunk Types for Components

| Chunk Type    | Content                              | Why Separate                     |
| ------------- | ------------------------------------ | -------------------------------- |
| `description` | What the component does, when to use | High-level discovery queries     |
| `props`       | Props with types and descriptions    | Technical implementation queries |
| `examples`    | Code usage examples                  | "How do I use X" queries         |
| `patterns`    | Usage patterns and best practices    | Pattern-based queries            |
| `guidance`    | Accessibility, do's and don'ts       | Quality/correctness queries      |

### Chunk Sizing Guidelines

| Content Type   | Target Size    | Rationale            |
| -------------- | -------------- | -------------------- |
| Description    | 100-300 tokens | Complete but focused |
| Props list     | 200-500 tokens | Group related props  |
| Single example | 100-400 tokens | One complete usage   |
| Pattern        | 150-300 tokens | One concept          |

### Chunking Anti-Patterns

| Avoid                   | Why                      |
| ----------------------- | ------------------------ |
| Arbitrary length splits | Breaks semantic units    |
| Overlapping chunks      | Wastes embedding budget  |
| Metadata-only chunks    | Not searchable           |
| Giant single chunks     | Dilutes relevance signal |

## Embedding Patterns

### Embedding Model Selection

| Consideration         | Guidance                             |
| --------------------- | ------------------------------------ |
| **Dimension size**    | Higher = more nuance, more storage   |
| **Query vs document** | Some models optimize differently     |
| **Domain fit**        | Code-trained models for code content |
| **Cost vs quality**   | Balance for your scale               |

### Embedding Generation Rules

| Rule                           | Rationale                       |
| ------------------------------ | ------------------------------- |
| Batch similar content          | More efficient API usage        |
| Use query mode for searches    | Models may optimize differently |
| Use document mode for indexing | Optimized for storage           |
| Retry with backoff             | API failures happen             |
| Cache when possible            | Avoid re-embedding same text    |

### Model Version Tracking

| Store            | Purpose                    |
| ---------------- | -------------------------- |
| Provider name    | Which service generated it |
| Model identifier | Exact model version        |
| Dimensions       | Verify compatibility       |
| Timestamp        | When embedding was created |

**Why track:** Changing models requires re-indexing; tracking enables selective updates.

## Vector Search Patterns

### Similarity Search Flow

```
Query → Embed Query → Vector Search → Rank → Return Top K
                          ↓
                   Filter by org first
```

### Search Quality Factors

| Factor                  | Impact                                            |
| ----------------------- | ------------------------------------------------- |
| Query embedding quality | Garbage in, garbage out                           |
| Chunk quality           | Well-structured chunks retrieve better            |
| Index type              | HNSW for speed, exact for precision               |
| Distance metric         | Cosine for normalized, L2 for magnitude-sensitive |

### Search Parameters

| Parameter          | Tune When                              |
| ------------------ | -------------------------------------- |
| `limit`            | More results = more context but slower |
| `minScore`         | Filter low-relevance noise             |
| `ef_search` (HNSW) | Higher = better recall, slower         |

### Aggregation Patterns

| Pattern              | Use When                         |
| -------------------- | -------------------------------- |
| Max score per entity | Multiple chunks per component    |
| Mean score           | Balance multiple relevant chunks |
| First match          | Only care about best chunk       |

## Hybrid Search

### Why Hybrid

| Semantic Only        | Keyword Only         | Hybrid          |
| -------------------- | -------------------- | --------------- |
| "button for forms" ✓ | "button for forms" ~ | Best of both    |
| "DialogTrigger" ~    | "DialogTrigger" ✓    | Best of both    |
| Conceptual queries   | Exact term queries   | All query types |

### Hybrid Search Components

| Component                   | Purpose             |
| --------------------------- | ------------------- |
| Vector search (pgvector)    | Semantic similarity |
| Full-text search (tsvector) | Keyword matching    |
| Score fusion                | Combine rankings    |

### Score Fusion Methods

| Method                           | How It Works                     | When to Use                      |
| -------------------------------- | -------------------------------- | -------------------------------- |
| **RRF (Reciprocal Rank Fusion)** | `1/(k + rank)` per method, sum   | Default choice, no tuning needed |
| **Linear combination**           | `α * semantic + (1-α) * keyword` | When you want to tune weights    |
| **Max**                          | Take higher score                | When one method clearly better   |

### RRF Parameters

| Parameter | Typical Value | Effect                   |
| --------- | ------------- | ------------------------ |
| `k`       | 60            | Dampens rank differences |

**RRF Formula:** `score = Σ (1 / (k + rank_i))` across all retrieval methods

### Full-Text Search Weighting

| Weight | Use For         | Priority |
| ------ | --------------- | -------- |
| A      | Component name  | Highest  |
| B      | Description     | High     |
| C      | Props, examples | Medium   |
| D      | Other content   | Lowest   |

## Index Management

### When to Re-Index

| Trigger                   | Action                             |
| ------------------------- | ---------------------------------- |
| Component content changed | Re-embed affected component        |
| Embedding model changed   | Re-embed all (track model version) |
| Chunking strategy changed | Re-chunk and re-embed all          |
| New component added       | Embed new component only           |

### Index Health Indicators

| Metric               | Healthy | Investigate |
| -------------------- | ------- | ----------- |
| Chunks per component | 3-10    | <2 or >20   |
| Failed embeddings    | 0%      | >1%         |
| Pending queue        | Near 0  | Growing     |
| Search latency       | <100ms  | >500ms      |

## Performance Optimization

### Embedding Pipeline

| Optimization        | Benefit               |
| ------------------- | --------------------- |
| Batch API calls     | Fewer round-trips     |
| Parallel processing | Faster bulk indexing  |
| Async indexing      | Don't block main flow |
| Incremental updates | Only re-embed changed |

### Search Performance

| Optimization                | Benefit                |
| --------------------------- | ---------------------- |
| Filter before vector search | Smaller search space   |
| Use HNSW index              | O(log n) vs O(n)       |
| Limit at database level     | Don't over-fetch       |
| Cache frequent queries      | Reduce embedding calls |

## Anti-Patterns

- Embedding without chunking (giant vectors lose nuance)
- Arbitrary text splits (mid-sentence breaks)
- Ignoring model version changes (silent quality degradation)
- Searching without org filter (security + performance)
- Returning raw similarity scores to users (meaningless numbers)
- Over-relying on semantic only (misses exact matches)
- Under-utilizing keyword search (free precision boost)

## Do Not

- Embed user queries with document mode (use query mode)
- Change embedding models without re-indexing plan
- Skip score thresholds (return irrelevant noise)
- Trust embedding similarity as absolute relevance
- Ignore chunk boundaries in source content
- Mix embedding dimensions in same index
- Fetch all results then filter in application
