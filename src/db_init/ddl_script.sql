CREATE TABLE hexagons (
  "id" SERIAL PRIMARY KEY,
  "name" varchar(255) unique,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp DEFAULT NOW()
);

CREATE TABLE hexagonneighbors (
  "id" SERIAL PRIMARY KEY,
  "border_number" integer,
  "hexagon_id" integer,
  "neighbor_hexagon_id" integer null,
  "created_at" timestamp DEFAULT NOW(),
  "updated_at" timestamp DEFAULT NOW()
);

ALTER TABLE hexagonneighbors ADD FOREIGN KEY ("hexagon_id") REFERENCES hexagons ("id");
ALTER TABLE hexagonneighbors ADD FOREIGN KEY ("neighbor_hexagon_id") REFERENCES hexagons ("id");
ALTER TABLE hexagonneighbors ADD CONSTRAINT uq_hexagon_neighbors UNIQUE (hexagon_id, neighbor_hexagon_id, border_number);
